/* ============================================================
   strings.js - every visible string on the page, in ko / en / ja.

   Markup hooks:
     data-t="key"       -> textContent
     data-t-html="key"  -> innerHTML
     data-t-aria="key"  -> aria-label

   Capability titles stay in English across all three languages: they
   are the command surface of the plugin, not prose.
   ============================================================ */

window.SC4_STRINGS = (function () {
  'use strict';

  var ko = {
    ackDefault: '위 키워드 중 하나를 눌러 게이트 동작을 확인하세요',
    ackPass: '<span class="ack-verdict pass">PASS</span> 명시적 긍정 키워드 "<b>{kw}</b>" 인식. GetTableContents(BNKA) 허용 (호출 · 테이블 · 세션 단위)',
    ackDeny: '<span class="ack-verdict deny">DENY</span> 모호한 명령 "<b>{kw}</b>" 은(는) acknowledge_risk 로 인정되지 않습니다. 명시적 키워드로 다시 요청하세요',
    navCapabilities: '기능',
    navInstall: '설치 가이드',
    navContact: '연락처',
    ariaMenu: '메뉴 열기',
    ariaTheme: '테마 전환',
    ariaLang: '언어 선택',
    ariaCopy: '설치 명령어 복사',
    ariaStars: 'GitHub 저장소 스타 수',

    heroTitle: 'SAP 시스템 전체를<br><em>Claude Code</em> 안에서',
    heroLede: '대화로 설계하고, 자동으로 구현해보세요',
    installLabel: 'Claude Code',
    installNote: '오픈소스 · MIT',
    copy: '복사',
    copied: '복사됨',
    ghBtn: 'GitHub',

    factPlatformK: '지원 플랫폼',
    factPlatformV: 'ECC 6.0 · S/4HANA On-Premise · S/4HANA Cloud',
    factToolsK: 'MCP 도구',
    factToolsV: 'ABAP ADT 기반',
    factSkillsK: '워크플로 스킬',
    factSkillsV: 'setup · create-program · analyze-code · team ···',
    factAgentsK: '전문 에이전트',
    factAgentsV: 'Core 10 · Basis 1 · Module 14',

    whyH2: 'AI에 SAP 개발을 맡길 때 늘 막히는 지점',
    whyLede: '범용 AI는 SAP에 직접 닿지 못해서, 코드를 짐작하고 이미 있는 걸 또 만들곤 합니다',
    whyNowH: '범용 AI에 맡기면',
    whyNow1: '실제 소스를 열지 못하니 <b>그럴싸한 ABAP을 지어냅니다</b>',
    whyNow2: '이미 있는 <b>Z 오브젝트를 모른 채</b> 같은 기능을 또 만듭니다',
    whyNow3: '업종과 국가 룰이 빠진 채 <b>표준 객체를 잘못 고릅니다</b>',
    whyNow4: '운영 데이터를 어디까지 읽어도 되는지 <b>경계가 없습니다</b>',
    whyAfterH: 'SC4SAP를 붙이면',
    whyAfter1: 'ADT로 <b>실제 소스를 읽고</b>, 고치고, 활성화까지 합니다',
    whyAfter2: '<code>analyze-cbo-obj</code>로 인벤토리를 먼저 조회한 뒤 <b>재사용을 제안</b>합니다',
    whyAfter3: '14개 업종과 16개 국가 레퍼런스를 <b>필수로 로드</b>합니다',
    whyAfter4: 'PII · 급여 · 뱅킹 테이블은 <b>4중 방어</b>로 차단합니다',

    impactH2: '압도적 성능과 효율을 경험하세요',
    impactLede: '여러 세션으로 다중 병렬 작업이 가능합니다',
    impactDeckAria: '기능 12가지가 카드 4장에 차례로 나타납니다',

    startH2: '시작하는 데 세 단계면 충분합니다',
    startLede: '설치부터 첫 작업까지, 별도 서버를 세우거나 설정 파일을 만질 일은 없습니다. Claude Code 안에서 그대로 이어집니다',
    startInstallH: '설치',
    startInstallP: 'Claude Code에 커스텀 마켓플레이스를 추가하고 플러그인을 설치합니다',
    startSetupH: '연결',
    startSetupP: 'SAP 버전과 업종, 국가를 한 번 답하면 MCP 서버와 권한 훅까지 등록됩니다',
    startBuildH: '작업',
    startBuildP: '역공학, 코드 리뷰, 프로그램 생성을 25개 에이전트가 나눠 처리합니다',

    capH2: '기능 12가지',
    capCount: '전체 12개',
    capLede: '각 항목을 열면 실제 명령어와 산출물, 동작 방식을 확인할 수 있습니다',

    contribH2: 'Welcome Contributors!',
    contribLede: '프로젝트에 관심이 있거나 기여하고 싶은 분이 계시다면<br class="br-wide">아래 Connect 연락처로 문의해주세요',

    ctaH2: '지금 설치하면 바로 쓸 수 있습니다',
    ctaP: 'Claude Code에 커스텀 마켓플레이스로 추가하면 별도 서버나 계정 없이 곧바로 사용할 수 있습니다',

    footTagline: 'Claude Code를 SAP 풀스택 개발 어시스턴트로 전환하는 오픈소스 플러그인입니다',
    footContact: '연락처',
    footProject: '프로젝트',
    footMeta: '© Super-Claude for SAP · MIT 라이선스',
    footBuilt: 'Built on Claude Code + MCP ABAP ADT',

    cap01: '<code>/sc4sap:setup</code> MCP 서버·권한·블록리스트 훅 원클릭 설치',
    cap02: 'Core 10 · BC 1 · Modules 14. <code>/sc4sap:team</code> 으로 병렬 협업',
    cap03: '<code>/sc4sap:program-to-spec</code> 프로그램을 기능/기술 스펙으로 역공학',
    cap04: 'Clean ABAP · 성능 · 보안 정적 리뷰. severity-ranked 수정 제안',
    cap05: '2-5개 프로그램을 10차원으로 비교. 복제·분기 판별 수행',
    cap06: 'ST22 · SM02 · Gateway 로그 · 프로파일러를 Claude 안에서 1차 분석',
    cap07: '문서화 · 장애 대응 · 데이터 보호까지 오직 한 패키지로',
    cap08: '<code>/sc4sap:analyze-cbo-obj</code> 이미 있는 Z 프로그램을 다시 만들지 않도록',
    cap09: '14 업종 레퍼런스. Retail · Auto · Pharma · Banking · Steel · Utilities',
    cap10: '16 국가 로컬라이제이션. E-invoicing · 은행 · 세금 · 법정 리포트',
    cap11: '활성 모듈 조합 자동 인지. MM+PS → WBS / SD+CO → CO-PA',
    cap12: 'Main+Include · ALV · Dynpro · GUI Status · Text Element · ABAP Unit까지 완성'
  };

  var en = {
    ackDefault: 'Press one of the keywords above to see how the gate behaves',
    ackPass: '<span class="ack-verdict pass">PASS</span> explicit affirmative keyword "<b>{kw}</b>" recognized. GetTableContents(BNKA) allowed, per call, per table, per session',
    ackDeny: '<span class="ack-verdict deny">DENY</span> the ambiguous command "<b>{kw}</b>" is not accepted as acknowledge_risk. Ask again with an explicit keyword',
    navCapabilities: 'Capabilities',
    navInstall: 'Install guide',
    navContact: 'Contact',
    ariaMenu: 'Open menu',
    ariaTheme: 'Switch theme',
    ariaLang: 'Select language',
    ariaCopy: 'Copy install command',
    ariaStars: 'GitHub repository stars',

    heroTitle: 'Your whole SAP system,<br>inside <em>Claude Code</em>',
    heroLede: 'Design it in conversation, then let it build itself',
    installLabel: 'Claude Code',
    installNote: 'Open source · MIT',
    copy: 'Copy',
    copied: 'Copied',
    ghBtn: 'GitHub',

    factPlatformK: 'Platforms',
    factPlatformV: 'ECC 6.0 · S/4HANA On-Premise · S/4HANA Cloud',
    factToolsK: 'MCP tools',
    factToolsV: 'Built on ABAP ADT',
    factSkillsK: 'Workflow skills',
    factSkillsV: 'setup · create-program · analyze-code · team ···',
    factAgentsK: 'Specialist agents',
    factAgentsV: 'Core 10 · Basis 1 · Module 14',

    whyH2: 'Where AI keeps hitting a wall on SAP work',
    whyLede: 'A general-purpose model never quite reaches the system, so it guesses at code and rebuilds what is there',
    whyNowH: 'With a general model',
    whyNow1: 'It cannot open the real source, so it <b>invents plausible ABAP</b>',
    whyNow2: 'It <b>never sees the existing Z objects</b> and rebuilds the same function',
    whyNow3: 'Without industry and country rules it <b>picks the wrong standard objects</b>',
    whyNow4: 'There is <b>no boundary</b> around what production data it may read',
    whyAfterH: 'With SC4SAP attached',
    whyAfter1: 'It <b>reads the real source</b> over ADT, edits it, and activates it',
    whyAfter2: '<code>analyze-cbo-obj</code> loads the inventory first, then <b>proposes reuse</b>',
    whyAfter3: 'References for 14 industries and 16 countries load as <b>mandatory context</b>',
    whyAfter4: 'PII, payroll, and banking tables are blocked by <b>four layers of defense</b>',

    impactH2: 'Performance and efficiency, on another level',
    impactLede: 'Run several sessions at once, each working in parallel',
    impactDeckAria: 'Twelve capabilities, dealt four at a time',

    startH2: 'Three moves to get running',
    startLede: 'From install to first run there is no server to stand up and no config file to edit. It all continues inside Claude Code',
    startInstallH: 'Install',
    startInstallP: 'Add the custom marketplace to Claude Code and install the plugin',
    startSetupH: 'Connect',
    startSetupP: 'Answer once for SAP version, industry, and country. The MCP server and permission hooks register themselves',
    startBuildH: 'Work',
    startBuildP: 'Reverse engineering, code review, and program generation split across 25 agents',

    capH2: 'Twelve capabilities',
    capCount: '12 entries',
    capLede: 'Open any entry for the real commands, the output it produces, and how it works',

    contribH2: 'Welcome Contributors!',
    contribLede: 'If the project interests you or you would like to contribute,<br class="br-wide">please get in touch through the Connect details below',

    ctaH2: 'Install it and start in one command',
    ctaP: 'Add it to Claude Code as a custom marketplace. No separate server, no extra account',

    footTagline: 'An open-source plugin that turns Claude Code into a full-stack SAP development assistant',
    footContact: 'Contact',
    footProject: 'Project',
    footMeta: '© Super-Claude for SAP · MIT licensed',
    footBuilt: 'Built on Claude Code + MCP ABAP ADT',

    cap01: '<code>/sc4sap:setup</code> One-click install of the MCP server, permission and blocklist hooks',
    cap02: 'Core 10 · BC 1 · Modules 14. Parallel collaboration via <code>/sc4sap:team</code>',
    cap03: '<code>/sc4sap:program-to-spec</code> Reverse-engineer programs into functional and technical specs',
    cap04: 'Clean ABAP · performance · security static review. Severity-ranked fix suggestions',
    cap05: 'Compare 2-5 programs across 10 dimensions. Detect clones and divergences',
    cap06: 'First-pass analysis of ST22 · SM02 · Gateway logs and profiler, inside Claude',
    cap07: 'Documentation, incident response, and data protection in a single package',
    cap08: '<code>/sc4sap:analyze-cbo-obj</code> So existing Z programs never get rebuilt from scratch',
    cap09: '14 industry references. Retail · Auto · Pharma · Banking · Steel · Utilities',
    cap10: '16-country localization. E-invoicing · banking · tax · statutory reporting',
    cap11: 'Automatic awareness of active module combinations. MM+PS → WBS / SD+CO → CO-PA',
    cap12: 'Complete with Main+Include · ALV · Dynpro · GUI Status · Text Element · ABAP Unit'
  };

  var ja = {
    ackDefault: '上のキーワードのいずれかを押して、ゲートの動作を確認してください',
    ackPass: '<span class="ack-verdict pass">PASS</span> 明示的な肯定キーワード「<b>{kw}</b>」を認識。GetTableContents(BNKA) を許可（呼び出し単位・テーブル単位・セッション単位）',
    ackDeny: '<span class="ack-verdict deny">DENY</span> 曖昧な命令「<b>{kw}</b>」は acknowledge_risk として認められません。明示的なキーワードで再度リクエストしてください',
    navCapabilities: '機能',
    navInstall: 'インストールガイド',
    navContact: '連絡先',
    ariaMenu: 'メニューを開く',
    ariaTheme: 'テーマ切り替え',
    ariaLang: '言語選択',
    ariaCopy: 'インストールコマンドをコピー',
    ariaStars: 'GitHub リポジトリのスター数',

    heroTitle: 'SAP システム全体を<br><em>Claude Code</em> の中で',
    heroLede: '対話で設計し、自動で実装してみてください',
    installLabel: 'Claude Code',
    installNote: 'オープンソース · MIT',
    copy: 'コピー',
    copied: 'コピー済み',
    ghBtn: 'GitHub',

    factPlatformK: '対応プラットフォーム',
    factPlatformV: 'ECC 6.0 · S/4HANA On-Premise · S/4HANA Cloud',
    factToolsK: 'MCP ツール',
    factToolsV: 'ABAP ADT ベース',
    factSkillsK: 'ワークフロースキル',
    factSkillsV: 'setup · create-program · analyze-code · team ···',
    factAgentsK: '専門エージェント',
    factAgentsV: 'Core 10 · Basis 1 · Module 14',

    whyH2: 'AI に SAP 開発を任せると必ず詰まるところ',
    whyLede: '汎用 AI は SAP に直接つながらないので、コードを推測し、すでにあるものをまた作ってしまいます',
    whyNowH: '汎用 AI に任せると',
    whyNow1: '実際のソースを開けないため <b>それらしい ABAP を作り出します</b>',
    whyNow2: '<b>既存の Z オブジェクトを知らないまま</b> 同じ機能をまた作ります',
    whyNow3: '業種と国のルールが抜けたまま <b>標準オブジェクトを誤って選びます</b>',
    whyNow4: '本番データをどこまで読んでよいかの <b>境界がありません</b>',
    whyAfterH: 'SC4SAP をつなぐと',
    whyAfter1: 'ADT 経由で <b>実際のソースを読み</b>、修正し、有効化まで行います',
    whyAfter2: '<code>analyze-cbo-obj</code> でインベントリを先に確認し <b>再利用を提案</b>します',
    whyAfter3: '14 業種と 16 カ国のリファレンスを <b>必須で読み込みます</b>',
    whyAfter4: 'PII · 給与 · 銀行テーブルは <b>4 層の防御</b>で遮断します',

    impactH2: '圧倒的な性能と効率を体験してください',
    impactLede: '複数のセッションで並列作業ができます',
    impactDeckAria: '12 の機能がカード 4 枚に順に現れます',

    startH2: '始めるまで 3 ステップ',
    startLede: 'インストールから最初の作業まで、別途サーバーを立てたり設定ファイルを触る必要はありません。Claude Code の中でそのまま続きます',
    startInstallH: 'インストール',
    startInstallP: 'Claude Code にカスタムマーケットプレイスを追加してプラグインを導入します',
    startSetupH: '接続',
    startSetupP: 'SAP バージョン、業種、国に一度答えるだけで MCP サーバーと権限フックまで登録されます',
    startBuildH: '作業',
    startBuildP: 'リバースエンジニアリング、コードレビュー、プログラム生成を 25 のエージェントが分担します',

    capH2: '12 の機能',
    capCount: '全 12 件',
    capLede: '各項目を開くと、実際のコマンド、生成物、動作の仕組みを確認できます',

    contribH2: 'Welcome Contributors!',
    contribLede: 'プロジェクトにご関心のある方、貢献をお考えの方は、<br class="br-wide">下の Connect の連絡先までお問い合わせください',

    ctaH2: 'インストールすればすぐに使えます',
    ctaP: 'Claude Code にカスタムマーケットプレイスとして追加するだけ。別サーバーも追加アカウントも不要です',

    footTagline: 'Claude Code を SAP フルスタック開発アシスタントに変えるオープンソースプラグインです',
    footContact: '連絡先',
    footProject: 'プロジェクト',
    footMeta: '© Super-Claude for SAP · MIT ライセンス',
    footBuilt: 'Built on Claude Code + MCP ABAP ADT',

    cap01: '<code>/sc4sap:setup</code> MCPサーバー・権限・ブロックリストフックをワンクリック導入',
    cap02: 'Core 10 · BC 1 · Modules 14。<code>/sc4sap:team</code> で並列協働',
    cap03: '<code>/sc4sap:program-to-spec</code> プログラムを機能/技術仕様へリバースエンジニアリング',
    cap04: 'Clean ABAP · 性能 · セキュリティの静的レビュー。重大度順の修正提案',
    cap05: '2-5 本のプログラムを 10 次元で比較。複製・分岐を判別',
    cap06: 'ST22 · SM02 · Gateway ログ · プロファイラを Claude 内で一次分析',
    cap07: 'ドキュメント化 · 障害対応 · データ保護まで、たったひとつのパッケージで',
    cap08: '<code>/sc4sap:analyze-cbo-obj</code> 既存の Z プログラムを作り直さないために',
    cap09: '14 業種のリファレンス。Retail · Auto · Pharma · Banking · Steel · Utilities',
    cap10: '16 カ国のローカライゼーション。電子請求 · 銀行 · 税務 · 法定レポート',
    cap11: '有効モジュールの組み合わせを自動認識。MM+PS → WBS / SD+CO → CO-PA',
    cap12: 'Main+Include · ALV · Dynpro · GUI Status · Text Element · ABAP Unit まで完成'
  };

  /* Capability titles are command-surface names, identical in all languages. */
  var TITLES = [
    'Auto MCP Install', 'Specialist Agents', 'Program Analyze', 'Analyze Code',
    'Compare Programs', 'Maintenance Diagnosis', 'Fit to System', 'Reusability · CBO Reuse',
    'Industry Context', 'Country / Localization', 'Active-Module Awareness',
    'Formatted Auto Program Maker'
  ];

  /* One transcript per capability, in index order, rendered into the card
     deck. Command surface only, so these stay as they are in all three
     languages, the same rule TITLES follows. Illustrative sample output:
     object names and counts stand for a run, they are not measurements.

     `$` lines are the slash commands the docs actually name; `>` lines are
     plain requests, because those capabilities have no command of their
     own and inventing one would be a lie in a monospaced font.

     Written long on purpose. The card is a window onto a working session,
     and a window with four lines in it and the rest empty reads as a
     placeholder rather than as a session. */
  var TERMINALS = [
    '<span class="prompt">$</span> <span class="cmd">/sc4sap:setup</span><br>' +
    '  detect   <span class="dim">Claude Code · plugin sc4sap</span><br>' +
    '  ask      <span class="dim">release · industry · country</span><br>' +
    '<br>' +
    '  <span class="ok">OK</span>  mcp-abap-adt       <span class="dim">registered</span><br>' +
    '  <span class="ok">OK</span>  adt endpoint       <span class="dim">/sap/bc/adt</span><br>' +
    '  <span class="ok">OK</span>  permission hook    <span class="dim">pre-tool-use</span><br>' +
    '  <span class="ok">OK</span>  blocklist          <span class="dim">PII · payroll · banking</span><br>' +
    '  <span class="ok">OK</span>  profiles           <span class="dim">DEV · QAS · PRD</span><br>' +
    '<br>' +
    '  tools    <span class="dim">150+ available</span><br>' +
    '  next     <span class="dim">/sc4sap:team</span>',

    '<span class="prompt">$</span> <span class="cmd">/sc4sap:team</span><br>' +
    '  spawn    <span class="dim">Core 10 · BC 1 · Module 14</span><br>' +
    '<br>' +
    '  abap-architect       <span class="y">running</span>  <span class="dim">structure</span><br>' +
    '  abap-developer       <span class="y">running</span>  <span class="dim">ZMM0010</span><br>' +
    '  mm-consultant        <span class="y">running</span>  <span class="dim">MARA · MARC</span><br>' +
    '  sd-consultant        <span class="y">running</span>  <span class="dim">pricing</span><br>' +
    '  security-reviewer    <span class="y">running</span>  <span class="dim">authority-check</span><br>' +
    '  performance-analyst  <span class="y">running</span>  <span class="dim">SELECT paths</span><br>' +
    '  basis-admin          <span class="dim">queued   transport</span><br>' +
    '<br>' +
    '  <span class="dim">one session · one context · no handover</span>',

    '<span class="prompt">$</span> <span class="cmd">/sc4sap:program-to-spec ZMM0010</span><br>' +
    '  read     <span class="dim">ZMM0010 + 3 includes · 2140 lines</span><br>' +
    '  trace    <span class="dim">Dynpro 9000 · 12 PAI modules</span><br>' +
    '<br>' +
    '  <span class="ok">OK</span>  1  overview<br>' +
    '  <span class="ok">OK</span>  2  screen flow<br>' +
    '  <span class="ok">OK</span>  3  table I/O          <span class="dim">MARA · MARC · MSEG</span><br>' +
    '  <span class="ok">OK</span>  4  exception handling <span class="dim">12 paths</span><br>' +
    '  <span class="ok">OK</span>  5  authorisations     <span class="dim">M_MATE_WRK</span><br>' +
    '  <span class="ok">OK</span>  6  performance notes<br>' +
    '<br>' +
    '  write    <span class="dim">functional spec · technical spec</span>',

    '<span class="prompt">$</span> <span class="cmd">/sc4sap:analyze-code ZSD0042</span><br>' +
    '  scan     <span class="dim">Clean ABAP · performance · security</span><br>' +
    '<br>' +
    '  <span class="y">HIGH</span>    authority-check missing   <span class="dim">l.318</span><br>' +
    '  <span class="y">HIGH</span>    SELECT inside LOOP        <span class="dim">l.442</span><br>' +
    '  <span class="y">HIGH</span>    dynamic WHERE unescaped   <span class="dim">l.507</span><br>' +
    '  <span class="dim">MEDIUM  SELECT * on wide table     l.129</span><br>' +
    '  <span class="dim">MEDIUM  nested LOOP over itab      l.233</span><br>' +
    '  <span class="dim">LOW     naming · magic numbers     l.61</span><br>' +
    '<br>' +
    '  order    <span class="dim">fixes come back worst first</span>',

    '<span class="prompt">&gt;</span> <span class="cmd">compare ZPP0050 and ZPP0083</span><br>' +
    '  read     <span class="dim">2 programs · 10 dimensions</span><br>' +
    '<br>' +
    '  selection screen   <span class="y">clone</span>     <span class="dim">identical</span><br>' +
    '  core logic         <span class="y">clone</span>     <span class="dim">renamed vars</span><br>' +
    '  table access       <span class="y">clone</span><br>' +
    '  exception handling <span class="ok">diverged</span>  <span class="dim">newer in 0083</span><br>' +
    '  output / ALV       <span class="ok">diverged</span><br>' +
    '  authorisations     <span class="ok">diverged</span>  <span class="dim">0050 has none</span><br>' +
    '<br>' +
    '  verdict  <span class="dim">one fork, not two programs</span>',

    '<span class="prompt">&gt;</span> <span class="cmd">read the ST22 dump on ZFI0018</span><br>' +
    '  fetch    <span class="dim">ST22 · last 24h</span><br>' +
    '<br>' +
    '  dump     <span class="y">CONVT_NO_NUMBER</span><br>' +
    '  program  <span class="dim">ZFI0018</span><br>' +
    '  line     <span class="dim">442</span><br>' +
    '  source   <span class="dim">MOVE lv_text TO lv_amount</span><br>' +
    '  cause    <span class="dim">non-numeric value in an amount field</span><br>' +
    '  upstream <span class="dim">interface ZIF_BANK · field BETRG</span><br>' +
    '<br>' +
    '  also     <span class="dim">SM02 · Gateway log · profiler read</span>',

    '<span class="prompt">&gt;</span> <span class="cmd">check ZMM0117 against this system</span><br>' +
    '  probe    <span class="dim">release · industry · country</span><br>' +
    '<br>' +
    '  release   <span class="dim">S/4HANA 2023 On-Premise</span><br>' +
    '  industry  <span class="dim">Automotive</span><br>' +
    '  country   <span class="dim">KR</span><br>' +
    '<br>' +
    '  <span class="y">!</span>  MATNR 18 → 40 chars      <span class="dim">extend</span><br>' +
    '  <span class="y">!</span>  MARD read → MATDOC        <span class="dim">rewrite</span><br>' +
    '  <span class="ok">OK</span> e-Tax invoice fields present<br>' +
    '  <span class="ok">OK</span> authorisation object valid',

    '<span class="prompt">$</span> <span class="cmd">/sc4sap:analyze-cbo-obj</span><br>' +
    '  scan     <span class="dim">Z inventory · reports · classes · FMs</span><br>' +
    '<br>' +
    '  <span class="ok">reuse</span>    ZMM0117   <span class="dim">same function, as is</span><br>' +
    '  <span class="ok">reuse</span>    ZCL_MM_STOCK <span class="dim">method get_batch</span><br>' +
    '  <span class="y">partial</span>  ZMM0182   <span class="dim">selection logic only</span><br>' +
    '  <span class="y">partial</span>  ZMM0203   <span class="dim">ALV layout only</span><br>' +
    '  <span class="dim">new      nothing covers the posting step</span><br>' +
    '<br>' +
    '  saved    <span class="dim">two objects not written again</span><br>' +
    '  next     <span class="dim">/sc4sap:create-program</span>',

    '<span class="prompt">&gt;</span> <span class="cmd">Retail. build the promotion pricing report</span><br>' +
    '  load     <span class="dim">14 industry references</span><br>' +
    '  active   <span class="ok">Retail</span><br>' +
    '<br>' +
    '  pricing    <span class="dim">KONV · KONP · KONH</span><br>' +
    '  promotion  <span class="dim">WAKH · WAKP</span><br>' +
    '  site       <span class="dim">WRF1 · T001W</span><br>' +
    '  listing    <span class="dim">WLK1</span><br>' +
    '<br>' +
    '  <span class="dim">Auto · Pharma · Banking · Steel · Utilities</span><br>' +
    '  <span class="dim">and nine more, loaded before anything is written</span>',

    '<span class="prompt">&gt;</span> <span class="cmd">add the KR statutory report</span><br>' +
    '  load     <span class="dim">16 country packs</span><br>' +
    '  active   <span class="ok">KR</span><br>' +
    '<br>' +
    '  e-Tax invoice   <span class="dim">NTS · real-time issue</span><br>' +
    '  withholding     <span class="dim">income · resident tax</span><br>' +
    '  bank file       <span class="dim">firm banking format</span><br>' +
    '  VAT return      <span class="dim">quarterly</span><br>' +
    '  business place  <span class="dim">J_1BBRANCH</span><br>' +
    '<br>' +
    '  <span class="dim">the rules load with the country, not after review</span>',

    '<span class="prompt">&gt;</span> <span class="cmd">which modules are live here</span><br>' +
    '  probe    <span class="dim">TSTC · config · document flow</span><br>' +
    '<br>' +
    '  active   <span class="ok">MM · PS · SD · CO · FI</span><br>' +
    '<br>' +
    '  MM + PS   <span class="dim">→  WBS settlement on the reservation</span><br>' +
    '  SD + CO   <span class="dim">→  CO-PA characteristics on the billing doc</span><br>' +
    '  FI + CO   <span class="dim">→  real-time integration</span><br>' +
    '<br>' +
    '  <span class="dim">the combination changes the design, so it is read</span><br>' +
    '  <span class="dim">before the design is proposed</span>',

    '<span class="prompt">$</span> <span class="cmd">/sc4sap:create-program ZMM0250</span><br>' +
    '  plan     <span class="dim">from the spec, against this system</span><br>' +
    '<br>' +
    '  <span class="ok">OK</span>  main + include      <span class="dim">TOP · F01 · O01 · I01</span><br>' +
    '  <span class="ok">OK</span>  selection screen    <span class="dim">blocks · variants</span><br>' +
    '  <span class="ok">OK</span>  ALV                 <span class="dim">field catalog · layout</span><br>' +
    '  <span class="ok">OK</span>  Dynpro 9000         <span class="dim">PBO · PAI</span><br>' +
    '  <span class="ok">OK</span>  GUI status / title<br>' +
    '  <span class="ok">OK</span>  text elements       <span class="dim">no hard-coded strings</span><br>' +
    '  <span class="ok">OK</span>  ABAP Unit           <span class="dim">6 tests</span><br>' +
    '<br>' +
    '  activate <span class="dim">syntax clean · transport assigned</span>'
  ];

  return { ko: ko, en: en, ja: ja, titles: TITLES, terminals: TERMINALS };
})();
