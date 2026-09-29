# Renders frames from nightdesk.blend. Usage: python render.py OUTDIR W H SAMPLES FRAMES
# FRAMES is a list (1,3,5) or a range (1-180). Frames already rendered are skipped.
import bpy, sys, os, time
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
out, W, H, S, frames = argv[0], int(argv[1]), int(argv[2]), int(argv[3]), argv[4]
HERE = os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.open_mainfile(filepath=os.path.join(HERE, 'nightdesk.blend'))
sc = bpy.context.scene
sc.render.resolution_x, sc.render.resolution_y = W, H
sc.cycles.samples = S
os.makedirs(out, exist_ok=True)
if '-' in frames:
    a, b = map(int, frames.split('-')); fl = list(range(a, b + 1))
else:
    fl = [int(x) for x in frames.split(',')]
for f in fl:
    path = os.path.join(out, f'{f:04d}.png')
    if os.path.exists(path) and os.path.getsize(path) > 0 and os.environ.get('SKIP', '1') == '1':
        continue
    sc.frame_set(f)
    sc.render.filepath = path
    t = time.time()
    bpy.ops.render.render(write_still=True)
    print(f'frame {f} {time.time() - t:.1f}s', flush=True)
