/* ============================================================
   Update pages (resources/updates.html, resources/update.html).
   Both read resources/updates.data.js (window.SC4_UPDATES = { plugin: [...] }), newest first,
   one entry per release of the open-source plugin:
   { version, date, title, summary, sections: [{ type, items }] }.
   Items may hold `code`; everything else is escaped. The web app is
   not open source, so its release notes live inside the app.
   ============================================================ */
(function () {
  'use strict';

  // The page's language picks the strings; each language has its own
  // updates.data.js next to its pages.
  var STR = {
    ko: {
      name: 'SC4 플러그인', added: '새 기능', changed: '개선', fixed: '수정', docs: '문서',
      empty: '아직 올라온 업데이트가 없어요.', failed: '업데이트 내역을 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.',
      failedShort: '업데이트 내역을 불러오지 못했어요', notFound: '찾는 버전이 없어요',
      pick: '<a href="updates.html">업데이트 목록</a>에서 버전을 골라 주세요.',
      date: '배포일', latest: '최신 버전', source: '원문 변경 이력(영문) 보기', prev: '이전 버전', next: '다음 버전',
      month: function (y, m) { return y + '년 ' + m + '월'; }
    },
    en: {
      name: 'SC4 plugin', added: 'New', changed: 'Improved', fixed: 'Fixed', docs: 'Docs',
      empty: 'No updates yet.', failed: 'The release notes could not be loaded. Please try again shortly.',
      failedShort: 'The release notes could not be loaded', notFound: 'That version was not found',
      pick: 'Pick a version from the <a href="updates.html">list of updates</a>.',
      date: 'Released', latest: 'Latest', source: 'Full changelog', prev: 'Previous', next: 'Next',
      month: function (y, m) { return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m - 1] + ' ' + y; }
    },
    ja: {
      name: 'SC4 プラグイン', added: '新機能', changed: '改善', fixed: '修正', docs: 'ドキュメント',
      empty: 'まだアップデートはありません。', failed: 'アップデート履歴を読み込めませんでした。しばらくしてからもう一度お試しください。',
      failedShort: 'アップデート履歴を読み込めませんでした', notFound: 'お探しのバージョンが見つかりません',
      pick: '<a href="updates.html">アップデート一覧</a>からバージョンを選んでください。',
      date: 'リリース日', latest: '最新バージョン', source: '変更履歴の原文（英語）を見る', prev: '前のバージョン', next: '次のバージョン',
      month: function (y, m) { return y + '年' + m + '月'; }
    }
  };
  var L = STR[document.documentElement.getAttribute('lang')] || STR.ko;
  var NAME = L.name;
  var SOURCE = 'https://github.com/babamba2/superclaude-for-sap/blob/main/CHANGELOG.md';
  var SECTIONS = {
    added:   { name: L.added,   icon: 'ph-sparkle' },
    changed: { name: L.changed, icon: 'ph-arrows-clockwise' },
    fixed:   { name: L.fixed,   icon: 'ph-wrench' },
    docs:    { name: L.docs,    icon: 'ph-book-open' }
  };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function inline(s) { return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>'); }
  function fmtDate(d) { return d.split('-').join('.'); }
  function href(v) { return 'update.html?v=' + encodeURIComponent(v); }

  // resources/updates.data.js sets window.SC4_UPDATES before this runs.
  function load() {
    var d = window.SC4_UPDATES;
    return d && d.plugin ? Promise.resolve(d.plugin) : Promise.reject(new Error('no data'));
  }

  /* ---- List page ---- */
  var list = document.querySelector('[data-up-list]');
  if (list) {
    load().then(function (rows) {
      if (!rows.length) { list.innerHTML = '<p class="up-empty">' + L.empty + '</p>'; return; }
      // Grouped by month, newest first.
      var html = '', month = '';
      rows.forEach(function (u) {
        var m = u.date.slice(0, 7);
        if (m !== month) {
          if (month) html += '</ol></section>';
          month = m;
          html += '<section class="up-month"><h2>' + L.month(m.slice(0, 4), Number(m.slice(5))) + '</h2><ol>';
        }
        html += '<li><a class="up-row" href="' + href(u.version) + '">' +
          '<span class="up-vd"><span class="up-v">v' + esc(u.version) + '</span>' +
          '<time class="up-d" datetime="' + esc(u.date) + '">' + fmtDate(u.date).slice(2) + '</time></span>' +
          '<span class="up-t"><b>' + inline(u.title) + '</b><span>' + inline(u.summary || '') + '</span></span>' +
          '<i class="ph ph-arrow-right" aria-hidden="true"></i></a></li>';
      });
      list.innerHTML = html + '</ol></section>';
    }).catch(function () {
      list.innerHTML = '<p class="up-empty">' + L.failed + '</p>';
    });
  }

  /* ---- Detail page: ?v=0.6.57 ---- */
  var detail = document.querySelector('[data-up-detail]');
  if (detail) {
    var v = (new URLSearchParams(location.search).get('v') || '').replace(/^v/, '');
    var $ = function (s) { return detail.querySelector(s); };

    var missing = function (msg) {
      $('[data-up-eyebrow]').textContent = NAME;
      $('[data-up-title]').textContent = msg;
      $('[data-up-summary]').innerHTML = L.pick;
    };

    load().then(function (rows) {
      var i = -1;
      rows.some(function (u, n) { if (u.version === v) { i = n; return true; } return false; });
      if (i < 0) { missing(L.notFound); return; }
      var u = rows[i];

      document.title = NAME + ' v' + u.version + ' · ' + u.title + ' · Super-Claude for SAP';
      $('[data-up-eyebrow]').textContent = NAME + ' · v' + u.version;
      $('[data-up-title]').innerHTML = inline(u.title);
      $('[data-up-summary]').innerHTML = inline(u.summary || '');
      var meta = '<li><b>' + L.date + '</b><time datetime="' + esc(u.date) + '">' + fmtDate(u.date) + '</time></li>';
      if (i === 0) meta += '<li><b>' + L.latest + '</b></li>';
      $('[data-up-meta]').innerHTML = meta;

      var body = '';
      (u.sections || []).forEach(function (s) {
        var k = SECTIONS[s.type] || { name: s.type, icon: 'ph-dot' };
        if (!s.items || !s.items.length) return;
        body += '<section class="up-sec"><h2><i class="ph ' + k.icon + '" aria-hidden="true"></i>' + k.name +
          '<span>' + s.items.length + '</span></h2><ul>' +
          s.items.map(function (t) { return '<li>' + inline(t) + '</li>'; }).join('') + '</ul></section>';
      });
      body += '<p class="up-source"><a href="' + SOURCE + '" target="_blank" rel="noopener">' + L.source + '<i class="ph ph-arrow-up-right" aria-hidden="true"></i></a></p>';
      $('[data-up-body]').innerHTML = body;

      // Older on the left, newer on the right, read like a timeline.
      var card = function (w, dir) {
        if (!w) return '<span></span>';
        var label = dir === 'prev' ? L.prev : L.next;
        return '<a class="up-page is-' + dir + '" href="' + href(w.version) + '" aria-label="' + label + ' v' + esc(w.version) + '">' +
          (dir === 'prev' ? '<i class="ph ph-caret-left" aria-hidden="true"></i>' + label : label + '<i class="ph ph-caret-right" aria-hidden="true"></i>') + '</a>';
      };
      $('[data-up-pager]').innerHTML = card(rows[i + 1], 'prev') + card(rows[i - 1], 'next');
    }).catch(function () { missing(L.failedShort); });
  }
})();
