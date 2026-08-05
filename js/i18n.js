/* ============================================================
   i18n.js — language detection (browser auto), persistence,
   static-string translation, and the nav language switcher.

   Design-safe: this layer ONLY swaps text / innerHTML / aria-label
   on tagged elements. It never touches CSS, layout, or structure.

   Markup hooks (in index.html):
     data-i18n="key"        → element.textContent      = STR[lang][key]
     data-i18n-html="key"   → element.innerHTML        = STR[lang][key]
     data-i18n-aria="key"   → element.aria-label       = STR[lang][key]

   The heavy capability panels (#01–#12) are translated separately in
   js/i18n.en.js / js/i18n.ja.js and consumed by main.js.
   ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'sc4sap-lang';
  var SUPPORTED = ['ko', 'en', 'ja'];

  /* ---------- static string table ---------- */
  var STR = {
    ko: {
      heroH2: '"SAP 패러다임의 대전환, 새로운 판이 열립니다"',
      heroSub: 'SC4SAP 는 Claude Code를 SAP 풀스택 개발 어시스턴트로 전환하는 플러그인입니다',
      heroDesc: 'ECC · S/4HANA On-Premise · S/4HANA Cloud(Public·Private) 전 플랫폼에서<br/>클래스 · 리포트 · CDS · Dynpro · GUI Status까지 MCP 기반 150여 개 도구로<br/>직접 읽고, 쓰고, 활성화합니다',
      emptyHint: '아래 12개 카드를 클릭하면 각 기능의 세부 내용을 볼 수 있습니다',
      cap01: '<code>/sc4sap:setup</code><br/>MCP 서버·권한·블록리스트 훅 원클릭 설치',
      cap02: 'Core 10 · BC 1 · Modules 14 <br/><code>/sc4sap:team</code> 으로 병렬 협업',
      cap03: '<code>/sc4sap:program-to-spec</code><br/>프로그램을 기능/기술 스펙으로 역공학',
      cap04: 'Clean ABAP · 성능 · 보안 정적 리뷰<br/>severity-ranked 수정 제안',
      cap05: '2–5 프로그램을 10차원으로 비교<br/>복제·분기 판별 수행',
      cap06: 'ST22 · SM02 · Gateway 로그 · 프로파일러를 Claude 안에서 1차 분석',
      cap07: '문서화 · 장애 대응 · 데이터 보호까지<br/>오직 한 패키지로',
      cap08: '<code>/sc4sap:analyze-cbo-obj</code><br/>이미 있는 Z 프로그램을 다시 만들지 않도록',
      cap09: '14 업종 레퍼런스. Retail · Auto · Pharma · Banking · Steel · Utilities ···',
      cap10: '16 국가 로컬라이제이션<br/>E-invoicing · 은행 · 세금 · 법정 리포트',
      cap11: '활성 모듈 조합 자동 인지<br/>MM+PS → WBS / SD+CO → CO-PA',
      cap12: 'Main+Include·ALV·Dynpro·GUI Status·Text Element·ABAP Unit까지 완성',
      footH3: 'Super-Claude for SAP, <br class="m-br"/>지금 바로 사용할 수 있습니다',
      footP: 'Claude Code에 커스텀 마켓플레이스로 추가하면 곧바로 사용 가능합니다',
      footBtnGithub: 'GitHub 저장소로 이동',
      ariaMenu: '메뉴 열기',
      ariaTheme: '테마 전환',
      ariaLang: '언어 선택',
      ariaGhStar: 'GitHub 저장소 스타',
      ariaCopy: '명령어 복사',
      ackDefault: '→ 위 키워드 중 하나를 클릭해 게이트 동작을 확인하세요.',
      ackPass: '→ <b>PASS</b> — 명시적 긍정 키워드 "<b>{kw}</b>" 인식. GetTableContents(BNKA) 허용 (per-call · per-table · per-session).',
      ackDeny: '→ <b>DENY</b> — 모호한 명령 "<b>{kw}</b>"은(는) acknowledge_risk로 인정되지 않습니다. 명시적 키워드(yes / 승인 / authorize 등)로 다시 요청하세요.'
    },
    en: {
      heroH2: '"A paradigm shift for SAP — a whole new game begins"',
      heroSub: 'SC4SAP is the plugin that turns Claude Code into a full-stack SAP development assistant',
      heroDesc: 'Across every platform — ECC · S/4HANA On-Premise · S/4HANA Cloud (Public · Private) —<br/>it reads, writes, and activates Classes · Reports · CDS · Dynpro · GUI Status<br/>directly, through 150+ MCP-based tools',
      emptyHint: 'Click any of the 12 cards below to see the details of each capability',
      cap01: '<code>/sc4sap:setup</code><br/>One-click install of the MCP server, permission & blocklist hooks',
      cap02: 'Core 10 · BC 1 · Modules 14 <br/>Parallel collaboration via <code>/sc4sap:team</code>',
      cap03: '<code>/sc4sap:program-to-spec</code><br/>Reverse-engineer programs into functional / technical specs',
      cap04: 'Clean ABAP · performance · security static review<br/>Severity-ranked fix suggestions',
      cap05: 'Compare 2–5 programs across 10 dimensions<br/>Detect clones & divergences',
      cap06: 'First-pass analysis of ST22 · SM02 · Gateway logs · profiler, right inside Claude',
      cap07: 'Documentation · incident response · data protection<br/>all in a single package',
      cap08: '<code>/sc4sap:analyze-cbo-obj</code><br/>So existing Z programs never get rebuilt from scratch',
      cap09: '14 industry references. Retail · Auto · Pharma · Banking · Steel · Utilities ···',
      cap10: '16-country localization<br/>E-invoicing · banking · tax · statutory reporting',
      cap11: 'Automatic awareness of active module combinations<br/>MM+PS → WBS / SD+CO → CO-PA',
      cap12: 'Complete with Main+Include · ALV · Dynpro · GUI Status · Text Element · ABAP Unit',
      footH3: 'Super-Claude for SAP — <br class="m-br"/>ready to use right now',
      footP: 'Add it to Claude Code as a custom marketplace and start using it immediately',
      footBtnGithub: 'Go to the GitHub repository',
      ariaMenu: 'Open menu',
      ariaTheme: 'Toggle theme',
      ariaLang: 'Select language',
      ariaGhStar: 'GitHub repository stars',
      ariaCopy: 'Copy command',
      ackDefault: '→ Click one of the keywords above to see how the gate behaves.',
      ackPass: '→ <b>PASS</b> — explicit affirmative keyword "<b>{kw}</b>" recognized. GetTableContents(BNKA) allowed (per-call · per-table · per-session).',
      ackDeny: '→ <b>DENY</b> — the ambiguous command "<b>{kw}</b>" is not accepted as acknowledge_risk. Request again with an explicit keyword (yes / 승인 / authorize, etc.).'
    },
    ja: {
      heroH2: '「SAPパラダイムの大転換、新たな舞台が開きます」',
      heroSub: 'SC4SAP は Claude Code を SAP フルスタック開発アシスタントへと変えるプラグインです',
      heroDesc: 'ECC · S/4HANA On-Premise · S/4HANA Cloud（Public・Private）の全プラットフォームで<br/>クラス · レポート · CDS · Dynpro · GUI Status まで MCP ベースの150以上のツールで<br/>直接、読み・書き・有効化します',
      emptyHint: '下の12枚のカードをクリックすると、各機能の詳細をご覧いただけます',
      cap01: '<code>/sc4sap:setup</code><br/>MCPサーバー・権限・ブロックリストフックをワンクリック導入',
      cap02: 'Core 10 · BC 1 · Modules 14 <br/><code>/sc4sap:team</code> で並列協働',
      cap03: '<code>/sc4sap:program-to-spec</code><br/>プログラムを機能/技術仕様へリバースエンジニアリング',
      cap04: 'Clean ABAP · 性能 · セキュリティの静的レビュー<br/>重大度順の修正提案',
      cap05: '2〜5本のプログラムを10次元で比較<br/>複製・分岐を判別',
      cap06: 'ST22 · SM02 · Gateway ログ · プロファイラを Claude 内で一次分析',
      cap07: 'ドキュメント化 · 障害対応 · データ保護まで<br/>たったひとつのパッケージで',
      cap08: '<code>/sc4sap:analyze-cbo-obj</code><br/>既存の Z プログラムを作り直さないために',
      cap09: '14業種のリファレンス。Retail · Auto · Pharma · Banking · Steel · Utilities ···',
      cap10: '16カ国のローカライゼーション<br/>電子請求 · 銀行 · 税務 · 法定レポート',
      cap11: '有効モジュールの組み合わせを自動認識<br/>MM+PS → WBS / SD+CO → CO-PA',
      cap12: 'Main+Include · ALV · Dynpro · GUI Status · Text Element · ABAP Unit まで完成',
      footH3: 'Super-Claude for SAP、<br class="m-br"/>今すぐご利用いただけます',
      footP: 'Claude Code にカスタムマーケットプレイスとして追加すれば、すぐに使えます',
      footBtnGithub: 'GitHub リポジトリへ移動',
      ariaMenu: 'メニューを開く',
      ariaTheme: 'テーマ切り替え',
      ariaLang: '言語を選択',
      ariaGhStar: 'GitHub リポジトリのスター',
      ariaCopy: 'コマンドをコピー',
      ackDefault: '→ 上のキーワードのいずれかをクリックして、ゲートの動作を確認してください。',
      ackPass: '→ <b>PASS</b> — 明示的な肯定キーワード「<b>{kw}</b>」を認識。GetTableContents(BNKA) を許可（per-call · per-table · per-session）。',
      ackDeny: '→ <b>DENY</b> — 曖昧な命令「<b>{kw}</b>」は acknowledge_risk として認められません。明示的なキーワード（yes / 승인 / authorize など）で再度リクエストしてください。'
    }
  };

  /* ---------- language resolution ---------- */
  function readStored() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return SUPPORTED.indexOf(v) !== -1 ? v : null;
    } catch (e) { return null; }
  }
  function writeStored(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
  }
  function detectBrowserLang() {
    var langs = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language || navigator.userLanguage || 'en'];
    for (var i = 0; i < langs.length; i++) {
      var l = String(langs[i] || '').toLowerCase();
      if (l.indexOf('ja') === 0) return 'ja';
      if (l.indexOf('ko') === 0) return 'ko';
      if (l.indexOf('en') === 0) return 'en';
    }
    return 'en';   // international default for any other locale
  }

  // Stored choice (explicit toggle) wins; otherwise auto-detect from the browser.
  var current = readStored() || detectBrowserLang();

  function t(key) {
    var table = STR[current] || STR.en;
    if (table && table[key] != null) return table[key];
    if (STR.en[key] != null) return STR.en[key];
    if (STR.ko[key] != null) return STR.ko[key];
    return key;
  }

  /* ---------- DOM application ---------- */
  function applyTranslations() {
    document.documentElement.setAttribute('lang', current);

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n'));
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n-html'));
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n-aria'));
      if (v != null) el.setAttribute('aria-label', v);
    });

    // Reflect active state on the language switcher
    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-lang-btn') === current);
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-lang-btn') === current));
    });
  }

  function setLang(lang, opts) {
    if (SUPPORTED.indexOf(lang) === -1 || lang === current) {
      // still allow re-apply on initial wiring
      if (lang === current) { applyTranslations(); }
      return;
    }
    current = lang;
    if (!opts || opts.persist !== false) writeStored(lang);
    applyTranslations();
    // Notify dynamic consumers (main.js re-renders the open capability panel)
    document.dispatchEvent(new CustomEvent('sc4:langchange', { detail: { lang: lang } }));
  }

  function wireSwitcher() {
    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLang(btn.getAttribute('data-lang-btn'));
      });
    });
  }

  /* ---------- public API ---------- */
  window.SC4_I18N = {
    current: function () { return current; },
    set: setLang,
    t: t
  };

  /* ---------- init (script is deferred → DOM is parsed) ---------- */
  wireSwitcher();
  applyTranslations();
})();
