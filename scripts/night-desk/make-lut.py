"""Writes night-desk.cube, the colour grade for the Night desk frames: a gentle S-curve, cool
shadows, warm highlights, a slightly milky black, and saturation eased off everywhere except
the site's yellow. Apply it with ffmpeg's lut3d filter (see README)."""
import numpy as np, os

N = 33
v = np.linspace(0, 1, N)
b, g, r = np.meshgrid(v, v, v, indexing='ij')  # .cube order: red changes fastest
rgb = np.stack([r, g, b], -1).reshape(-1, 3)

lum = rgb @ np.array([0.2126, 0.7152, 0.0722])
# mild S-curve around the mid grey
def curve(x):
    return x + 0.10 * np.sin((x - 0.5) * np.pi) * x * (1 - x) * 2
# lift the mids a touch so the man reads against the dark room
out = curve(rgb ** 0.93)
# cool shadows, warm highlights
sh = (1 - lum)[:, None] ** 3
hi = lum[:, None] ** 2
out = out + sh * np.array([-0.012, 0.004, 0.022])
out = out * (1 + hi * np.array([0.03, 0.005, -0.035]))
# ease saturation, but keep the yellow of the brand
yellow = np.clip((np.minimum(rgb[:, 0], rgb[:, 1]) - rgb[:, 2] - 0.18) * 4, 0, 1)[:, None]
l2 = (out @ np.array([0.2126, 0.7152, 0.0722]))[:, None]
sat = 0.9 + 0.12 * yellow
out = l2 + (out - l2) * sat
# a slightly milky black, like film
out = 0.014 + out * (1 - 0.014)
out = np.clip(out, 0, 1)

path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'night-desk.cube')
with open(path, 'w') as f:
    f.write('TITLE "Night desk"\nLUT_3D_SIZE 33\nDOMAIN_MIN 0 0 0\nDOMAIN_MAX 1 1 1\n')
    for row in out:
        f.write(f'{row[0]:.6f} {row[1]:.6f} {row[2]:.6f}\n')
print('wrote', path)
