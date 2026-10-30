/* ============================================================
   lang.js — every page, in <head>, before anything paints.

   Sends a visitor to the page in their browser's language:
   Korean stays on the root URLs, Japanese goes to /ja/, everyone
   else to /en/. There is no switch on the page, so the browser's
   first language decides.

   Crawlers are left on the URL they asked for, so each language
   keeps its own indexed page (the hreflang links tie them together).
   Pages marked data-no-i18n exist in Korean only and never move.
   Add ?stay to a URL to view a page in another language.
   ============================================================ */
(function () {
  var html = document.documentElement;
  if (html.hasAttribute('data-no-i18n')) return;
  if (/bot|crawl|spider|slurp|preview|lighthouse/i.test(navigator.userAgent)) return;
  // ?stay keeps any language page open as it is, for checking a translation.
  if (/[?&]stay\b/.test(location.search)) return;
  var first = String((navigator.languages && navigator.languages[0]) || navigator.language || '').toLowerCase();
  var want = first.indexOf('ko') === 0 ? 'ko' : first.indexOf('ja') === 0 ? 'ja' : 'en';
  if (want === (html.getAttribute('lang') || 'ko')) return;
  var path = location.pathname.replace(/^\/(en|ja)(\/|$)/, '/');
  location.replace((want === 'ko' ? '' : '/' + want) + path + location.search + location.hash);
})();
