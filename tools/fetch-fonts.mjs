/* ============================================================
   fetch-fonts.mjs — self-host the Google Fonts this site uses.

     node tools/fetch-fonts.mjs

   Asks Google Fonts for the stylesheet exactly as a current Chrome
   would get it (woff2, split by unicode-range), downloads every file
   it points at into fonts/, and writes css/fonts.css with the same
   @font-face rules pointing at those copies. Same files, same rules,
   same order, so the page renders exactly as it did from Google; it
   just no longer needs two extra origins before the first paint.

   Only run it again to change FAMILIES. The weights are trimmed to
   what the page actually resolves to: 550 lands on 600, and nothing
   in the display or sans stacks asks for 500 (Mono does).
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FAMILIES =
  'family=Schibsted+Grotesk:wght@600;700' +
  '&family=IBM+Plex+Sans:wght@400;600;700' +
  '&family=IBM+Plex+Sans+KR:wght@400;600;700' +
  '&family=IBM+Plex+Sans+JP:wght@400;600;700' +
  '&family=IBM+Plex+Mono:wght@400;500;600' +
  '&display=swap';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

const res = await fetch('https://fonts.googleapis.com/css2?' + FAMILIES, { headers: { 'User-Agent': UA } });
if (!res.ok) throw new Error('Google Fonts CSS: ' + res.status);
const css = await res.text();

// https://fonts.gstatic.com/s/<family>/<version>/<file>.woff2  ->  fonts/<family>/<file>.woff2
const urls = [...new Set([...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/s\/([^/]+)\/[^/]+\/([^)]+))\)/g)].map((m) => m[1]))];
const local = (u) => {
  const m = u.match(/\/s\/([^/]+)\/[^/]+\/([^)]+)$/);
  return 'fonts/' + m[1] + '/' + m[2];
};

fs.rmSync(path.join(ROOT, 'fonts'), { recursive: true, force: true });
let done = 0;
const queue = urls.slice();
async function worker() {
  while (queue.length) {
    const u = queue.shift();
    const r = await fetch(u, { headers: { 'User-Agent': UA } });
    if (!r.ok) throw new Error(u + ': ' + r.status);
    const p = path.join(ROOT, local(u));
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, Buffer.from(await r.arrayBuffer()));
    done++;
  }
}
await Promise.all(Array.from({ length: 12 }, worker));

const header =
  '/* Self-hosted copy of the Google Fonts stylesheet, written by\n' +
  '   tools/fetch-fonts.mjs. Do not edit by hand: change FAMILIES there\n' +
  '   and run it again. Font files are under /fonts/. */\n\n';
const out = header + css.replace(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g, (m, u) => 'url(../' + local(u) + ')');
fs.writeFileSync(path.join(ROOT, 'css/fonts.css'), out);
console.log('fonts: ' + done + ' files, css/fonts.css: ' + (css.match(/@font-face/g) || []).length + ' faces');
