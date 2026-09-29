// Writes export/night.json (the words on the cards and screens) from content/film.ts.
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, '../..');
const tmp = path.join(here, 'export');
fs.mkdirSync(tmp, { recursive: true });
for (const f of ['film', 'site']) {
  const src = fs.readFileSync(path.join(root, 'content', f + '.ts'), 'utf8');
  const out = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ES2020, target: ts.ScriptTarget.ES2020 } }).outputText;
  fs.writeFileSync(path.join(tmp, f + '.mjs'), out.replace(/from "\.\/site"/g, 'from "./site.mjs"'));
}
const { night } = await import(path.join(tmp, 'film.mjs'));
fs.writeFileSync(path.join(tmp, 'night.json'), JSON.stringify(night));
console.log('wrote export/night.json');
