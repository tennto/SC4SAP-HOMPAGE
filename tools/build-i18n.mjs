/* ============================================================
   build-i18n.mjs — one URL per language, so search engines can
   index the English and Japanese pages and not only the Korean.

     node tools/build-i18n.mjs

   The Korean pages at the root are the source. Their English and
   Japanese copies are kept, already translated, under _i18n/en/ and
   _i18n/ja/ with the same paths and the same relative links as the
   Korean files. (GitHub Pages runs Jekyll, which never publishes a
   folder starting with "_".) This script:

   - writes each copy to en/ or ja/, pointing its links to shared
     files (css, js, img, fonts, Korean-only pages) one level up,
     while links between translated pages stay inside the language;
   - copies per-language data files (updates.data.js);
   - writes the canonical and hreflang links into every page of all
     three languages, and sitemap.xml;
   - writes the forwarding pages left at the old install URLs.

   After changing a Korean page, change its two copies under _i18n/
   to match, then run this. Running it twice changes nothing.
   js/lang.js moves each visitor to the page in their language.
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://sc4sap.dev/';
const LANGS = ['en', 'ja'];
const X_DEFAULT = 'en';   // what a reader of any other language gets

// Pages that exist in all three languages. The billing terms, refund
// policy and inquiry form are Korean only (data-no-i18n) and hidden.
const PAGES = [
  'index.html',
  'service/about.html',
  'service/security.html',
  'service/sponsorship.html',
  'resources/guide.html',
  'resources/brochure.html',
  'resources/updates.html',
  'resources/update.html',
  'legal/terms.html',
  'legal/privacy.html',
];
// Files other than pages that each language has its own copy of.
const DATA = ['resources/updates.data.js'];
// Pages left out of the sitemap: update.html only works with ?v=.
const NOT_IN_SITEMAP = ['resources/update.html'];

const abs = (f) => path.join(ROOT, f);
const read = (f) => fs.readFileSync(abs(f), 'utf8');

function write(f, text) {
  const p = abs(f);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  if (fs.existsSync(p) && fs.readFileSync(p, 'utf8') === text) return;
  fs.writeFileSync(p, text);
  console.log('wrote ' + f);
}

const url = (lang, page) => SITE + (lang === 'ko' ? '' : lang + '/') + (page === 'index.html' ? '' : page);

/* A relative link in a translated copy. Links to another translated
   page or data file stay as they are, inside the language folder;
   anything else is a shared file at the root, one level up. */
function relink(page, ref) {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(ref)) return ref;   // absolute, root-relative or in-page
  const [bare] = ref.split(/[?#]/);
  let target = path.posix.normalize(path.posix.join(path.posix.dirname(page), bare));
  if (bare === '' || bare.endsWith('/')) target = path.posix.join(target, 'index.html');
  if (target === '.' || target === './') target = 'index.html';
  if (PAGES.includes(target) || DATA.includes(target)) return ref;
  return '../' + ref;
}

function relinkAll(page, html) {
  return html.replace(/\b(href|src)="([^"]*)"/g, (m, attr, ref) => attr + '="' + relink(page, ref) + '"');
}

/* The canonical and hreflang links, between marker comments so a
   second run replaces them instead of adding more. */
function alternates(lang, page, nl) {
  const lines = ['<!-- i18n:alt -->', '<link rel="canonical" href="' + url(lang, page) + '" />'];
  for (const l of ['ko', ...LANGS]) lines.push('<link rel="alternate" hreflang="' + l + '" href="' + url(l, page) + '" />');
  lines.push('<link rel="alternate" hreflang="x-default" href="' + url(X_DEFAULT, page) + '" />');
  lines.push('<!-- /i18n:alt -->');
  return lines.join(nl);
}

function withHead(lang, page, html) {
  const nl = html.includes('\r\n') ? '\r\n' : '\n';
  html = html.replace(/<!-- i18n:alt -->[\s\S]*?<!-- \/i18n:alt -->\r?\n/, '');
  html = html.replace(/<link rel="canonical"[^>]*>\r?\n/, '');
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, '$1' + url(lang, page) + '$2');
  const anchor = /<script src="\/js\/lang\.js"><\/script>\r?\n/;
  if (!anchor.test(html)) throw new Error(lang + ' ' + page + ': no lang.js script in <head>');
  return html.replace(anchor, (m) => m + alternates(lang, page, nl) + nl);
}

for (const page of PAGES) {
  write(page, withHead('ko', page, read(page)));
  for (const lang of LANGS) {
    const src = path.posix.join('_i18n', lang, page);
    if (!fs.existsSync(abs(src))) throw new Error('missing ' + src);
    let html = read(src);
    if (!new RegExp('<html lang="' + lang + '"').test(html)) throw new Error(src + ': <html lang> is not ' + lang);
    html = relinkAll(page, html);
    write(path.posix.join(lang, page), withHead(lang, page, html));
  }
}

for (const lang of LANGS) {
  for (const f of DATA) write(path.posix.join(lang, f), read(path.posix.join('_i18n', lang, f)));
}

/* The old site's install guide URLs forward to the plugin guide in the
   same language. */
function forward(target, rel) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<!-- This URL belonged to the previous site. It now forwards to its
     replacement on the current one. -->
<title>Super-Claude for SAP</title>
<meta name="robots" content="noindex" />
<link rel="canonical" href="${target}" />
<meta http-equiv="refresh" content="0; url=${rel}" />
<script>location.replace('${rel}' + location.hash);</script>
</head>
<body>
<p><a href="${rel}">Super-Claude for SAP</a></p>
</body>
</html>
`;
}
write('install.html', forward(url('ko', 'resources/guide.html'), 'resources/guide.html'));
for (const lang of LANGS) {
  write(lang + '/install.html', forward(url(lang, 'resources/guide.html'), 'resources/guide.html'));
}

/* sitemap.xml: every page in every language, each listing the others. */
const today = new Date().toISOString().slice(0, 10);
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
const oldMap = fs.existsSync(abs('sitemap.xml')) ? read('sitemap.xml') : '';
for (const page of PAGES.filter((p) => !NOT_IN_SITEMAP.includes(p))) {
  for (const lang of ['ko', ...LANGS]) {
    xml += '  <url>\n    <loc>' + url(lang, page) + '</loc>\n';
    // An existing lastmod is kept, so a rerun changes nothing; a new URL gets today.
    const prev = new RegExp('<loc>' + url(lang, page).replace(/[.*+?^${}()|[\]\\/]/g, '\\$&') + '</loc>\\s*<lastmod>([^<]+)</lastmod>').exec(oldMap);
    xml += '    <lastmod>' + (prev ? prev[1] : today) + '</lastmod>\n';
    for (const l of ['ko', ...LANGS]) xml += '    <xhtml:link rel="alternate" hreflang="' + l + '" href="' + url(l, page) + '" />\n';
    xml += '    <xhtml:link rel="alternate" hreflang="x-default" href="' + url(X_DEFAULT, page) + '" />\n';
    xml += '  </url>\n';
  }
}
xml += '</urlset>\n';
write('sitemap.xml', xml);
