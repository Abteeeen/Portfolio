"""Downloads the CC0 textures build.py uses into tex/: Poly Haven (floor, plaster, oak, jersey,
denim, wool) and ambientCG (cork)."""
import io, json, os, urllib.request, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(HERE, 'tex')
get = lambda url: urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'night-desk'}), timeout=60).read()
for slug, res in {'laminate_floor_02': '2k', 'white_plaster_02': '1k', 'oak_veneer_01': '2k', 'cotton_jersey': '1k',
                  'denim_fabric': '1k', 'poly_wool_herringbone': '1k'}.items():
    files = json.loads(get(f'https://api.polyhaven.com/files/{slug}'))
    os.makedirs(os.path.join(TEX, slug), exist_ok=True)
    for key, name in (('Diffuse', 'diff'), ('nor_gl', 'nor'), ('Rough', 'rough')):
        f = files[key][res]['jpg']
        open(os.path.join(TEX, slug, f'{name}.jpg'), 'wb').write(get(f['url']))
    print('ok', slug)
z = zipfile.ZipFile(io.BytesIO(get('https://ambientcg.com/get?file=Cork003_2K-JPG.zip')))
z.extractall(os.path.join(TEX, 'cork'))
print('ok cork')
