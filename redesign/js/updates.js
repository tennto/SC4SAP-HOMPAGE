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

  var NAME = 'SC4 플러그인';
  var SOURCE = 'https://github.com/babamba2/superclaude-for-sap/blob/main/CHANGELOG.md';
  var SECTIONS = {
    added:   { name: '새 기능', icon: 'ph-sparkle' },
    changed: { name: '개선',   icon: 'ph-arrows-clockwise' },
    fixed:   { name: '수정',   icon: 'ph-wrench' },
    docs:    { name: '문서',   icon: 'ph-book-open' }
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
      if (!rows.length) { list.innerHTML = '<p class="up-empty">아직 올라온 업데이트가 없어요.</p>'; return; }
      // Grouped by month, newest first.
      var html = '', month = '';
      rows.forEach(function (u) {
        var m = u.date.slice(0, 7);
        if (m !== month) {
          if (month) html += '</ol></section>';
          month = m;
          html += '<section class="up-month"><h2>' + m.slice(0, 4) + '년 ' + Number(m.slice(5)) + '월</h2><ol>';
        }
        html += '<li><a class="up-row" href="' + href(u.version) + '">' +
          '<span class="up-vd"><span class="up-v">v' + esc(u.version) + '</span>' +
          '<time class="up-d" datetime="' + esc(u.date) + '">' + fmtDate(u.date).slice(2) + '</time></span>' +
          '<span class="up-t"><b>' + inline(u.title) + '</b><span>' + inline(u.summary || '') + '</span></span>' +
          '<i class="ph ph-arrow-right" aria-hidden="true"></i></a></li>';
      });
      list.innerHTML = html + '</ol></section>';
    }).catch(function () {
      list.innerHTML = '<p class="up-empty">업데이트 내역을 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.</p>';
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
      $('[data-up-summary]').innerHTML = '<a href="updates.html">업데이트 목록</a>에서 버전을 골라 주세요.';
    };

    load().then(function (rows) {
      var i = -1;
      rows.some(function (u, n) { if (u.version === v) { i = n; return true; } return false; });
      if (i < 0) { missing('찾는 버전이 없어요'); return; }
      var u = rows[i];

      document.title = NAME + ' v' + u.version + ' · ' + u.title + ' · Super-Claude for SAP';
      $('[data-up-eyebrow]').textContent = NAME + ' · v' + u.version;
      $('[data-up-title]').innerHTML = inline(u.title);
      $('[data-up-summary]').innerHTML = inline(u.summary || '');
      var meta = '<li><b>배포일</b><time datetime="' + esc(u.date) + '">' + fmtDate(u.date) + '</time></li>';
      if (i === 0) meta += '<li><b>최신 버전</b></li>';
      $('[data-up-meta]').innerHTML = meta;

      var body = '';
      (u.sections || []).forEach(function (s) {
        var k = SECTIONS[s.type] || { name: s.type, icon: 'ph-dot' };
        if (!s.items || !s.items.length) return;
        body += '<section class="up-sec"><h2><i class="ph ' + k.icon + '" aria-hidden="true"></i>' + k.name +
          '<span>' + s.items.length + '</span></h2><ul>' +
          s.items.map(function (t) { return '<li>' + inline(t) + '</li>'; }).join('') + '</ul></section>';
      });
      body += '<p class="up-source"><a href="' + SOURCE + '" target="_blank" rel="noopener">원문 변경 이력(영문) 보기<i class="ph ph-arrow-up-right" aria-hidden="true"></i></a></p>';
      $('[data-up-body]').innerHTML = body;

      // Older on the left, newer on the right, read like a timeline.
      var card = function (w, dir) {
        if (!w) return '<span></span>';
        var label = (dir === 'prev' ? '이전 버전' : '다음 버전');
        return '<a class="up-page is-' + dir + '" href="' + href(w.version) + '" aria-label="' + label + ' v' + esc(w.version) + '">' +
          (dir === 'prev' ? '<i class="ph ph-caret-left" aria-hidden="true"></i>' + label : label + '<i class="ph ph-caret-right" aria-hidden="true"></i>') + '</a>';
      };
      $('[data-up-pager]').innerHTML = card(rows[i + 1], 'prev') + card(rows[i - 1], 'next');
    }).catch(function () { missing('업데이트 내역을 불러오지 못했어요'); });
  }
})();
