/* ============================================================
   build-i18n.mjs — one URL per language, so search engines can
   index the English and Japanese copy and not only the Korean.

     node tools/build-i18n.mjs

   The root index.html and install.html are the source and stay
   the Korean pages. This script fills every data-t / data-t-html /
   data-t-aria hook in them with the Korean copy, then writes the
   same pages translated to en/ and ja/, along with the hreflang
   links between all three and sitemap.xml.

   Run it after changing either page or any of the strings files.
   It is idempotent: running it twice changes nothing the second time.
   The page still swaps language in place at runtime (app.js); this
   only decides what a crawler, or a visitor without script, reads.
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://sc4sap.dev/';
const LANGS = ['ko', 'en', 'ja'];
const LOCALE = { ko: 'ko_KR', en: 'en_US', ja: 'ja_JP' };
const X_DEFAULT = 'en';   // what a reader of any other language is offered

const PAGES = [
  {
    file: 'index.html',
    scripts: ['js/strings.js', 'js/panels.ko.js', 'js/i18n.en.js', 'js/i18n.ja.js'],
    meta: 'meta',
  },
  {
    file: 'install.html',
    scripts: ['js/strings.js', 'js/strings.install.js'],
    meta: 'insMeta',
  },
];

const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

function write(f, text) {
  const p = path.join(ROOT, f);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const before = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
  if (before === text) return false;
  fs.writeFileSync(p, text);
  console.log('wrote ' + f);
  return true;
}

/* The strings files are plain browser scripts that hang their tables
   off window, so they run here against a bare window object. */
function load(scripts) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  scripts.forEach((s) => vm.runInContext(read(s), ctx, { filename: s }));
  return ctx.window;
}

