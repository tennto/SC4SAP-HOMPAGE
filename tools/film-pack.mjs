/* ============================================================
   film-pack.mjs — packs the film's frames into a few files.

     node tools/film-pack.mjs

   The film is 1,284 frames. Fetched one by one, each costs a round
   trip to the server (0.2 to 0.4 s measured from Korea, where
   sc4sap.dev is answered from Los Angeles), and the frames came in
   slower than the film plays. So the frames in assets/scroll-film/d
   are joined, in order, into packs of about 1 MB in
   assets/scroll-film/p (00.bin, 01.bin, ...), and js/scroll-film.js
   cuts each frame back out by its size as the pack streams in.

   This writes into js/scroll-film.js, between their markers:
     FRAME_BYTES  each frame's size in bytes  (sizes:start/end)
     PACKS        each pack's first frame     (packs:start/end)

   Run it whenever the frames in assets/scroll-film/d change, and
   raise FRAMES_VERSION (and the ?v= in the head script of the three
   index.html sources). Running it twice changes nothing.

   The d frames stay: a page opened as a file (file://) cannot fetch,
   and loads them one by one instead; the film's still images use
   them too.
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'assets/scroll-film/d');
const OUT = path.join(ROOT, 'assets/scroll-film/p');
const JS = path.join(ROOT, 'js/scroll-film.js');
/* The first pack is small, so its round trip is over quickly and the
   head script's preload of it is light; the rest about 1 MB. */
const FIRST_PACK = 256 * 1024;
const PACK = 1024 * 1024;

const files = fs.readdirSync(DIR).filter((f) => /^\d{4}\.webp$/.test(f)).sort();
files.forEach((f, i) => {
  if (f !== String(i + 1).padStart(4, '0') + '.webp') throw new Error('frame missing before ' + f);
});
const data = files.map((f) => fs.readFileSync(path.join(DIR, f)));
const sizes = data.map((b) => b.length);

const packs = [0];
let fill = 0;
sizes.forEach((s, i) => {
  const limit = packs.length === 1 ? FIRST_PACK : PACK;
  if (fill > 0 && fill + s > limit) { packs.push(i); fill = 0; }
  fill += s;
});

let src = fs.readFileSync(JS, 'utf8');
const frames = /var FRAMES = (\d+);/.exec(src);
if (!frames || +frames[1] !== files.length) throw new Error(`FRAMES is ${frames && frames[1]}, but there are ${files.length} frames`);
function put(name, list) {
  const re = new RegExp(String.raw`(/\* ${name}:start \*/)[\s\S]*?(/\* ${name}:end \*/)`);
  if (!re.test(src)) throw new Error(`${name} markers not found in js/scroll-film.js`);
  src = src.replace(re, `$1[${list.join(',')}]$2`);
}
put('sizes', sizes);
put('packs', packs);

fs.mkdirSync(OUT, { recursive: true });
const want = new Set();
let changed = 0;
packs.forEach((from, k) => {
  const to = k + 1 < packs.length ? packs[k + 1] : files.length;
  const name = String(k).padStart(2, '0') + '.bin';
  want.add(name);
  const buf = Buffer.concat(data.slice(from, to));
  const file = path.join(OUT, name);
  if (!fs.existsSync(file) || !buf.equals(fs.readFileSync(file))) { fs.writeFileSync(file, buf); changed++; }
});
fs.readdirSync(OUT).forEach((f) => { if (!want.has(f)) { fs.unlinkSync(path.join(OUT, f)); changed++; } });

const before = fs.readFileSync(JS, 'utf8');
if (src !== before) { fs.writeFileSync(JS, src); changed++; }
const total = sizes.reduce((a, b) => a + b, 0);
console.log(`${files.length} frames, ${(total / 1048576).toFixed(1)} MB in ${packs.length} packs${changed ? ', written' : ', unchanged'}`);
