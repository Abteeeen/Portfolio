# Builds the realistic Night desk in Blender from the three.js export and saves nightdesk.blend:
# physically based materials with CC0 textures (Poly Haven, ambientCG), the lights, the camera
# path and every moving part keyed per frame. Run with Blender's Python (pip install bpy==4.2.0):
#   python scripts/night-desk/build.py
import bpy, json, math, os, shutil
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(HERE, 'tex')
A = json.load(open(os.path.join(HERE, 'export/anim.json')))
N = A['N']

# one screen image per frame, so the laptop and phone can play as image sequences
for kind in ('laptop', 'phone'):
    d = os.path.join(HERE, 'seq', kind)
    os.makedirs(d, exist_ok=True)
    for f, fr in enumerate(A['frames']):
        shutil.copyfile(os.path.join(HERE, 'export', f"{kind}-{fr['scr'][kind]['idx']:03d}.png"), os.path.join(d, f'{f + 1:04d}.png'))

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=os.path.join(HERE, 'export/scene.glb'))
OBJ = {o.name: o for o in bpy.data.objects}

C = Matrix(((1, 0, 0, 0), (0, 0, -1, 0), (0, 1, 0, 0), (0, 0, 0, 1)))
Ci = C.inverted()


def conv_m(e):
    return C @ Matrix([[e[c * 4 + r] for c in range(4)] for r in range(4)]) @ Ci


def conv_v(v):
    return Vector((v[0], -v[2], v[1]))


def lin(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)


def rgba(c):
    return (*c, 1.0)


# ------------------------------------------------------------------ materials
def new_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    b = nt.nodes.new('ShaderNodeBsdfPrincipled')
    nt.links.new(b.outputs[0], out.inputs[0])
    return m, nt, b


def coords(nt, scale, uv=False):
    tc = nt.nodes.new('ShaderNodeTexCoord')
    mp = nt.nodes.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (scale, scale, scale)
    nt.links.new(tc.outputs['UV' if uv else 'Object'], mp.inputs['Vector'])
    return mp.outputs[0]


def image(nt, path, vec, noncolor=False, uv=False):
    n = nt.nodes.new('ShaderNodeTexImage')
    n.image = bpy.data.images.load(path, check_existing=True)
    if noncolor:
        n.image.colorspace_settings.name = 'Non-Color'
    if not uv:
        n.projection = 'BOX'
        n.projection_blend = 0.25
    nt.links.new(vec, n.inputs['Vector'])
    return n


def mix_rgb(nt, a, b, fac=1.0, blend='MULTIPLY'):
    n = nt.nodes.new('ShaderNodeMix')
    n.data_type = 'RGBA'
    n.blend_type = blend
    n.inputs[0].default_value = fac
    for sock, v in ((6, a), (7, b)):
        if isinstance(v, tuple):
            n.inputs[sock].default_value = rgba(v) if len(v) == 3 else v
        else:
            nt.links.new(v, n.inputs[sock])
    return n.outputs[2]


def pbr(name, files, scale, tint=None, rough=(0.0, 1.0), nstr=1.0, uv=False, **extra):
    """files: dict with diff / nor / rough paths. rough maps the texture into [lo, hi]."""
    m, nt, b = new_mat(name)
    vec = coords(nt, scale, uv)
    d = image(nt, files['diff'], vec, uv=uv)
    col = d.outputs['Color']
    if tint:
        col = mix_rgb(nt, col, tint)
    nt.links.new(col, b.inputs['Base Color'])
    if 'rough' in files:
        r = image(nt, files['rough'], vec, True, uv)
        mr = nt.nodes.new('ShaderNodeMapRange')
        mr.inputs['To Min'].default_value, mr.inputs['To Max'].default_value = rough
        nt.links.new(r.outputs['Color'], mr.inputs['Value'])
        nt.links.new(mr.outputs[0], b.inputs['Roughness'])
    if 'nor' in files:
        nimg = image(nt, files['nor'], vec, True, uv)
        nm = nt.nodes.new('ShaderNodeNormalMap')
        nm.inputs['Strength'].default_value = nstr
        nt.links.new(nimg.outputs['Color'], nm.inputs['Color'])
        nt.links.new(nm.outputs[0], b.inputs['Normal'])
    for k, v in extra.items():
        b.inputs[k].default_value = v
    return m