const escText = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) => escText(s).replace(/"/g, '&quot;');

/* Index of the tag that closes the element whose opening tag ends at
   `from`, counting nested elements of the same name. */
function closeOf(html, tag, from) {
  const re = new RegExp('<(/?)' + tag + '\\b[^>]*>', 'gi');
  re.lastIndex = from;
  let depth = 1, m;
  while ((m = re.exec(html))) {
    if (m[1]) { if (--depth === 0) return m.index; }
    else if (!m[0].endsWith('/>')) depth++;
  }
  throw new Error('unclosed <' + tag + '> at ' + from);
}

/* Replace the content of every element carrying attr="key". */
function fillContent(html, attr, render) {
  const re = new RegExp('<([a-zA-Z][\\w-]*)\\b[^>]*?\\s' + attr + '(?:="([^"]*)")?(?=[\\s/>])[^>]*>', 'g');
  let out = '', last = 0, m;
  while ((m = re.exec(html))) {
    const tag = m[1], key = m[2];
    const start = m.index + m[0].length;
    const end = closeOf(html, tag, start);
    out += html.slice(last, start) + render(key);
    last = end;
    re.lastIndex = end;
  }
  return out + html.slice(last);
}

function pageUrl(lang, file) {
  return SITE + (lang === 'ko' ? '' : lang + '/') + (file === 'index.html' ? '' : file);
}

function headBlock(page, lang, t) {
  const m = page.meta;
  const lines = [
    '<title>' + escText(t(m + 'Title')) + '</title>',
    '<meta name="description" content="' + escAttr(t(m + 'Desc')) + '" />',
    '<link rel="canonical" href="' + pageUrl(lang, page.file) + '" />',
    ...LANGS.map((l) => '<link rel="alternate" hreflang="' + l + '" href="' + pageUrl(l, page.file) + '" />'),
    '<link rel="alternate" hreflang="x-default" href="' + pageUrl(X_DEFAULT, page.file) + '" />',
    '<meta property="og:title" content="' + escAttr(t(m + 'OgTitle')) + '" />',
    '<meta property="og:description" content="' + escAttr(t(m + 'OgDesc')) + '" />',
    '<meta property="og:url" content="' + pageUrl(lang, page.file) + '" />',
    '<meta property="og:locale" content="' + LOCALE[lang] + '" />',
    ...LANGS.filter((l) => l !== lang).map((l) => '<meta property="og:locale:alternate" content="' + LOCALE[l] + '" />'),
    '<script type="application/ld+json">' + JSON.stringify(structuredData(page, lang, t)).replace(/</g, '\\u003c') + '</script>',
  ];
  return '<!-- i18n:head -->\n' + lines.join('\n') + '\n<!-- /i18n:head -->';
}

/* schema.org description of the site for search engines. Invisible on
   the page. Only facts the page itself states: the name, the MIT
   licence, the repository and npm package it links, and the two people
   in its footer. */
const REPO = 'https://github.com/babamba2/superclaude-for-sap';
const PEOPLE = [
  { name: '백승현', sameAs: 'https://www.linkedin.com/in/seunghyun-paek-5b83b7183/' },
  { name: '김시훈', sameAs: 'https://www.linkedin.com/in/sihun-kim-27737132b/' },
];

function structuredData(page, lang, t) {
  const appId = SITE + '#app';
  const app = {
    '@type': 'SoftwareApplication',
    '@id': appId,
    name: 'Super-Claude for SAP',
    alternateName: 'SC4SAP',
    url: SITE,
    description: t('metaDesc'),
    inLanguage: lang,
    applicationCategory: 'DeveloperApplication',
    applicationSubCategory: 'Claude Code plugin',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    license: REPO + '/blob/main/LICENSE',
    downloadUrl: REPO,
    installUrl: pageUrl(lang, 'install.html'),
    image: SITE + 'assets/tumbnail.png',
    sameAs: [REPO, 'https://www.npmjs.com/package/@babamba2/abap-mcp-adt-powerup'],
    author: PEOPLE.map((p) => ({ '@type': 'Person', name: p.name, sameAs: p.sameAs })),
  };
  const site = {
    '@type': 'WebSite',
    '@id': SITE + '#site',
    name: 'Super-Claude for SAP',
    url: SITE,
    inLanguage: LANGS,
    about: { '@id': appId },
  };
  const graph = page.file === 'index.html'
    ? [site, app]
    : [site, app, {
        '@type': 'TechArticle',
        headline: t(page.meta + 'Title'),
        description: t(page.meta + 'Desc'),
        url: pageUrl(lang, page.file),
        inLanguage: lang,
        about: { '@id': appId },
        isPartOf: { '@id': SITE + '#site' },
      }];
  return { '@context': 'https://schema.org', '@graph': graph };
}

/* The capability index as app.js's renderIndex() builds it, with each
   panel's full text already inside its collapsed body. Script replaces
   all of it on load; until then, and for crawlers, the content is here. */
function capabilityIndex(win, lang, t) {
  const S = win.SC4_STRINGS;
  const panels = { ko: win.SC4_PANELS_KO, en: win.SC4_PANELS_EN, ja: win.SC4_PANELS_JA }[lang] || win.SC4_PANELS_KO;
  return '\n' + S.titles.map((title, i) => {
    const id = String(i + 1).padStart(2, '0');
    const panel = (panels[id] || win.SC4_PANELS_KO[id] || { html: '' }).html;
    return (
      '<div class="entry" data-cap-id="' + id + '" data-open="false">' +
      '<h3 class="entry-h"><button type="button" class="entry-btn" id="cap-btn-' + id + '" aria-expanded="false" aria-controls="cap-' + id + '">' +
      '<span class="entry-n">' + id + '</span>' +
      '<span class="entry-title">' + title + '</span>' +
      '<span class="entry-sum">' + t('cap' + id) + '</span>' +
      '<i class="ph ph-plus entry-mark" aria-hidden="true"></i></button></h3>' +
      '<div class="entry-body" id="cap-' + id + '" role="region" aria-labelledby="cap-btn-' + id + '"><div>' + panel + '</div></div>' +
      '</div>'
    );
  }).join('\n') + '\n';
}

function build(page, lang) {
  const win = load(page.scripts);
  const S = win.SC4_STRINGS;
  const t = (k) => {
    const v = (S[lang] && S[lang][k]) ?? S.ko[k];
    if (v === undefined) throw new Error(page.file + ': no string for "' + k + '"');
    return v;
  };

  let html = read(page.file);

  html = html.replace(/<html lang="[^"]*"/, '<html lang="' + lang + '"');
  html = html.replace(/<!-- i18n:head -->[\s\S]*?<!-- \/i18n:head -->/, () => headBlock(page, lang, t));

  html = fillContent(html, 'data-t', (k) => escText(t(k)));
  html = fillContent(html, 'data-t-html', (k) => t(k));
  html = html.replace(/<[^>]*\sdata-t-aria="([^"]+)"[^>]*>/g, (tag, k) =>
    tag.replace(/aria-label="[^"]*"/, 'aria-label="' + escAttr(t(k)) + '"'));
  if (page.file === 'index.html') {
    html = fillContent(html, 'data-index', () => capabilityIndex(win, lang, t));
  }

  if (lang !== 'ko') {
    html = html.replace(/((?:href|src)=")(?=(?:css|js|favicon|assets|motion)\/)/g, '$1../');
    // Git may have checked the source out with CRLF endings.
    html = html.replace(/<!DOCTYPE html>(\r?\n)/, (m, nl) =>
      '<!DOCTYPE html>' + nl + '<!-- Generated by tools/build-i18n.mjs from /' + page.file + '. Edit that, then rebuild. -->' + nl);
  }
  return html;
}

function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = PAGES.flatMap((p) => LANGS.map((lang) =>
    '  <url>\n' +
    '    <loc>' + pageUrl(lang, p.file) + '</loc>\n' +
    '    <lastmod>' + today + '</lastmod>\n' +
    LANGS.map((l) => '    <xhtml:link rel="alternate" hreflang="' + l + '" href="' + pageUrl(l, p.file) + '" />\n').join('') +
    '    <xhtml:link rel="alternate" hreflang="x-default" href="' + pageUrl(X_DEFAULT, p.file) + '" />\n' +
    '  </url>\n'));
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    urls.join('') + '</urlset>\n';
}

/* Every page is built from the untouched source before any is written,
   so the Korean rewrite of the source cannot leak into en/ or ja/. */
const out = [];
for (const page of PAGES) {
  for (const lang of LANGS) {
    out.push([lang === 'ko' ? page.file : lang + '/' + page.file, build(page, lang)]);
  }
}
const changed = out.map(([f, text]) => write(f, text)).some(Boolean);

/* lastmod only moves when a page did, so a no-op rebuild leaves the
   sitemap alone too. */
const stamp = (x) => x.replace(/<lastmod>[^<]*<\/lastmod>/g, '');
const prev = fs.existsSync(path.join(ROOT, 'sitemap.xml')) ? read('sitemap.xml') : '';
const next = sitemap();
if (changed || stamp(prev) !== stamp(next)) write('sitemap.xml', next);
