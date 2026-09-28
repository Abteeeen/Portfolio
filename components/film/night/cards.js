/** Card and screen artwork for the Night desk scene. Drawn black on white; the print
 *  materials turn that into ink on paper, or ink on yellow. */
import { canvasTex, rr, wrap, FONT } from './engine.js';

export function drawUpdateCard(g, w, h, u) {
  g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#000';
  g.font = `600 21px ${FONT.mono}`;
  g.fillText(u.src, 24, 48);
  g.font = `500 19px ${FONT.mono}`;
  g.fillText(u.time, w - 24 - g.measureText(u.time).width, 48);
  g.fillRect(24, 64, w - 48, 2);
  g.font = `700 33px ${FONT.sans}`;
  wrap(g, u.t, 24, 112, w - 48, 38, 3);
}

export function drawProblemCard(g, w, h, pr) {
  g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#000';
  g.font = `600 20px ${FONT.mono}`;
  g.fillText(pr.who, 24, 44);
  g.fillRect(24, 58, w - 48, 2);
  g.font = `400 38px ${FONT.serif}`;
  wrap(g, `“${pr.q}”`, 24, 108, w - 48, 44, 3);
}

export function drawResultCard(g, w, h, pr) {
  g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#000';
  g.lineWidth = 6; g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = '#000';
  g.beginPath(); g.moveTo(26, 40); g.lineTo(38, 54); g.lineTo(62, 26); g.stroke();
  g.font = `600 20px ${FONT.mono}`;
  g.fillText('RESULT', 78, 48);
  g.font = `700 31px ${FONT.sans}`;
  wrap(g, pr.r, 24, 108, w - 48, 37, 3);
}

export function drawLabelCard(g, w, h, txt) {
  g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#000';
  g.font = `700 34px ${FONT.mono}`;
  const tw = g.measureText(txt).width;
  g.fillText(txt, (w - tw) / 2, h / 2 + 12);
}

export function keysTexture() {
  return canvasTex(512, 206, (g, w, h) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff';
    const rows = 5, cols = 14, kw = w / cols, kh = h / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r === 4 && c > 3 && c < 10) continue;
        rr(g, c * kw + 3, r * kh + 3, kw - 6, kh - 6, 4); g.fill();
      }
    }
    rr(g, 4 * kw + 3, 4 * kh + 3, 6 * kw - 6, kh - 6, 4); g.fill();
  }).tex;
}