def plain(name, color, rough=0.5, metal=0.0, **extra):
    m, nt, b = new_mat(name)
    b.inputs['Base Color'].default_value = rgba(color)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    for k, v in extra.items():
        b.inputs[k].default_value = v
    return m, nt, b


def fine_bump(nt, b, scale=300.0, strength=0.06, detail=6.0):
    n = nt.nodes.new('ShaderNodeTexNoise')
    n.inputs['Scale'].default_value = scale
    n.inputs['Detail'].default_value = detail
    bp = nt.nodes.new('ShaderNodeBump')
    bp.inputs['Strength'].default_value = strength
    nt.links.new(n.outputs['Fac'], bp.inputs['Height'])
    nt.links.new(bp.outputs[0], b.inputs['Normal'])
    return bp


def emissive(name, color=None, img=None, strength=1.0, seq=False):
    m, nt, b = new_mat(name)
    b.inputs['Base Color'].default_value = (0.005, 0.005, 0.005, 1)
    b.inputs['Roughness'].default_value = 0.08
    b.inputs['Emission Strength'].default_value = strength
    if img is not None:
        t = nt.nodes.new('ShaderNodeTexImage')
        t.image = img
        tc = nt.nodes.new('ShaderNodeTexCoord')
        mp = nt.nodes.new('ShaderNodeMapping')
        mp.inputs['Scale'].default_value = (1.0, -1.0, 1.0)
        mp.inputs['Location'].default_value = (0.0, 1.0, 0.0)
        nt.links.new(tc.outputs['UV'], mp.inputs['Vector'])
        nt.links.new(mp.outputs[0], t.inputs['Vector'])
        if seq:
            t.image_user.frame_duration = N
            t.image_user.frame_start = 1
            t.image_user.use_auto_refresh = True
        nt.links.new(t.outputs['Color'], b.inputs['Emission Color'])
    else:
        b.inputs['Emission Color'].default_value = rgba(color)
    return m


