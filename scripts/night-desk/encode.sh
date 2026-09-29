#!/usr/bin/env bash
# Grades the rendered PNGs with night-desk.cube and a soft vignette, writes the WebP frames the
# site scrubs through, and the two posters that show before the frames load.
#   scripts/night-desk/encode.sh [ffmpeg]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$HERE/../.."
FF="${1:-ffmpeg}"
OUT="$ROOT/public/hero/frames"
mkdir -p "$OUT"
GRADE="lut3d=$HERE/night-desk.cube,vignette=angle=0.32"
for f in "$HERE"/frames/*.png; do
  n="$(basename "$f" .png)"
  "$FF" -hide_banner -loglevel error -y -i "$f" -vf "$GRADE" -c:v libwebp -quality 74 -compression_level 6 "$OUT/$n.webp"
done
# posters: the first frame, and its middle for phones (the part the phone layout shows)
"$FF" -hide_banner -loglevel error -y -i "$HERE/frames/0001.png" -vf "$GRADE" -q:v 3 "$ROOT/public/hero/night-desk.jpg"
"$FF" -hide_banner -loglevel error -y -i "$HERE/frames/0001.png" -vf "$GRADE,crop=576:720:288:0" -q:v 3 "$ROOT/public/hero/night-desk-portrait.jpg"
echo "wrote $(ls "$OUT" | wc -l) frames"
