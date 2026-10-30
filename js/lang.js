/* ============================================================
   lang.js — every page, in <head>, before anything paints.

   Sends a visitor to the page in their browser's language:
   Korean stays on the root URLs, Japanese goes to /ja/, everyone
   else to /en/. There is no switch on the page, so the browser's
   first language decides.

   Crawlers are left on the URL they asked for, so each language
   keeps its own indexed page (the hreflang links tie them together).
   Pages marked data-no-i18n exist in Korean only and never move.
   Add ?stay to a URL to browse another language (?stay=off undoes it).
   ============================================================ */
(function () {
  var html = document.documentElement;
  if (html.hasAttribute('data-no-i18n')) return;
  if (/bot|crawl|spider|slurp|preview|lighthouse/i.test(navigator.userAgent)) return;
  // ?stay keeps language pages open as they are, for checking a
  // translation. It is remembered in this browser, so links and new tabs
  // keep it, until a page is opened with ?stay=off.
  var q = /[?&]stay(?:=([^&]*))?/.exec(location.search);
  var stay = !!q && q[1] !== 'off';
  try {
    if (q) { if (stay) localStorage.setItem('sc4sap-stay', '1'); else localStorage.removeItem('sc4sap-stay'); }
    else stay = !!localStorage.getItem('sc4sap-stay');
  } catch (e) { /* storage blocked: only the ?stay page stays */ }
  if (stay) return;
  var first = String((navigator.languages && navigator.languages[0]) || navigator.language || '').toLowerCase();
  var want = first.indexOf('ko') === 0 ? 'ko' : first.indexOf('ja') === 0 ? 'ja' : 'en';
  if (want === (html.getAttribute('lang') || 'ko')) return;
  var path = location.pathname.replace(/^\/(en|ja)(\/|$)/, '/');
  location.replace((want === 'ko' ? '' : '/' + want) + path + location.search + location.hash);
})();