def paper(name, img, paper_col, text_col, rough=0.78):
    """Card stock: the exported canvas is a mask, white paper and dark print."""
    m, nt, b = new_mat(name)
    t = nt.nodes.new('ShaderNodeTexImage')
    t.image = img
    t.interpolation = 'Cubic'
    bw = nt.nodes.new('ShaderNodeRGBToBW')
    nt.links.new(t.outputs['Color'], bw.inputs[0])
    pc = nt.nodes.new('ShaderNodeRGB'); pc.name = 'paper'
    pc.outputs[0].default_value = rgba(paper_col)
    tc = nt.nodes.new('ShaderNodeRGB'); tc.name = 'print'
    tc.outputs[0].default_value = rgba(text_col)
    mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'
    nt.links.new(bw.outputs[0], mx.inputs[0])
    nt.links.new(tc.outputs[0], mx.inputs[6])
    nt.links.new(pc.outputs[0], mx.inputs[7])
    nt.links.new(mx.outputs[2], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = rough
    b.inputs['Sheen Weight'].default_value = 0.15
    fine_bump(nt, b, 520.0, 0.04)
    return m


def first_image(mat):
    for n in mat.node_tree.nodes:
        if n.type == 'TEX_IMAGE' and n.image:
            return n.image
    return None


PH = lambda slug: {k: os.path.join(TEX, slug, f'{k}.jpg') for k in ('diff', 'nor', 'rough')}
CORK = {'diff': f'{TEX}/cork/Cork003_2K-JPG_Color.jpg', 'nor': f'{TEX}/cork/Cork003_2K-JPG_NormalGL.jpg', 'rough': f'{TEX}/cork/Cork003_2K-JPG_Roughness.jpg'}

M = {}
M['floor'] = pbr('floor', PH('laminate_floor_02'), 0.55, tint=(0.62, 0.55, 0.5), rough=(0.25, 0.6), nstr=0.8)
M['wall'] = pbr('wall', PH('white_plaster_02'), 0.9, tint=(0.62, 0.6, 0.57), rough=(0.7, 0.95), nstr=0.5)
M['desk'] = pbr('desk', PH('oak_veneer_01'), 1.1, tint=(0.95, 0.88, 0.8), rough=(0.28, 0.5), nstr=0.35)
M['cork'] = pbr('cork', CORK, 2.4, tint=(0.62, 0.5, 0.4), rough=(0.8, 1.0), nstr=1.2)
M['chair'] = pbr('chair', PH('poly_wool_herringbone'), 9.0, tint=(0.05, 0.05, 0.055), rough=(0.75, 0.95), nstr=0.8)
M['tee'] = pbr('tee', PH('cotton_jersey'), 14.0, tint=(0.075, 0.078, 0.09), rough=(0.75, 0.95), nstr=0.7, **{'Sheen Weight': 0.6, 'Sheen Roughness': 0.4})
M['jeans'] = pbr('jeans', PH('denim_fabric'), 9.0, tint=(0.45, 0.5, 0.65), rough=(0.7, 0.95), nstr=0.8, **{'Sheen Weight': 0.3})
M['paint_white'] = plain('paint_white', (0.62, 0.6, 0.56), 0.35)[0]
M['black_metal'] = plain('black_metal', (0.012, 0.012, 0.013), 0.42, 0.6)[0]
M['black_wood'] = plain('black_wood', (0.012, 0.011, 0.01), 0.55)[0]
M['alu'] = plain('alu', (0.72, 0.72, 0.74), 0.28, 1.0)[0]
M['pad'] = plain('trackpad', (0.6, 0.6, 0.62), 0.18, 1.0)[0]
M['bezel'] = plain('bezel', (0.004, 0.004, 0.005), 0.04, **{'Coat Weight': 1.0})[0]
M['phone'] = plain('phone', (0.01, 0.01, 0.012), 0.12, 0.3)[0]
M['nbcover'] = plain('nbcover', (0.015, 0.015, 0.016), 0.6)[0]
M['coffee'] = plain('coffee', (0.03, 0.012, 0.005), 0.05, **{'Coat Weight': 0.6})[0]
M['mug'] = plain('mug', (0.7, 0.66, 0.58), 0.12, **{'Coat Weight': 0.8})[0]
M['pot'] = plain('pot', (0.55, 0.52, 0.47), 0.7)[0]
M['soil'] = plain('soil', (0.02, 0.015, 0.01), 0.95)[0]
M['stem'] = plain('stem', (0.04, 0.07, 0.02), 0.5)[0]
M['leaf'] = plain('leaf', (0.035, 0.075, 0.025), 0.4, **{'Coat Weight': 0.3})[0]
M['yellow_paint'] = plain('yellow_paint', lin('#ffe94d'), 0.35)[0]
M['phones'] = plain('phones', lin('#f5d63a'), 0.28, **{'Coat Weight': 0.5})[0]
M['shoes'] = plain('shoes', (0.72, 0.7, 0.66), 0.7, **{'Sheen Weight': 0.3})[0]
for key, col in (('book_black', (0.015, 0.015, 0.017)), ('book_yellow', lin('#e8c52c')), ('book_cream', (0.62, 0.57, 0.48))):
    m, nt, b = plain(key, col, 0.7)
    fine_bump(nt, b, 180.0, 0.1)
    M[key] = m
m, nt, b = plain('keys', (0.02, 0.02, 0.022), 0.5)
M['keys'] = m
m, nt, b = plain('skin', lin('#94644a'), 0.55, **{'Subsurface Weight': 0.3, 'Subsurface Scale': 0.01, 'Specular IOR Level': 0.28})
b.inputs['Subsurface Radius'].default_value = (1.0, 0.36, 0.2)
fine_bump(nt, b, 900.0, 0.035, 8.0)
M['skin'] = m
m, nt, b = plain('scalp', (0.0035, 0.0028, 0.0022), 0.42, **{'Specular IOR Level': 0.38})
# short cropped hair: fine noise stretched along the strands
hz = nt.nodes.new('ShaderNodeTexNoise'); hz.inputs['Scale'].default_value = 900.0; hz.inputs['Detail'].default_value = 3.0
hm = nt.nodes.new('ShaderNodeMapping'); hm.inputs['Scale'].default_value = (1.0, 1.0, 0.18)
htc = nt.nodes.new('ShaderNodeTexCoord'); nt.links.new(htc.outputs['Object'], hm.inputs['Vector']); nt.links.new(hm.outputs[0], hz.inputs['Vector'])
hbp = nt.nodes.new('ShaderNodeBump'); hbp.inputs['Strength'].default_value = 0.45
nt.links.new(hz.outputs['Fac'], hbp.inputs['Height']); nt.links.new(hbp.outputs[0], b.inputs['Normal'])
M['scalp'] = m  # cropped hair: a dark sheen over fine strand bumps
SEQ = {}
for kind in ('laptop', 'phone'):
    img = bpy.data.images.load(os.path.join(HERE, f'seq/{kind}/0001.png'))
    img.source = 'SEQUENCE'
    SEQ[kind] = img
M['screen'] = emissive('screen', img=SEQ['laptop'], strength=2.2, seq=True)
M['phonescreen'] = emissive('phonescreen', img=SEQ['phone'], strength=1.6, seq=True)
M['bulb'] = emissive('bulb', lin('#fff1d0'), strength=40.0)
M['led'] = emissive('led', lin('#fff4c2'), strength=12.0)
M['moon'] = emissive('moon', lin('#ebe5d6'), strength=6.0)
M['lit_y'] = emissive('lit_y', lin('#ffcf6a'), strength=3.0)
M['lit_c'] = emissive('lit_c', lin('#ebe5d6'), strength=2.0)
M['hill'] = emissive('hill', (0.002, 0.002, 0.003), strength=1.0)
M['palm'] = emissive('palm', (0.001, 0.001, 0.0012), strength=1.0)

# material ids follow the order export.html names them in (m0 floor, m1 wall ...); if the scene
# gains or loses materials, list them again and update this table
BY_ID = {
    'm0': 'floor', 'm1': 'wall', 'm2': 'paint_white', 'm4': 'paint_white', 'm3': 'black_metal', 'm6': 'moon', 'm7': 'hill',
    'm8': 'lit_y', 'm9': 'lit_c', 'm10': 'palm', 'm11': 'desk', 'm12': 'black_metal', 'm13': 'black_metal', 'm14': 'black_metal',
    'm15': 'black_metal', 'm16': 'black_metal', 'm17': 'black_metal', 'm18': 'alu', 'm19': 'keys', 'm20': 'pad', 'm21': 'bezel',
    'm22': 'screen', 'm23': 'phone', 'm24': 'phonescreen', 'm25': 'nbcover', 'm27': 'yellow_paint', 'm28': 'black_metal',
    'm29': 'black_metal', 'm30': 'bulb', 'm31': 'mug', 'm32': 'coffee', 'm33': 'book_black', 'm34': 'book_yellow',
    'm35': 'book_cream', 'm36': 'chair', 'm37': 'tee', 'm38': 'skin', 'm39': 'phones', 'm40': 'scalp', 'm41': 'jeans',
    'm42': 'shoes', 'm43': 'pot', 'm44': 'pot', 'm45': 'soil', 'm46': 'stem', 'm47': 'leaf', 'm48': 'cork', 'm49': 'black_wood',
    'm50': 'black_metal', 'm51': 'led',
}
PAPER = (0.8, 0.76, 0.66)
PRINT = (0.012, 0.012, 0.012)
YEL = lin('#ffe066')
YEL_PRINT = lin('#1c1904')
ANIM_MATS = {}  # original material name -> new material (for per-frame colour keys)
cache = {}
for o in list(bpy.data.objects):
    if o.type != 'MESH':
        continue
    for slot in o.material_slots:
        old = slot.material
        if not old:
            continue
        mid = old.name.split('|')[0]
        if '|' not in old.name:
            continue
        if old.name in cache:
            slot.material = cache[old.name]
            continue
        parts = old.name.split('|')
        new = None
        if mid in BY_ID:
            new = M[BY_ID[mid]]
        elif mid == 'm5':  # sky
            new = emissive('sky', img=first_image(old), strength=0.35)
        elif mid == 'm26':  # notebook pages
            new = paper('nbpage', first_image(old), (0.78, 0.75, 0.68), (0.05, 0.05, 0.06))
        elif parts[-1].startswith('map'):  # cards
            lit = parts[2]
            yellow = lit.lower() == '#ffe94d'
            new = paper('card_' + mid, first_image(old), YEL if yellow else PAPER, YEL_PRINT if yellow else PRINT)
        elif parts[1] == 'tone' and parts[2] == '#4d4d54':  # push pins
            pm, nt, b = plain('pin_' + mid, (0.02, 0.02, 0.022), 0.18, **{'Coat Weight': 1.0, 'Coat Roughness': 0.05})
            new = pm
        else:
            print('UNMAPPED', old.name, o.name)
            continue
        cache[old.name] = new
        slot.material = new
        if old.name in A['frames'][0]['mat']:
            ANIM_MATS[old.name] = new
    for p in o.data.polygons:
        p.use_smooth = True
# flat faces for the boxes stay crisp: auto smooth by angle
for o in bpy.data.objects:
    if o.type == 'MESH' and len(o.data.polygons) < 400:
        for p in o.data.polygons:
            p.use_smooth = False

# ---------------------------------------------------------------- threads
YARN = plain('yarn', lin('#ffd84a'), 0.6, **{'Sheen Weight': 1.0, 'Emission Color': rgba(lin('#ffd84a')), 'Emission Strength': 0.15})[0]
THREADS = []
for t in A['threads']:
    cu = bpy.data.curves.new(t['name'] + '_c', 'CURVE')
    cu.dimensions = '3D'
    sp = cu.splines.new('POLY')
    sp.points.add(len(t['pts']) - 1)
    for i, p in enumerate(t['pts']):
        v = conv_v(p)
        sp.points[i].co = (v.x, v.y, v.z, 1)
    cu.bevel_depth = t['r'] * 1.15
    cu.bevel_resolution = 3
    cu.use_fill_caps = True
    ob = bpy.data.objects.new(t['name'] + '_yarn', cu)
    ob.data.materials.append(YARN)
    sc.collection.objects.link(ob)
    THREADS.append(ob)

# ---------------------------------------------------------------- animation
FR = A['frames']
animated = list(FR[0]['mw'].keys())
missing = [n for n in animated if n not in OBJ]
print('missing animated', missing[:8])
for n in animated:
    o = OBJ.get(n)
    if not o:
        continue
    mw = o.matrix_world.copy()
    o.parent = None
    o.matrix_world = mw
    o.rotation_mode = 'QUATERNION'
vis_anim = set(FR[0]['vis'].keys())
for n, v in A['f0vis'].items():
    o = OBJ.get(n)
    if o and not v and n not in vis_anim:
        o.hide_render = True
        o.hide_viewport = True

cam_d = bpy.data.cameras.new('cam')
cam_d.sensor_fit = 'VERTICAL'
cam_d.sensor_height = 24.0
cam_d.dof.use_dof = True
cam = bpy.data.objects.new('cam', cam_d)
sc.collection.objects.link(cam)
sc.camera = cam

for f, fr in enumerate(FR):
    fi = f + 1
    for n in animated:
        o = OBJ.get(n)
        if not o:
            continue
        o.matrix_world = conv_m(fr['mw'][n])
        o.keyframe_insert('location', frame=fi)
        o.keyframe_insert('rotation_quaternion', frame=fi)
        o.keyframe_insert('scale', frame=fi)
    for n, v in fr['vis'].items():
        o = OBJ.get(n)
        if not o:
            continue
        o.hide_render = not v
        o.keyframe_insert('hide_render', frame=fi)
    for n, cols in fr['mat'].items():
        m = ANIM_MATS.get(n)
        if not m:
            continue
        lit, shade = lin(cols[0]), lin(cols[2])
        nodes = m.node_tree.nodes
        if 'paper' in nodes:
            k = min(1.0, max(0.0, (lit[2] - lin('#f4efe3')[2]) / (lin('#ffe94d')[2] - lin('#f4efe3')[2])))
            pc = [PAPER[i] + (YEL[i] - PAPER[i]) * k for i in range(3)]
            tc = [PRINT[i] + (YEL_PRINT[i] - PRINT[i]) * k for i in range(3)]
            nodes['paper'].outputs[0].default_value = rgba(tuple(pc))
            nodes['print'].outputs[0].default_value = rgba(tuple(tc))
            nodes['paper'].outputs[0].keyframe_insert('default_value', frame=fi)
            nodes['print'].outputs[0].keyframe_insert('default_value', frame=fi)
        else:
            b = nodes['Principled BSDF']
            b.inputs['Base Color'].default_value = rgba(tuple(min(1, c * 0.95) for c in lit))
            b.inputs['Base Color'].keyframe_insert('default_value', frame=fi)
    for k, ob in enumerate(THREADS):
        frac = fr['thr'][k]
        ob.data.bevel_factor_end = max(0.0001, frac)
        ob.data.keyframe_insert('bevel_factor_end', frame=fi)
        ob.hide_render = frac < 0.002
        ob.keyframe_insert('hide_render', frame=fi)
    pos, look = conv_v(fr['cam']['pos']), conv_v(fr['cam']['look'])
    cam.location = pos
    cam.rotation_euler = (look - pos).to_track_quat('-Z', 'Y').to_euler()
    cam.keyframe_insert('location', frame=fi)
    cam.keyframe_insert('rotation_euler', frame=fi)
    fov = math.radians(fr['cam']['fov'])
    cam_d.lens = 12.0 / math.tan(fov / 2)
    cam_d.keyframe_insert('lens', frame=fi)
    dist = (look - pos).length
    cam_d.dof.focus_distance = dist
    cam_d.dof.aperture_fstop = min(8.0, max(2.2, dist * 1.8))
    cam_d.dof.keyframe_insert('focus_distance', frame=fi)
    cam_d.dof.keyframe_insert('aperture_fstop', frame=fi)

for ad in [o.animation_data for o in bpy.data.objects] + [m.node_tree.animation_data for m in bpy.data.materials if m.node_tree] + [c.animation_data for c in bpy.data.curves] + [cam_d.animation_data]:
    if ad and ad.action:
        for fc in ad.action.fcurves:
            for kp in fc.keyframe_points:
                kp.interpolation = 'CONSTANT'

# ---------------------------------------------------------------- lights
L = {l['name']: l for l in A['lights']}


def spot(name, info, watts, color, radius=0.03, size_mul=2.0):
    d = bpy.data.lights.new(name, 'SPOT')
    d.energy = watts
    d.color = color
    d.spot_size = min(math.pi, info['angle'] * size_mul)
    d.spot_blend = 0.6
    d.shadow_soft_size = radius
    o = bpy.data.objects.new(name, d)
    sc.collection.objects.link(o)
    p, t = conv_v(info['pos']), conv_v(info['target'])
    o.location = p
    o.rotation_euler = (t - p).to_track_quat('-Z', 'Y').to_euler()
    return o


spot('lamp', L['n226'], 14.0, (1.0, 0.74, 0.47), 0.025)
spot('board_l', L['n228'], 9.0, (1.0, 0.86, 0.68), 0.04)
spot('board_r', L['n230'], 9.0, (1.0, 0.86, 0.68), 0.04)
moon = L['n224']
sd = bpy.data.lights.new('moon', 'SUN')
sd.energy = 0.55
sd.color = (0.62, 0.72, 1.0)
sd.angle = math.radians(1.2)
so = bpy.data.objects.new('moon', sd)
sc.collection.objects.link(so)
p, t = conv_v(moon['pos']), conv_v(moon['target'])
so.rotation_euler = (t - p).to_track_quat('-Z', 'Y').to_euler()
# skylight spilling through the window
ad = bpy.data.lights.new('window', 'AREA')
ad.shape = 'RECTANGLE'
ad.size, ad.size_y = 1.35, 1.25
ad.energy = 18.0
ad.color = (0.55, 0.66, 1.0)
ao = bpy.data.objects.new('window', ad)
sc.collection.objects.link(ao)
ao.location = conv_v([1.86, 1.625, 0.0])
ao.rotation_euler = (conv_v([0.0, 1.2, 0.0]) - ao.location).to_track_quat('-Z', 'Y').to_euler()
# the laptop screen washes the face and hands
scr = bpy.data.lights.new('screenwash', 'AREA')
scr.size, scr.size_y = 0.3, 0.2
scr.shape = 'RECTANGLE'
scr.energy = 1.2
scr.color = (0.78, 0.84, 1.0)
sco = bpy.data.objects.new('screenwash', scr)
sc.collection.objects.link(sco)
sco.location = conv_v([0.0, 0.9, -0.66])
sco.rotation_euler = (conv_v([0.0, 1.05, 0.2]) - sco.location).to_track_quat('-Z', 'Y').to_euler()

w = bpy.data.worlds.new('night')
sc.world = w
w.use_nodes = True
w.node_tree.nodes['Background'].inputs[0].default_value = (0.0035, 0.0045, 0.009, 1)

# ---------------------------------------------------------------- render
sc.render.engine = 'CYCLES'
cy = sc.cycles
cy.device = 'CPU'
cy.samples = 32
cy.use_adaptive_sampling = True
cy.adaptive_threshold = 0.03
cy.use_denoising = True
cy.denoiser = 'OPENIMAGEDENOISE'
cy.denoising_input_passes = 'RGB_ALBEDO_NORMAL'
cy.max_bounces = 6
cy.diffuse_bounces = 2
cy.glossy_bounces = 2
cy.transmission_bounces = 4
cy.transparent_max_bounces = 8
cy.caustics_reflective = False
cy.caustics_refractive = False
cy.blur_glossy = 1.0
sc.render.use_persistent_data = True
sc.render.resolution_x, sc.render.resolution_y = 1280, 800
sc.render.resolution_percentage = 100
sc.frame_start, sc.frame_end = 1, N
sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_depth = '8'
sc.view_settings.view_transform = 'AgX'
for look in ('AgX - Medium High Contrast', 'AgX - Base Contrast', 'None'):
    try:
        sc.view_settings.look = look
        break
    except TypeError:
        pass
sc.view_settings.exposure = 0.5

# compositor: bloom, a gentle teal/amber grade, a touch of lens, vignette
sc.use_nodes = False  # the grade, bloom and vignette happen in post.py

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'nightdesk.blend'))
print('saved; animated', len(animated), 'anim mats', len(ANIM_MATS), 'threads', len(THREADS))
