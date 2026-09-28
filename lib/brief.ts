export type Segment = { text: string; mark: boolean };

/** Splits "a [[b]] c" into segments, marking the bracketed phrases. */
export function parseBrief(brief: string): Segment[] {
  const out: Segment[] = [];
  const re = /\[\[(.+?)\]\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(brief))) {
    if (m.index > last) out.push({ text: brief.slice(last, m.index), mark: false });
    out.push({ text: m[1], mark: true });
    last = m.index + m[0].length;
  }
  if (last < brief.length) out.push({ text: brief.slice(last), mark: false });
  return out;
}

/** Brief text with the brackets removed, for places that cannot render marks. */
export function plainBrief(brief: string): string {
  return brief.replace(/\[\[(.+?)\]\]/g, "$1");
}
