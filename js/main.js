/* ============================================================
   main.js — Theme toggle · Mobile nav · marquee · ack demo
   ============================================================ */

// Twemoji parser — convert unicode emoji to SVG images so flags render
// the same on every OS (Windows shows regional indicator pairs as bare
// letters by default; this fixes it).
// IMPORTANT: scoped intentionally — applied ONLY inside the country
// carousel + its synced active-country detail (where the flags live).
// Other emoji on the page (cap-card icons, hero, footer, industry chips)
// stay as native OS emoji so they keep their original size + shape.
function parseTwemoji(node) {
  if (!node || !window.twemoji) return;
  try {
    window.twemoji.parse(node, { folder: 'svg', ext: '.svg' });
  } catch (e) { /* ignore */ }
}

// Theme toggle — persists to localStorage, respects system preference on first load
(function initThemeToggle() {
  const STORAGE_KEY = 'sc4sap-theme';
  const root = document.documentElement;

  function apply(theme) {
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
  }

  function readStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function writeStored(theme) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* ignore */ }
  }

  // Initial resolve — stored preference wins; otherwise fall back to OS preference
  const stored = readStored();
  if (stored === 'dark' || stored === 'light') {
    apply(stored);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    apply('dark');
  }

  // Wire up toggle button
  const btn = document.querySelector('[data-theme-toggle]');
  if (btn) {
    btn.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      apply(next);
      writeStored(next);
    });
  }

  // Track OS theme only while user has no explicit preference stored
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  mql.addEventListener?.('change', (e) => {
    if (readStored()) return;      // user already chose — don't override
    apply(e.matches ? 'dark' : 'light');
  });
})();


// Infinite marquee slider — duplicates children once so @keyframes -50% translateX
// lands exactly on the mirror copy → seamless loop.
(function initMarquee() {
  document.querySelectorAll('.marquee').forEach(root => {
    const track = root.querySelector('.marquee-track');
    if (!track) return;

    // Set animation duration from data attribute (seconds)
    const duration = parseInt(root.dataset.duration, 10);
    if (!Number.isNaN(duration) && duration > 0) {
      track.style.setProperty('--marquee-duration', duration + 's');
    }

    // Clone children once for seamless loop
    const originals = Array.from(track.children);
    originals.forEach(node => {
      const clone = node.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');   // duplicate — skip for screen readers
      clone.setAttribute('tabindex', '-1');        // and for keyboard nav
      track.appendChild(clone);
    });
  });
})();

// Mobile hamburger
(function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  // Close on anchor click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

// Nav scroll reaction — condense + elevate the bar once the page has moved.
// rAF-throttled scroll for smoothness.
(function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  let ticking = false;
  function update() {
    ticking = false;
    const y = window.scrollY || document.documentElement.scrollTop;
    // Hysteresis — the sticky nav condenses (its height shrinks) when the
    // 'scrolled' class lands, which shifts scrollY itself. A single 8px
    // threshold made the class flip back and forth around that point,
    // visibly vibrating the page. Engage at 36px, release only below 4px.
    const isScrolled = nav.classList.contains('scrolled');
    if (!isScrolled && y > 36)     nav.classList.add('scrolled');
    else if (isScrolled && y < 4)  nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();

// Capability card → detail panel renderer
// Clicking any #01..#12 cap-card populates the panel above with full info.
(function initCapabilityDetail() {
  const cards = document.querySelectorAll('.cap-grid .cap-card');
  const panel = document.querySelector('[data-cap-detail]');
  if (!cards.length || !panel) return;

  const head = (no, icon, title, cmd) =>
    `<div class="capd-hd">
       <span class="capd-no">#${no}</span>
       <span class="capd-icon">${icon}</span>
       <h3>${title}</h3>
       ${cmd ? `<code class="capd-cmd">${cmd}</code>` : ''}
     </div>`;

  const DETAILS = {
    '01': { html: `<div class="capd capd-01">
      ${head('01','🔧','Auto MCP Install','/sc4sap:setup')}
      <p class="capd-lede">
        SAP 개발 환경을 꾸리다 보면 MCP 서버 설치 · 인증 정보 분리 · 권한 훅 등록 · SPRO 캐시 생성까지
        반나절이 사라집니다, SC4SAP는 이 과정을 질문 하나당 한 답으로 분해해<br/><b>셋업 마법사 안에서 끝냅니다</b>
      </p>

      <div class="setup-wrap">
        <ul class="check-list">
          <li>
            <span class="check">1</span>
            <div><b>MCP 서버 자동 설치</b> — <code>abap-mcp-adt-powerup</code>을 클론 · 빌드 · 등록합니다
            <code>claude_desktop_config.json</code> 직접 편집 불필요</div>
          </li>
          <li>
            <span class="check">2</span>
            <div><b>.sc4sap/sap.env 자동 생성</b> — URL · 클라이언트 · 계정 · 인증 방식을 한 줄씩 묻고 저장
            <br/>비밀번호 마스킹 + <code>sap.env.bak</code> 백업</div>
          </li>
          <li>
            <span class="check">3</span>
            <div><b>버전·업종·국가 동기화</b> — SAP 버전 · ABAP 릴리즈 · 업종 · 국가를
            <code>.sc4sap/config.json</code>에 기록 <br/>모든 에이전트가 같은 컨텍스트 공유</div>
          </li>
          <li>
            <span class="check">4</span>
            <div><b>데이터 추출 블록리스트 훅 등록</b> — BNKA 스모크 테스트로
            <br/><code>permissionDecision: deny</code>가 정상 동작하는지 검증</div>
          </li>
        </ul>

        <div class="terminal" aria-hidden="true">
          <div class="terminal-bar"><span></span><span></span><span></span></div>
          <div class="terminal-body">
<span class="prompt">$</span> <span class="cmd">/sc4sap:setup</span><br/>
<span class="dim">→ SAP 시스템: </span><span class="y">S4 / ECC ?</span> <span class="ok">S4</span><br/>
<span class="dim">→ ABAP Release ?</span> <span class="ok">756</span><br/>
<span class="dim">→ Industry ?</span> <span class="ok">automotive</span><br/>
<span class="dim">→ MCP 서버 설치 중…</span> <span class="ok">✓ done</span><br/>
<span class="dim">→ SAP 연결 테스트…</span> <span class="ok">✓ GetSession OK</span><br/>
<span class="dim">→ 블록리스트 훅 등록…</span> <span class="ok">✓ deny(BNKA) 확인</span><br/>
<br/>
<span class="y">setup complete.</span> <span class="dim">ready to code.</span>
          </div>
        </div>
      </div>

      <div class="tagline-strong">
        결과 — SAP 시스템 정보만 한 번 답하면 MCP 서버 설치부터 권한 검증, 블록리스트 훅 등록까지 한 번에 완료되며
        팀원이 같은 환경을 다시 셋업할 때도 <code>sap.env</code> 하나의 파일만 공유하면 됩니다
      </div>
    </div>` },

    '02': { html: `<div class="capd capd-02">
      ${head('02','🧠','Specialist Agents','25 agents · 역할별 전문 협업')}
      <p class="capd-lede">하나의 프롬프트가 모든 결정을 내리지 않습니다. 분석 · 설계 · 구현 · 리뷰 · 디버깅이 <b>역할별 전문 에이전트</b>에게 위임되고, 모듈별 업무 판단은 컨설턴트로 다시 에스컬레이션됩니다
      <br/>같은 SAP 작업을 generalist 한 명이 처리하던 패턴과는 정반대 — 각자 자기 분야에서만 답하고, "그럴싸한 SAP 지식"으로 답을 지어내는 경로 자체가 구조적으로 막혀 있습니다</p>

      <div class="agent-heads">
        <div class="agent-head">
          <span class="count">CORE · 10</span>
          <h4>설계 · 구현 · 리뷰</h4>
          <p>analyst · architect · planner · executor · code-reviewer<br/>critic · debugger · qa-tester · doc-specialist · writer</p>
        </div>
        <div class="agent-head yellow">
          <span class="count">BASIS · 1</span>
          <h4>시스템 · 트랜스포트</h4>
          <p>sap-bc-consultant<br/>트랜스포트 전략 · 덤프 · 성능 튜닝 전담</p>
        </div>
        <div class="agent-head">
          <span class="count">MODULES · 14</span>
          <h4>모듈 컨설턴트</h4>
          <p>SD · MM · FI · CO · PP · PS · PM · QM · WM · TM · TR<br/>HCM · BW · Ariba</p>
        </div>
      </div>

      <div class="modules-cloud">
        <h4>Basis &amp; Module Consultants</h4>
        <div class="chip-row">
          <span class="chip blue">sap-bc-consultant</span>
          <span class="chip">SD</span>
          <span class="chip">MM</span>
          <span class="chip">FI</span>
          <span class="chip">CO</span>
          <span class="chip">PP</span>
          <span class="chip">PS</span>
          <span class="chip">PM</span>
          <span class="chip">QM</span>
          <span class="chip">WM</span>
          <span class="chip">TM</span>
          <span class="chip">TR</span>
          <span class="chip">HCM</span>
          <span class="chip">BW</span>
          <span class="chip">Ariba</span>
        </div>
      </div>

      <div class="rules-list">
        <h4>병렬 협업 — <code>/sc4sap:team</code></h4>
        <ul>
          <li>여러 에이전트가 같은 태스크 리스트를 공유해 <b>병렬로 작업</b> — R/W 권한과 컨텍스트는 격리됩니다</li>
          <li>모듈 판단이 필요하면 <b>"## Module Consultation Needed"</b> 블록으로 해당 컨설턴트에게 자동 위임</li>
          <li>시스템 레벨 이슈(트랜스포트 · 권한 · 성능)는 BC 컨설턴트로 별도 에스컬레이션</li>
        </ul>
      </div>
    </div>` },

    '03': { html: `<div class="capd capd-03">
      ${head('03','🔍','Program Analyze','/sc4sap:program-to-spec')}
      <p class="capd-lede">레거시 ABAP을 기능/기술 명세서로 — <b>역공학을 분 단위로</b></p>
      <p class="capd-desc">3,000줄짜리 리포트도 Selection screen 이미지 · ALV 컬럼 레이아웃 · Process flowchart · CBO·Enhancement 의존성까지 자동 추출됩니다
      <br/>Audience / Format / Depth / Language <b>4축 Socratic 질문</b>으로 깊이를 조정해 "전부 문서화" 함정을 회피합니다
      <br/>운영 인계 · 감사 대응 · 시스템 마이그레이션 직전의 레거시 정리 — 사람이 일일이 코드를 읽으며 작성하던 명세서를 분 단위로 압축하고, Excel/Markdown 두 포맷으로 동시에 산출합니다</p>

      <!-- Pipeline flow: 4 steps with auto-arrows -->
      <div class="capd-flow">
        <div class="capd-flow-step"><b>STEP 1</b><span>Source 로드</span><small><code>GetProgFullCode</code><br/>Includes · Forms · Classes</small></div>
        <div class="capd-flow-step"><b>STEP 2</b><span>구조 추출</span><small>Selection · ALV<br/>Logic · CBO · Enhancement</small></div>
        <div class="capd-flow-step"><b>STEP 3</b><span>시각화 렌더</span><small>Selection PNG · ALV PNG<br/>Process Flowchart</small></div>
        <div class="capd-flow-step"><b>STEP 4</b><span>5-Sheet XLSX</span><small>Cover · Inputs · Logic<br/>CBO · Warnings</small></div>
      </div>

      <!-- xlsx output: sectioned sheet list (header + per-sheet rows) -->
      <div class="capd-xlsx">
        <div class="capd-xlsx-head">
          <span class="icon">📒</span>
          <code>ZSDR0142_spec.xlsx</code>
          <span class="meta">5 sheets + warnings</span>
        </div>
        <ul class="capd-xlsx-rows">
          <li>
            <span class="capd-xlsx-no">01</span>
            <div>
              <h6>Cover</h6>
              <p>프로그램 ID · 작성자 · 최종 수정 · 4축 메타</p>
            </div>
          </li>
          <li>
            <span class="capd-xlsx-no">02</span>
            <div>
              <h6>Selection</h6>
              <p>Selection screen <b>PNG 임베드</b> + 파라미터 표</p>
            </div>
          </li>
          <li>
            <span class="capd-xlsx-no">03</span>
            <div>
              <h6>Inputs / Screens</h6>
              <p>ALV 컬럼 레이아웃 PNG · 필드 설명 · 길이</p>
            </div>
          </li>
          <li>
            <span class="capd-xlsx-no">04</span>
            <div>
              <h6>Process Logic</h6>
              <p><b>Process Flowchart</b> 자동 렌더 (박스 · 결정 · 종료 + ↓)</p>
            </div>
          </li>
          <li>
            <span class="capd-xlsx-no">05</span>
            <div>
              <h6>CBO / Enhancement</h6>
              <p>Z 오브젝트 의존성 트리 · BAdI · CMOD · APPEND</p>
            </div>
          </li>
          <li class="warn">
            <span class="capd-xlsx-no">⚠</span>
            <div>
              <h6>Warnings</h6>
              <p>파싱 불가 · 위험 패턴 · 미해결 항목</p>
            </div>
          </li>
        </ul>
      </div>
    </div>` },

    '04': { html: `<div class="capd capd-04">
      ${head('04','🧪','Analyze Code','/sc4sap:analyze-code')}
      <p class="capd-lede">Clean ABAP · 성능 · 보안 · 현대화 — <b>severity-ranked 정적 리뷰</b></p>
      <p class="capd-desc">프로젝트의 <code>ABAP_RELEASE</code> / SAP version 컨텍스트를 반영해 <b>적용 가능한 패턴만</b> 권장합니다
      <br/>OOP / Procedural 패러다임을 자동 인지하고, Where-used 그래프로 영향도까지 함께 제시. 라인 번호 · 호출 경로 · 즉시 적용 가능한 fix snippet을 한 묶음으로 돌려줍니다
      <br/>보안 카테고리는 SQL Injection · AUTHORITY-CHECK 누락 · 동적 코드 실행 같은 OWASP 패턴을 정적 분석으로 탐지하고
      <br/>성능 카테고리는 중첩 LOOP·SELECT를 sorted/hashed table look-up으로 리팩토링하는 구체적 패치 코드까지 첨부합니다</p>

      <!-- 4 review categories — chevron-stitched infographic with SAP-brand gradient
           (deep blue → sap blue → sap cyan → sap yellow) -->
      <svg class="capd-info4-svg" viewBox="0 0 760 220" xmlns="http://www.w3.org/2000/svg" aria-label="Analyze Code 4 review categories" role="img">
        <defs>
          <linearGradient id="info4_g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0B4FA8"/><stop offset="100%" stop-color="#003A8F"/></linearGradient>
          <linearGradient id="info4_g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0070F2"/><stop offset="100%" stop-color="#0058C4"/></linearGradient>
          <linearGradient id="info4_g3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#33B6FF"/><stop offset="100%" stop-color="#0FAAFF"/></linearGradient>
          <linearGradient id="info4_g4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FFD13E"/><stop offset="100%" stop-color="#FFC700"/></linearGradient>
          <filter id="info4_shadow" x="-5%" y="-5%" width="110%" height="125%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2.5"/>
            <feOffset dx="0" dy="2" result="ofb"/>
            <feComponentTransfer><feFuncA type="linear" slope="0.10"/></feComponentTransfer>
            <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <!-- White card backgrounds (4 separate panels with light shadow) -->
        <g filter="url(#info4_shadow)" class="info4-bg">
          <rect x="6"   y="100" width="178" height="115" rx="12"/>
          <rect x="194" y="100" width="178" height="115" rx="12"/>
          <rect x="382" y="100" width="178" height="115" rx="12"/>
          <rect x="570" y="100" width="178" height="115" rx="12"/>
        </g>

        <!-- Top chevron sections — Panel 1: rounded left + tip right -->
        <path d="M 18 5 L 184 5 L 200 50 L 184 95 L 18 95 Q 6 95 6 83 L 6 17 Q 6 5 18 5 Z" fill="url(#info4_g1)"/>
        <!-- Panel 2: notch left + tip right -->
        <path d="M 194 5 L 372 5 L 388 50 L 372 95 L 194 95 L 210 50 Z" fill="url(#info4_g2)"/>
        <!-- Panel 3: notch left + tip right -->
        <path d="M 382 5 L 560 5 L 576 50 L 560 95 L 382 95 L 398 50 Z" fill="url(#info4_g3)"/>
        <!-- Panel 4: notch left + rounded right -->
        <path d="M 570 5 L 736 5 Q 748 5 748 17 L 748 83 Q 748 95 736 95 L 570 95 L 586 50 Z" fill="url(#info4_g4)"/>

        <!-- Icons in chevron tops — vertical center y=38 (chevron mid = 50, icon group sits slightly above to share center with title below) -->
        <text x="95"  y="38" text-anchor="middle" font-size="24" dominant-baseline="middle">🧼</text>
        <text x="290" y="38" text-anchor="middle" font-size="24" dominant-baseline="middle">🚀</text>
        <text x="478" y="38" text-anchor="middle" font-size="24" dominant-baseline="middle">🛡️</text>
        <text x="660" y="38" text-anchor="middle" font-size="24" dominant-baseline="middle">✨</text>

        <!-- Titles — y=68 with middle baseline → icon (38) + title (68) form a centered pair around y=53, visually balanced inside chevron -->
        <text x="95"  y="68" text-anchor="middle" dominant-baseline="middle" font-size="11.5" font-weight="800" letter-spacing="2" class="info4-tt-w">CLEAN ABAP</text>
        <text x="290" y="68" text-anchor="middle" dominant-baseline="middle" font-size="11.5" font-weight="800" letter-spacing="2" class="info4-tt-w">PERFORMANCE</text>
        <text x="478" y="68" text-anchor="middle" dominant-baseline="middle" font-size="11.5" font-weight="800" letter-spacing="2" class="info4-tt-w">SECURITY</text>
        <text x="666" y="68" text-anchor="middle" dominant-baseline="middle" font-size="11.5" font-weight="800" letter-spacing="2" class="info4-tt-d">MODERNIZATION</text>

        <!-- Body text — 3 lines centered both axes inside the white card (y 100→215, center y=157.5).
             Lines at y=137 / 157 / 177 with dominant-baseline=middle = visual centers there. font 13 (was 11). -->
        <g class="info4-bd">
          <text x="95"  y="137" text-anchor="middle" dominant-baseline="middle" font-size="13">네이밍 · 단일 책임</text>
          <text x="95"  y="157" text-anchor="middle" dominant-baseline="middle" font-size="13">매직 넘버 · 글로벌 변수</text>
          <text x="95"  y="177" text-anchor="middle" dominant-baseline="middle" font-size="13">OOP / Procedural 일관성</text>

          <text x="283" y="137" text-anchor="middle" dominant-baseline="middle" font-size="13">SELECT 패턴 · 인덱스</text>
          <text x="283" y="157" text-anchor="middle" dominant-baseline="middle" font-size="13">중첩 LOOP · INTO TABLE</text>
          <text x="283" y="177" text-anchor="middle" dominant-baseline="middle" font-size="13">sorted / hashed 사용</text>

          <text x="471" y="137" text-anchor="middle" dominant-baseline="middle" font-size="13">SQL Injection</text>
          <text x="471" y="157" text-anchor="middle" dominant-baseline="middle" font-size="13">AUTHORITY-CHECK 누락</text>
          <text x="471" y="177" text-anchor="middle" dominant-baseline="middle" font-size="13">동적 코드 sanitize</text>

          <text x="659" y="137" text-anchor="middle" dominant-baseline="middle" font-size="13">VALUE / REDUCE / COND</text>
          <text x="659" y="157" text-anchor="middle" dominant-baseline="middle" font-size="13">FILTER · 람다식</text>
          <text x="659" y="177" text-anchor="middle" dominant-baseline="middle" font-size="13">신규 syntax 도입</text>
        </g>
      </svg>

      <!-- Sample severity findings — top 3 issues from a typical legacy report -->
      <div class="capd-sev">
        <div class="capd-sev-row"><span class="capd-sev-tag crit">CRITICAL</span><span class="capd-sev-text"><b>SQL Injection 가능성</b> — 동적 WHERE 절에 사용자 입력이 직접 결합됩니다 (line 412). <code>WHERE (lv_where)</code> → escaped binding으로 교체</span></div>
        <div class="capd-sev-row"><span class="capd-sev-tag crit">CRITICAL</span><span class="capd-sev-text"><b>AUTHORITY-CHECK 누락</b> — <code>BUKRS</code> 기반 조회 후 권한 검증 없이 출력 (line 78). <code>F_BKPF_BUK</code> 권한 객체 체크 추가 필요</span></div>
        <div class="capd-sev-row"><span class="capd-sev-tag maj">MAJOR</span><span class="capd-sev-text"><b>SELECT … ENDSELECT 루프</b> — <code>INTO TABLE</code> + <code>LOOP AT</code>으로 변경 시 약 <b>70% 성능 개선</b> 예상</span></div>
      </div>
    </div>` },

    '05': { html: `<div class="capd capd-05">
      ${head('05','⚖️','Compare Programs','/sc4sap:compare-programs')}
      <p class="capd-lede">같은 일을 하는 프로그램이 왜 두 개, 세 개씩 돌아가는지</p>
      <p class="capd-desc">
        <code>/sc4sap:compare-programs</code> — 2~5개의 ABAP 프로그램을 동시에 로드해
        <b>10개 차원에서 구조적으로 비교</b>합니다
        <br/>"복사해서 고친 프로그램"과 "진짜 다른 프로그램"을 구별해 통합 · 폐기 · 공통화 판단의 근거를 만듭니다
      </p>

      <div class="cmp-stage">
        <div class="cmp-window">
          <div class="cmp-titlebar">
            <span class="cmp-dot r"></span>
            <span class="cmp-dot y"></span>
            <span class="cmp-dot g"></span>
            <span class="cmp-tab">/sc4sap:compare-programs · ZSDR0142 · ZSDR0188</span>
          </div>
          <div class="cmp-body">
            <div class="cmp-col">
              <div class="cmp-col-head">
                <span class="cmp-col-tag">A</span>
                <code>ZSDR0142</code>
                <span class="cmp-col-meta">SD · 2019</span>
              </div>
              <ul class="cmp-rows">
                <li class="match"><span class="cmp-bullet">●</span><span class="cmp-row-label">목적·범위</span><span class="cmp-row-val">미수금 리포트</span></li>
                <li class="diff"><span class="cmp-bullet">◐</span><span class="cmp-row-label">선택 화면</span><span class="cmp-row-val">P_BUKRS · S_KUNNR</span></li>
                <li class="match"><span class="cmp-bullet">●</span><span class="cmp-row-label">데이터 소스</span><span class="cmp-row-val">BSID + KNA1</span></li>
                <li class="opp"><span class="cmp-bullet">○</span><span class="cmp-row-label">출력 구조</span><span class="cmp-row-val">List (WRITE)</span></li>
                <li class="diff"><span class="cmp-bullet">◐</span><span class="cmp-row-label">메시지 처리</span><span class="cmp-row-val">MESSAGE I999</span></li>
              </ul>
            </div>
            <div class="cmp-divider" aria-hidden="true"><span class="cmp-vs">VS</span></div>
            <div class="cmp-col">
              <div class="cmp-col-head">
                <span class="cmp-col-tag b">B</span>
                <code>ZSDR0188</code>
                <span class="cmp-col-meta">SD · 2023</span>
              </div>
              <ul class="cmp-rows">
                <li class="match"><span class="cmp-bullet">●</span><span class="cmp-row-label">목적·범위</span><span class="cmp-row-val">미수금 리포트</span></li>
                <li class="diff"><span class="cmp-bullet">◐</span><span class="cmp-row-label">선택 화면</span><span class="cmp-row-val">+ S_BLDAT 추가</span></li>
                <li class="match"><span class="cmp-bullet">●</span><span class="cmp-row-label">데이터 소스</span><span class="cmp-row-val">BSID + KNA1</span></li>
                <li class="opp"><span class="cmp-bullet">○</span><span class="cmp-row-label">출력 구조</span><span class="cmp-row-val">CL_GUI_ALV_GRID</span></li>
                <li class="diff"><span class="cmp-bullet">◐</span><span class="cmp-row-label">메시지 처리</span><span class="cmp-row-val">BAL_LOG</span></li>
              </ul>
            </div>
          </div>
          <div class="cmp-legend">
            <span><b class="cmp-bullet" style="color:var(--ok)">●</b> 동일</span>
            <span><b class="cmp-bullet" style="color:#B88900">◐</b> 차이</span>
            <span><b class="cmp-bullet" style="color:var(--danger)">○</b> 상반</span>
            <span class="cmp-legend-meta">10개 차원 중 5개 표시 · 실제 리포트는 목적·범위 / 선택화면 / 데이터소스 / 비즈니스로직 / 출력 / UI / 메시지 / 성능 / Text Element / CBO·Enhancement 전 차원 비교</span>
          </div>
        </div>

        <div class="callout cmp-verdict">
          <span class="cmp-verdict-mark">VERDICT</span>
          수년간 "비슷한데 조금 다른" 3개의 Z 리포트가 떠돌던 프로젝트에서,
          10차원 비교 리포트 하나로 통합·폐기·표준화 결정을 한 번에 내릴 수 있습니다
          <br/>AI가 "새로 만들자"고 제안하기 전에, <b>이미 있는 프로그램을 먼저 본다</b>는 원칙이
          이 기능으로 운영까지 확장됩니다
        </div>
      </div>
    </div>` },

    '06': { html: `<div class="capd capd-06">
      ${head('06','🩺','Maintenance Diagnosis','/sc4sap:analyze-symptom')}
      <p class="capd-lede">덤프 ID만 주면 SAP Note 후보까지, Claude 안에서 1차 분석 종료.</p>
      <p class="capd-desc">ST22 · SM02 · /IWFND/ERROR_LOG · SAT 프로파일러를 MCP 도구로 직접 끌어와 분석합니다. <code>sap-debugger</code> / <code>sap-bc-consultant</code>에 자동 위임되어 모르는 영역까지 안전하게 확장됩니다
      <br/>단순 스택 트레이스 출력이 아니라 <b>호출 체인 · 변수 덤프 · 메모리 상태</b>를 통합해 가설을 제시하고, 후속 액션(Note 적용 · 코드 수정 · 권한 추가)을 선택지로 돌려줍니다
      <br/>운영 인계 직후 처음 보는 덤프도 1차 분석을 마치고 BC팀에 정확한 질문으로 넘길 수 있습니다</p>

      <div class="capd-flow">
        <div class="capd-flow-step"><b>STEP 1</b><span>덤프 수집</span><small><code>RuntimeListDumps</code><br/><code>RuntimeAnalyzeDump</code></small></div>
        <div class="capd-flow-step"><b>STEP 2</b><span>스택 분석</span><small>호출 체인 · Source 위치 · 변수 덤프</small></div>
        <div class="capd-flow-step"><b>STEP 3</b><span>원인 가설</span><small>Lock · Memory · Auth · DB · Network</small></div>
        <div class="capd-flow-step"><b>STEP 4</b><span>SAP Note 후보</span><small>검색 키워드 + 액션 선택지</small></div>
      </div>

      <div class="capd-chips">
        <span class="chip2">🔥 ST22 Runtime Dumps</span>
        <span class="chip2">📢 SM02 System Msgs</span>
        <span class="chip2">🌐 /IWFND/ERROR_LOG</span>
        <span class="chip2">⏱️ SAT Profiler</span>
        <span class="chip2">🔓 SU53 Auth Check</span>
        <span class="chip2">🚧 SM12 Lock Entries</span>
      </div>
    </div>` },

    '07': { html: `<div class="capd capd-07">
      ${head('07','🔒','Fit to System')}
      <p class="capd-lede">운영 현장이 실제로 원하는 세 가지 — <b>문서화 · 장애 대응 · 데이터 보호</b></p>
      <p class="capd-desc">
        생성 기능만으로는 현업 SAP 운영 환경에 완전히 적용시키기는 어렵습니다
        <br/>sc4sap은 신규 개발 외에
        레거시 문서화, 장애 1차 분석, 엔터프라이즈급 데이터 보호까지 <b>한 패키지 안에서 제공</b>합니다
      </p>

      <div class="fit-wrap">
        <div class="fit-card">
          <div class="fit-icon">📄</div>
          <h4>Reverse Engineering</h4>
          <p><b>레거시를 스펙으로 되돌리기</b><br/><code>/sc4sap:analyze-code</code> · <code>/sc4sap:program-to-spec</code></p>
          <ul>
            <li>Clean ABAP · 성능 · 보안 카테고리별 리뷰 리포트</li>
            <li>기능/기술 명세서(Markdown 또는 Excel) 자동 생성</li>
            <li>Socratic 스코프 조정으로 "전부 문서화" 함정 회피</li>
            <li>수년간 미뤄진 레거시 문서화 작업이 분 단위로 압축</li>
          </ul>
        </div>
        <div class="fit-card y">
          <div class="fit-icon">🩺</div>
          <h4>Operational Triage</h4>
          <p><b>Claude 안에서 끝내는 장애 분석</b><br/><code>/sc4sap:analyze-symptom</code></p>
          <ul>
            <li><b>ST22 덤프</b> — <code>RuntimeListDumps</code> / <code>RuntimeAnalyzeDump</code></li>
            <li><b>SM02 시스템 메시지</b> — <code>RuntimeListSystemMessages</code></li>
            <li><b>/IWFND/ERROR_LOG</b> Gateway 오류 — <code>RuntimeGetGatewayErrorLog</code></li>
            <li><b>SAT 프로파일러</b> — <code>RuntimeAnalyzeProfilerTrace</code></li>
            <li>스택 트레이스 분석 → SAP Note 후보 → 원인 가설 → 액션 선택지</li>
          </ul>
        </div>
        <div class="fit-card g">
          <div class="fit-icon">🔒</div>
          <h4>Data Protection</h4>
          <p><b>4중 방어 + acknowledge_risk HARD RULE</b><br/>PII · 급여 · 뱅킹 · 거래 재무 행 단위 유출 원천 차단</p>
          <ul>
            <li>L1 에이전트 지시문 — 카테고리별 거부 + 대안 제시</li>
            <li>L2 전역 <code>CLAUDE.md</code> — 모든 세션 자동 주입</li>
            <li>L3 <code>PreToolUse</code> 훅 — 호출 차단 (deny)</li>
            <li>L4 MCP 서버 내부 가드 — opt-in 서버 레벨 차단</li>
          </ul>
        </div>
      </div>

      <h3 class="subhead">4중 방어 레이어 구조 <span class="ln"></span></h3>
      <div class="defense-table">
        <table>
          <thead>
            <tr><th>Layer</th><th>위치</th><th>역할</th></tr>
          </thead>
          <tbody>
            <tr><td>L1</td><td>에이전트 지시문</td><td>카테고리별 거부 + 대안 제시 (PII / HR / Banking / Transactional Finance ···)</td></tr>
            <tr><td>L2</td><td><code>CLAUDE.md</code> 전역</td><td>모든 세션에 자동 주입되는 Data Extraction Policy</td></tr>
            <tr><td>L3</td><td>Claude Code <code>PreToolUse</code> 훅</td><td><code>permissionDecision: deny</code>로 실제 MCP 호출 차단</td></tr>
            <tr><td>L4</td><td>MCP 서버 내부 가드</td><td>서버 레벨에서 opt-in 차단 — 다른 클라이언트 호출도 봉쇄</td></tr>
          </tbody>
        </table>
      </div>

      <h3 class="subhead">블록리스트 프로파일 — 환경에 맞게 스코프 선택 <span class="ln"></span></h3>
      <div class="profile-row">
        <div class="profile strict">
          <span class="name">strict</span>
          <p>PII + 크리덴셜 + HR + 거래 재무 + 감사 로그 + 워크플로. <b>기본값</b>.</p>
        </div>
        <div class="profile standard">
          <span class="name">standard</span>
          <p>PII + 크리덴셜 + HR + 거래 재무. 일반 프로젝트 기본값.</p>
        </div>
        <div class="profile minimal">
          <span class="name">minimal</span>
          <p>PII + 크리덴셜 + HR + Tax. 업무 테이블 조회는 허용.</p>
        </div>
        <div class="profile custom">
          <span class="name">custom</span>
          <p><code>.sc4sap/blocklist-custom.txt</code>에 사용자 지정 리스트.</p>
        </div>
      </div>

      <div class="hard-rule">
        <span class="tag-hard">HARD RULE</span>
        <h4><code>acknowledge_risk</code> — per-call · per-table · per-session 명시적 승인</h4>
        <p>
          <code>GetTableContents</code> / <code>GetSqlQuery</code>로 민감 테이블에 접근하려면,
          사용자가 <b>명시적 긍정 키워드</b>로 허가해야 합니다.
        </p>
        <p>
          인정되는 표현:
          <span class="kw">yes</span>
          <span class="kw">승인</span>
          <span class="kw">authorize</span>
          <span class="kw">approve</span>
          <span class="kw">proceed</span>
          <span class="kw">confirmed</span>
        </p>
        <p>
          인정하지 않는 표현(모호한 명령):
          <span class="bad">뽑아봐</span>
          <span class="bad">try it</span>
          <span class="bad">my mistake</span>
          <span class="bad">해봐</span>
        </p>
        <p style="margin-top:14px;">
          승인은 <b>호출 단위 · 테이블 단위 · 세션 단위로만 유효</b>하며, 다음 요청으로 이월되지 않습니다.
          <b>"AI가 실수로 민감 테이블을 뽑는 경로" 자체를 없애는 것</b>이 설계 목표입니다.
        </p>
      </div>

      <div class="ack-demo">
        <h5>▶ 게이트 체험 — 키워드를 클릭해 보세요</h5>
        <div class="ack-buttons">
          <button class="ack-btn" data-kw="yes">yes</button>
          <button class="ack-btn" data-kw="승인">승인</button>
          <button class="ack-btn" data-kw="authorize">authorize</button>
          <button class="ack-btn" data-kw="approve">approve</button>
          <button class="ack-btn" data-kw="뽑아봐">뽑아봐</button>
          <button class="ack-btn" data-kw="try it">try it</button>
          <button class="ack-btn" data-kw="my mistake">my mistake</button>
          <button class="ack-btn" data-kw="해봐">해봐</button>
        </div>
        <div class="ack-output" aria-live="polite">→ 위 키워드 중 하나를 클릭해 게이트 동작을 확인하세요.</div>
      </div>
    </div>` },

    '08': { html: `<div class="capd capd-08">
      ${head('08','🗃️','Reusability · CBO Reuse','/sc4sap:analyze-cbo-obj')}
      <p class="capd-lede">이미 있는 Z 오브젝트를 AI가 다시 만들지 않도록.</p>
      <p class="capd-desc">
        수 년간 사용해온 SAP 시스템일수록 <code>ZCL_*</code> · <code>ZFM_*</code> · <code>Z*_DE</code> · 커스텀 구조체·테이블 타입이
        수백 개씩 쌓여 있습니다, 이 자산을 모른 채 AI에게 개발을 맡기게되면
        <br/><b>같은 기능의 Z 오브젝트를 또 만드는 것</b>이 반복되는데, SC4SAP 는 이 문제를 파이프라인 앞단에서 차단합니다
      </p>

      <div class="reuse-cross">
        <div class="rx-card rx-top">
          <div class="rx-icon">🧷</div>
          <code>CMOD</code>
          <h5>User Exits</h5>
          <p>Enhancement Project · FM Exit · Screen Exit</p>
        </div>
        <div class="rx-card rx-left">
          <div class="rx-icon">⚖️</div>
          <code>GGB1 · GGB2</code>
          <h5>Substitution / Validation</h5>
          <p>재무·물류 치환·검증 룰</p>
        </div>
        <div class="rx-hub">
          <span class="rx-hub-eyebrow">REUSE FIRST</span>
          <h4>이미 있는 자산을<br/>먼저 제안합니다</h4>
          <code class="rx-hub-cmd">/sc4sap:analyze-cbo-obj</code>
          <ul class="rx-hub-bullets">
            <li><b>create-program</b>이 플랜 단계에서 인벤토리 로드</li>
            <li>모든 <code>Create*</code> 호출은 <b>재사용 게이트</b> 통과 필수</li>
            <li>1회 스캔 → 수 주간 같은 인벤토리 공유</li>
          </ul>
        </div>
        <div class="rx-card rx-right">
          <div class="rx-icon">🔌</div>
          <code>BAdI</code>
          <h5>Business Add-In</h5>
          <p>Classic / Kernel / Enhancement Spot<br/>구현 클래스</p>
        </div>
        <div class="rx-card rx-bot">
          <div class="rx-icon">➕</div>
          <code>APPEND</code>
          <h5>Structure Append</h5>
          <p>표준 테이블·구조체의 CI/ZZ 필드 + BAPI <code>EXTENSION</code></p>
        </div>
      </div>

      <div class="callout rx-callout">
        <b>"새 CBO를 만들어야 하는가"는 항상 마지막 질문입니다.</b>
        sc4sap은 user-exit · 치환/검증 · BAdI 구현 · APPEND 구조체까지 인벤토리에 포함해, 브라운필드의 <b>"중복 Z" 사고</b>를 구조적으로 차단합니다.
      </div>
    </div>` },

    '09': { html: `<div class="capd capd-09">
      ${head('09','🏭','Industry Context')}
      <p class="capd-lede">14개 업종에 대한 <b>비즈니스 컨텍스트가 에이전트 안에 탑재</b>됩니다</p>
      <p class="capd-desc">리테일의 Article과 패션의 Style × Color × Size는 마스터 데이터 구조 자체가 다릅니다
      <br/>자동차의 JIT/JIS 스케줄링, 제약의 GMP · Serialization, 철강의 Characteristic Inventory · Coil · Heat 추적처럼 같은 ERP 위에 서로 다른 업무 룰이 돌아갑니다
      <br/><code>config.json</code>의 industry 값에 따라 Analyst · Critic · Planner가 해당 업종 레퍼런스를 <b>mandatory</b>로 로드한 뒤 작업을 시작하고
      <br/>각 파일은 Business Characteristics / Key Processes / Master Data / Pitfalls 4개 섹션으로 정리되어 모듈 컨설턴트와 자동으로 교차 검증됩니다
      <br/><b>"리테일 프로젝트에 자동차식 BOM을 들이미는" 사고가 구조적으로 그리고 원천적으로 차단</b>됩니다</p>
      <div class="capd-marquee" data-speed="42" aria-label="14 industries marquee">
        <div class="capd-marquee-track">
          <span class="chip2">🛒 Retail <em>Article·POS</em></span>
          <span class="chip2">👗 Fashion <em>Style×Color×Size</em></span>
          <span class="chip2">💄 Cosmetics <em>Batch·Shelf</em></span>
          <span class="chip2">🛞 Tire <em>OE/RE·Mold</em></span>
          <span class="chip2">🚗 Automotive <em>JIT/JIS·PPAP</em></span>
          <span class="chip2">💊 Pharma <em>GMP·Serial</em></span>
          <span class="chip2">🍱 F&amp;B <em>Catch Wt·FEFO</em></span>
          <span class="chip2">⚗️ Chemical <em>Process·DG</em></span>
          <span class="chip2">💻 Electronics <em>VC/AVC·RMA</em></span>
          <span class="chip2">🏗️ Construction <em>POC·Sub</em></span>
          <span class="chip2">🏭 Steel <em>Coil·Heat</em></span>
          <span class="chip2">⚡ Utilities <em>IS-U·FI-CA</em></span>
          <span class="chip2">🏦 Banking <em>FS-CD·BP</em></span>
          <span class="chip2">🏛️ Public <em>Funds·Grants</em></span>
        </div>
      </div>
    </div>` },

    '10': { html: `<div class="capd capd-10">
      ${head('10','🌏','Country / Localization')}
      <p class="capd-lede">한국에선 세금계산서, 이탈리아에선 SDI FatturaPA, 멕시코에선 CFDI — 같은 FI 전표라도 출력 양식과 법정 요건이 국가마다 완전히 다릅니다</p>
      <p class="capd-desc">출력 양식뿐 아니라 <b>e-Invoicing 의무 적용시점</b>, <b>은행 통신 프로토콜</b>, <b>세금 신고 주기</b>, <b>데이터 보존 기간</b>까지 한 국가의 회계 흐름을 다른 국가에 그대로 옮길 수 있는 부분은 거의 없습니다
      <br/>SC4SAP은 16개 국가 레퍼런스를 <b>Tax · e-Invoicing · Banking · Statutory Reporting</b>의 4개의 기준점으로 정리해 두고
      <br/><code>config.json</code>의 country 값에 따라 Analyst · Critic · Planner가 해당 파일을 <b>mandatory</b>하게 로드한 뒤 작업을 시작합니다
      <br/>이후 멀티 컨트리 롤아웃에서는 <b>인터컴퍼니 · EU 역내 VAT · 이전가격</b> 같은 교차 접점을 자동으로 플래그해, 단일 코드베이스 위에서 국가별 분기를 한 번에 추적할 수 있게 도와줍니다</p>
      <div class="capd-carousel" data-speed="2400" aria-label="16 countries step-snap carousel">
        <div class="capd-carousel-track">
          <div class="capd-flag" data-name="Korea"      data-detail="전자세금계산서(NTS) · 사업자등록번호 · 주민번호 PII"><span class="em">🇰🇷</span><span class="nm">KR</span><span class="tx">NTS · 주민번호</span></div>
          <div class="capd-flag" data-name="Japan"      data-detail="Qualified Invoice · Zengin · 法人番号"><span class="em">🇯🇵</span><span class="nm">JP</span><span class="tx">Qualified Inv</span></div>
          <div class="capd-flag" data-name="China"      data-detail="Golden Tax · e-fapiao · SAFE FX"><span class="em">🇨🇳</span><span class="nm">CN</span><span class="tx">Golden Tax</span></div>
          <div class="capd-flag" data-name="USA"        data-detail="Sales &amp; Use Tax · EIN · 1099 · ACH · Nexus"><span class="em">🇺🇸</span><span class="nm">US</span><span class="tx">Sales · ACH</span></div>
          <div class="capd-flag" data-name="Germany"    data-detail="USt · ELSTER · XRechnung/ZUGFeRD · SEPA"><span class="em">🇩🇪</span><span class="nm">DE</span><span class="tx">XRechnung</span></div>
          <div class="capd-flag" data-name="UK"         data-detail="VAT + MTD · BACS/FPS/CHAPS · GB vs XI"><span class="em">🇬🇧</span><span class="nm">UK</span><span class="tx">VAT MTD</span></div>
          <div class="capd-flag" data-name="France"     data-detail="TVA · FEC · Factur-X 2026"><span class="em">🇫🇷</span><span class="nm">FR</span><span class="tx">FEC · Factur-X</span></div>
          <div class="capd-flag" data-name="Italy"      data-detail="IVA · FatturaPA/SDI · Split Payment"><span class="em">🇮🇹</span><span class="nm">IT</span><span class="tx">FatturaPA</span></div>
          <div class="capd-flag" data-name="Spain"      data-detail="IVA · SII 실시간 보고 · TicketBAI"><span class="em">🇪🇸</span><span class="nm">ES</span><span class="tx">SII · TicketBAI</span></div>
          <div class="capd-flag" data-name="Netherlands" data-detail="BTW · Peppol · XAF · G-rekening"><span class="em">🇳🇱</span><span class="nm">NL</span><span class="tx">Peppol · XAF</span></div>
          <div class="capd-flag" data-name="Brazil"     data-detail="NF-e · SPED · CFOP · ICMS/IPI/PIS/COFINS"><span class="em">🇧🇷</span><span class="nm">BR</span><span class="tx">NF-e · SPED</span></div>
          <div class="capd-flag" data-name="Mexico"     data-detail="CFDI 4.0 · SAT · Complementos · SPEI"><span class="em">🇲🇽</span><span class="nm">MX</span><span class="tx">CFDI 4.0</span></div>
          <div class="capd-flag" data-name="India"      data-detail="GST · IRN e-invoice · e-Way Bill · TDS"><span class="em">🇮🇳</span><span class="nm">IN</span><span class="tx">GST · IRN</span></div>
          <div class="capd-flag" data-name="Australia"  data-detail="GST · ABN · STP Phase 2 · BAS"><span class="em">🇦🇺</span><span class="nm">AU</span><span class="tx">STP · BAS</span></div>
          <div class="capd-flag" data-name="Singapore"  data-detail="GST · UEN · InvoiceNow(Peppol) · PayNow"><span class="em">🇸🇬</span><span class="nm">SG</span><span class="tx">InvoiceNow</span></div>
          <div class="capd-flag" data-name="EU Common"  data-detail="VIES · INTRASTAT · ESL · OSS/IOSS · SEPA · GDPR"><span class="em">🇪🇺</span><span class="nm">EU</span><span class="tx">VIES · OSS</span></div>
        </div>
      </div>

      <div class="capd-active-country" data-active-country aria-live="polite">
        <span class="ac-flag" data-ac-flag>🇰🇷</span>
        <div class="ac-meta">
          <span class="ac-eyebrow">Now highlighted</span>
          <h4 class="ac-name" data-ac-name>Korea</h4>
          <p class="ac-detail" data-ac-detail>전자세금계산서(NTS) · 사업자등록번호 · 주민번호 PII</p>
        </div>
      </div>

      <div class="mechanism-note">
        <b>동작 방식</b>
        <ul>
          <li><code>.sc4sap/config.json</code> → <code>industry</code> / <code>country</code> 값이 세션 시작 시 자동 로드됩니다</li>
          <li>Analyst · Critic · Planner는 Country Context 블록을 <b>mandatory</b>하게 로드한 뒤 작업을 시작합니다</li>
          <li>멀티 컨트리 롤아웃에서는 해당 파일을 모두 로드하고 <b>인터컴퍼니 · EU 역내 VAT · 이전가격 같은 교차 접점을 자동으로 플래그</b>합니다</li>
        </ul>
      </div>
    </div>` },

    '11': { html: `<div class="capd capd-11">
      ${head('11','🎯','Active-Module Awareness')}
      <p class="capd-lede">모듈 조합에 따라 표준 객체를 바꿔 씁니다.</p>
      <p class="capd-desc">같은 "원가 분석"이라도 프로젝트가 <b>MM + PS</b>면 WBS 기준, <b>SD + CO</b>면 CO-PA 세그먼트 기준으로 달라집니다
      <br/><code>config.json</code>의 activeModules 리스트를 근거로 에이전트가 조합 별 <b>Standard</b> 객체와 <b>BAPI</b>를 자동 선택하고, 교차 접점을 플래그합니다
      <br/><b>FI + TR</b>이 활성화되면 지급 제안 → 현금관리 → House Bank 이체 경로까지 설계되고, <b>QM + PP</b>면 생산오더 단계 별 in-process 검사 lot이 자동 생성되도록 흐름을 가져갑니다</p>
      <div class="capd-combos">
        <div class="capd-combo">
          <div class="capd-combo-eq"><span>MM</span><span>+</span><span>PS</span><span class="arrow">⇒</span><span class="out">WBS 비용</span></div>
          <p>WBS 요소에 비용 직접 집계. <code>BANFN</code> · <code>EBELN</code>의 <code>PS_PSP_PNR</code> 키로 프로젝트 귀속.</p>
        </div>
        <div class="capd-combo">
          <div class="capd-combo-eq"><span>SD</span><span>+</span><span>CO</span><span class="arrow">⇒</span><span class="out">CO-PA</span></div>
          <p>주문 · 청구 기준 세그먼트 채널로 전표 전기. 수량·금액을 <code>CE1</code> / <code>CE4</code>로 분해.</p>
        </div>
        <div class="capd-combo">
          <div class="capd-combo-eq"><span>FI</span><span>+</span><span>TR</span><span class="arrow">⇒</span><span class="out">자금·하우스뱅크</span></div>
          <p>지급 제안 → TR 현금관리 → House Bank 이체. <code>FEBAN</code> · <code>FF7A</code> 연계 경로 자동 인지.</p>
        </div>
        <div class="capd-combo">
          <div class="capd-combo-eq"><span>QM</span><span>+</span><span>PP</span><span class="arrow">⇒</span><span class="out">검사 lot</span></div>
          <p>생산오더 단계별 in-process 검사 lot 생성. 수입검사 · 최종검사 시점 자동 분기.</p>
        </div>
      </div>
    </div>` },

    '12': { html: `<div class="capd capd-12">
      ${head('12','🏗️','Formatted Auto Program Maker','/sc4sap:create-program')}
      <p class="capd-lede">첫 커밋이 이미 컨벤션을 지키는 프로그램</p>
      <p class="capd-desc">
        <code>/sc4sap:create-program</code>은 아이디어 한 줄에서 활성화된 ABAP 오브젝트까지 이어지는 8단계 파이프라인입니다
        <br/>결과물은 "동작은 하는 초안"이 아니라 <b>sc4sap 코딩 컨벤션을 엄격히 지키는 최종 코드</b>로 산출됩니다
      </p>

      <div class="dev-flow">
        <div class="dev-spine" aria-hidden="true"></div>

        <div class="dev-step left">
          <span class="dev-pill y">PHASE 3</span>
          <h4>스펙 작성 + 승인 게이트</h4>
          <p>사용자가 <code>승인</code> / <code>approve</code>를
          <br/>명시하기 전에는 넘어가지 않습니다</p>
        </div>

        <div class="dev-step right">
          <span class="dev-pill">PHASE 4</span>
          <h4>병렬 Include 생성 + 일괄 활성화</h4>
          <p>Main + 조건부 Include 병렬 생성 후 단일 Semantic Analysis + 배치 활성화, 개별 루프 대비 <b>약 40–60% 단축</b></p>
        </div>

        <div class="dev-step left">
          <span class="dev-pill">PHASE 6</span>
          <h4>4버킷 병렬 컨벤션 리뷰</h4>
          <p>ALV+UI · Logic · Structure+Naming · Platform을 Sonnet으로 병렬 리뷰 <b>MAJOR 발견 시에만
          <br/>Opus 에스컬레이션</b></p>
        </div>

        <div class="dev-step right">
          <span class="dev-pill y">PHASE 8</span>
          <h4>완료 리포트 (PASS 게이트)</h4>
          <p>Phase 6 PASS 조건부 완료 리포트 <code>state.json</code> 타이밍 테이블로
          <br/>C-2 재개 지원</p>
        </div>
      </div>

      <div class="dev-result">
        <div class="dev-result-line">
          <span class="dev-result-prompt">→</span>
          <span class="dev-result-text">결과적으로 리뷰어의 일은 <b>"컨벤션 보정"</b>이 아니라 <b>"비즈니스 로직 판단"</b>에 쓰입니다</span>
        </div>
        <div class="dev-result-sub">처음부터 통과하는 코드를 만들기 때문에, 사람은 이 프로그램이 <b><i>옳은 일을 하는가</i></b>만 보면 됩니다</div>
      </div>
    </div>` }
  };

  let activeTypewriter = null;
  let activeStops = [];   // stop callbacks for any sliders/carousels in the current panel
  let activeCardEl = null;  // currently-open card — re-rendered on language change

  // DETAILS above is the Korean baseline. EN / JA panel sets are loaded from
  // js/i18n.en.js / js/i18n.ja.js (window.SC4_PANELS_EN / _JA). Pick the set
  // for the active language, falling back to Korean for any missing panel.
  window.SC4_PANELS_KO = DETAILS;
  function currentLang() {
    return (window.SC4_I18N && window.SC4_I18N.current && window.SC4_I18N.current()) || 'ko';
  }
  function panelFor(id) {
    const sets = { ko: DETAILS, en: window.SC4_PANELS_EN, ja: window.SC4_PANELS_JA };
    const set = sets[currentLang()] || DETAILS;
    return (set && set[id]) || DETAILS[id];
  }

  function render(d) {
    panel.innerHTML = d.html;
  }

  // Industry chip marquee — clone children once for a seamless -50% loop.
  function initCapdMarquee(root) {
    const track = root.querySelector('.capd-marquee-track');
    if (!track) return;
    const speed = parseInt(root.dataset.speed, 10);
    if (!Number.isNaN(speed) && speed > 0) {
      track.style.setProperty('--capd-mq-dur', speed + 's');
    }
    Array.from(track.children).forEach(node => {
      const clone = node.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  }

  // Country step-snap carousel —
  //   ┌─ Track is tripled (originals reversed-prepended + originals appended)
  //   │  so we can step forward indefinitely and silently snap back to the
  //   │  middle batch when we leave it.
  //   │
  //   ├─ Each tick (HOLD_MS): idx++ → translateX(-(idx*step)) animated;
  //   │  partway through the transition, .is-active class moves to the new
  //   │  center card (size + sap-blue border + colored .nm via CSS).
  //   │
  //   └─ data-speed (ms) overrides HOLD_MS. Default 2400ms hold per card.
  function initCenterCarousel(root) {
    const track = root.querySelector('.capd-carousel-track');
    if (!track) return;
    const originals = Array.from(track.children);
    if (originals.length < 5) return;

    const ds = parseInt(root.dataset.speed, 10);
    const HOLD_MS  = (!Number.isNaN(ds) && ds > 0) ? ds : 2400;
    const TRANS_MS = 600;

    // Triple-buffer for seamless wrap
    originals.slice().reverse().forEach(node => {
      const c = node.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      track.insertBefore(c, track.firstChild);
    });
    originals.forEach(node => {
      const c = node.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      track.appendChild(c);
    });
    const allCards = Array.from(track.children);
    const total = originals.length;

    // Start at the first item of the middle batch (= original idx 0)
    let idx = total;
    let stopped = false;
    let timer = null;
    let resizeTimer = null;

    function applyTransform(animated) {
      const rootRect = root.getBoundingClientRect();
      if (rootRect.width === 0) return false;
      // CRITICAL: use offsetWidth (intrinsic layout width = 220px), NOT
      // getBoundingClientRect().width — the latter returns the *visually
      // scaled* width (220 × .92 ≈ 202.4 for inactive cards), which would
      // make step ≈ 212.4 instead of 230, drifting the active card off
      // the viewport center by ~17px every step and causing the highlight
      // to "skip" onto a clone whose center happens to land closer.
      const cw  = allCards[0].offsetWidth;       // 220 (layout)
      const gap = parseFloat(getComputedStyle(track).gap) || 10;
      const step = cw + gap;                      // 230 (layout step)
      const viewportCenter = window.innerWidth / 2;
      const targetX = viewportCenter - rootRect.left - (idx * step) - (cw / 2);
      track.style.transition = animated
        ? `transform ${TRANS_MS}ms cubic-bezier(.4, 0, .2, 1)`
        : 'none';
      track.style.transform = `translateX(${targetX.toFixed(2)}px)`;
      return true;
    }

    // Sync the .capd-active-country detail block with whichever card is
    // currently active. Reads data-name + data-detail off the given card.
    const detailHost = root.parentElement.querySelector('[data-active-country]');
    function updateActiveDetailFor(active) {
      if (!detailHost || !active) return;
      // innerHTML (not textContent) so any Twemoji-replaced <img> survives
      // the swap; falls back to unicode emoji when Twemoji isn't loaded.
      const emEl = active.querySelector('.em');
      const flagHtml = emEl ? emEl.innerHTML : '';
      const name     = active.dataset.name   || '';
      const detail   = active.dataset.detail || '';
      detailHost.classList.add('ac-fading');
      window.setTimeout(() => {
        const fEl = detailHost.querySelector('[data-ac-flag]');
        const nEl = detailHost.querySelector('[data-ac-name]');
        const dEl = detailHost.querySelector('[data-ac-detail]');
        if (fEl) fEl.innerHTML = flagHtml;
        if (nEl) nEl.textContent = name;
        if (dEl) dEl.innerHTML   = detail;
        detailHost.classList.remove('ac-fading');
      }, 180);
    }

    // Measure-and-mark: whichever card has its center closest to the
    // viewport center wins the .is-active class. This is robust to any
    // off-by-N error in the index math because it's purely geometric —
    // the card the user actually sees in the middle is the one that
    // gets highlighted.
    function setActive() {
      const viewportCenter = window.innerWidth / 2;
      let bestDiff = Infinity;
      let best = null;
      for (const c of allCards) {
        const r = c.getBoundingClientRect();
        if (r.width === 0) continue;
        const cx = r.left + r.width / 2;
        const d  = Math.abs(cx - viewportCenter);
        if (d < bestDiff) { bestDiff = d; best = c; }
      }
      if (!best) return;
      allCards.forEach(c => c.classList.toggle('is-active', c === best));
      updateActiveDetailFor(best);
    }

    // Initial settle — wait until layout has a non-zero width, then run
    // setActive on the next frame so the cards are positioned before the
    // measurement happens.
    function settleInitial() {
      if (stopped) return;
      if (!applyTransform(false)) {
        requestAnimationFrame(settleInitial);
        return;
      }
      requestAnimationFrame(() => { if (!stopped) setActive(); });
    }
    requestAnimationFrame(settleInitial);

    function step() {
      if (stopped) return;
      idx += 1;
      applyTransform(true);
      // Mark active AFTER the transform finishes — that way the geometric
      // center measurement reflects where the cards actually settled, not
      // where they happen to be mid-transition.
      setTimeout(() => { if (!stopped) setActive(); }, TRANS_MS + 40);

      // Silently wrap when we leave the middle batch
      if (idx >= total * 2) {
        setTimeout(() => {
          if (stopped) return;
          idx = total;
          applyTransform(false);
          requestAnimationFrame(() => { if (!stopped) setActive(); });
        }, TRANS_MS + 60);
      }
      timer = setTimeout(step, HOLD_MS);
    }

    // Honor reduced motion — show first card highlighted, no auto-step
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // settleInitial will still position; just don't start stepping
    } else {
      timer = setTimeout(step, HOLD_MS);
    }

    function onResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { applyTransform(false); }, 80);
    }
    window.addEventListener('resize', onResize);

    activeStops.push(() => {
      stopped = true;
      if (timer)       clearTimeout(timer);
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    });
  }

  function selectCard(card, opts) {
    cards.forEach(c => c.classList.remove('is-active'));
    card.classList.add('is-active');
    activeCardEl = card;
    const id = card.dataset.capId;
    const data = panelFor(id);
    if (!data) return;

    // Stop any previous typewriter still running on the now-detached panel
    if (activeTypewriter) { activeTypewriter.stop(); activeTypewriter = null; }
    // Stop any sliders / carousels from the previous panel
    activeStops.forEach(stop => { try { stop(); } catch (_) {} });
    activeStops = [];

    render({ ...data, id });

    // Re-apply typewriter to any terminal that landed inside the new panel
    const tbody = panel.querySelector('.terminal .terminal-body');
    if (tbody && typeof window.__sc4sapApplyTypewriter === 'function') {
      activeTypewriter = window.__sc4sapApplyTypewriter(tbody);
    }

    // Wire up any sliders that landed inside the new panel
    panel.querySelectorAll('.capd-marquee').forEach(initCapdMarquee);
    panel.querySelectorAll('.capd-carousel').forEach(initCenterCarousel);

    // Twemoji ONLY inside #10's carousel + active-country block (the only
    // places that need cross-OS flag rendering). Cap-card icons, head
    // icons, industry chips, etc. stay as native emoji.
    panel.querySelectorAll('.capd-carousel, .capd-active-country')
         .forEach(parseTwemoji);

    // ack-demo (now lives inside #07 Fit to System) — re-bind click handlers
    // when it lands in the freshly-rendered panel.
    if (panel.querySelector('.ack-demo')) {
      initAckDemo(panel);
    }

    // Skip scrolling when this is a silent re-render (e.g. language change) —
    // only scroll into view on an explicit user card selection.
    if (!opts || opts.scroll !== false) {
      scrollPanelIntoView();
    }
  }

  // Custom eased scroll — always aligns to the PANEL TOP (so the #NN
  // heading is what lands on screen, even for tall panels like #07/#08/#10
  // where scrollIntoView({block:'center'}) used to overshoot past the head),
  // and decelerates hard near the end (ease-out quart) for a soft settle.
  function scrollPanelIntoView() {
    const nav = document.querySelector('.nav');
    const navH = nav ? nav.offsetHeight : 0;
    const targetY = Math.max(0,
      panel.getBoundingClientRect().top + window.scrollY - navH - 24);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo(0, targetY);
      return;
    }

    const startY = window.scrollY;
    const dist = targetY - startY;
    if (Math.abs(dist) < 2) return;

    // Duration scales gently with distance, clamped for predictability
    const duration = Math.min(1100, Math.max(550, Math.abs(dist) * 0.45));
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
    const t0 = performance.now();

    // CSS `scroll-behavior: smooth` would re-smooth every rAF step and
    // fight our easing — suspend it for the duration of the animation.
    const rootStyle = document.documentElement.style;
    const prevBehavior = rootStyle.scrollBehavior;
    rootStyle.scrollBehavior = 'auto';

    function frame(now) {
      const p = Math.min(1, (now - t0) / duration);
      window.scrollTo(0, startY + dist * easeOutQuart(p));
      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        rootStyle.scrollBehavior = prevBehavior;
      }
    }
    requestAnimationFrame(frame);
  }

  cards.forEach(card => {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', () => selectCard(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectCard(card);
      }
    });
  });

  // Re-render the open panel in the new language when the user switches it.
  // Keep the scroll position fixed — language change shouldn't move the page.
  document.addEventListener('sc4:langchange', () => {
    if (activeCardEl) selectCard(activeCardEl, { scroll: false });
  });
})();


// Comfortable / Setup terminal — character-by-character typewriter effect.
// Parses existing HTML content (split on <br/>), reveals each line char-by-char
// (text nodes only — inline <span> tags stay intact), then loops after a pause.
// Exposed on window so dynamically-inserted terminals (cap-detail #01) can opt in.
function applyTerminalTypewriter(body) {
  if (!body) return null;

  const raw = body.innerHTML;
  const lines = raw.split(/<br\s*\/?>/i).map(s => s.trim());
  while (lines.length && lines[0] === '')                   lines.shift();
  while (lines.length && lines[lines.length - 1] === '')    lines.pop();
  if (!lines.length) return null;

  // Pin body height to the fully-rendered size so the box never collapses
  body.style.minHeight = body.offsetHeight + 'px';

  // Pre-compute text length per line
  function textLen(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || '').length;
  }
  const lineLens = lines.map(textLen);

  // Reveal the first N text characters of a line's HTML — tags stay intact,
  // only text-node content is truncated
  function buildPartial(html, n) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    let budget = n;
    (function walk(node) {
      for (const c of node.childNodes) {
        if (c.nodeType === 3) {               // text node
          if (budget <= 0)                    c.nodeValue = '';
          else if (c.nodeValue.length > budget) { c.nodeValue = c.nodeValue.slice(0, budget); budget = 0; }
          else                                budget -= c.nodeValue.length;
        } else if (c.nodeType === 1) {
          walk(c);
        }
      }
    })(tmp);
    return tmp.innerHTML;
  }

  function render(lineIdx, charCount) {
    let html = '';
    for (let i = 0; i < lineIdx; i++) {
      if (i > 0) html += '<br/>';
      html += lines[i];
    }
    if (lineIdx > 0) html += '<br/>';
    html += buildPartial(lines[lineIdx], charCount);
    body.innerHTML = html;
  }

  const CHAR_DELAY    = 28;    // per-character typing speed (ms)
  const LINE_GAP      = 160;   // pause between finished line and next one
  const RESTART_DELAY = 2000;  // pause before looping back to line 0

  let running = false;
  let timer   = null;

  function tick(li, ci) {
    if (!running) return;
    if (li >= lines.length) {
      timer = setTimeout(() => tick(0, 1), RESTART_DELAY);
      return;
    }
    const total = lineLens[li];
    if (total === 0) {                         // blank spacer line
      render(li, 0);
      timer = setTimeout(() => tick(li + 1, 1), LINE_GAP);
      return;
    }
    render(li, Math.min(ci, total));
    if (ci >= total) {
      timer = setTimeout(() => tick(li + 1, 1), LINE_GAP);
    } else {
      timer = setTimeout(() => tick(li, ci + 1), CHAR_DELAY);
    }
  }

  function start() { if (running) return; running = true; tick(0, 1); }
  function stop()  { running = false; if (timer) { clearTimeout(timer); timer = null; } }

  // Respect reduced motion — render everything at once, skip typing loop
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let html = '';
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) html += '<br/>';
      html += lines[i];
    }
    body.innerHTML = html;
    return { stop: () => {} };
  }

  // Only run while the terminal is on-screen — pause when it's scrolled away
  const host = body.closest('.terminal');
  let io = null;
  if ('IntersectionObserver' in window && host) {
    io = new IntersectionObserver((entries) => {
      entries.forEach(e => e.isIntersecting ? start() : stop());
    }, { threshold: 0.15 });
    io.observe(host);
  } else {
    start();
  }

  return {
    stop: () => { stop(); if (io) io.disconnect(); }
  };
}

// Auto-apply to terminals present at page load
(function initTerminalTypewritersOnLoad() {
  document.querySelectorAll('.terminal .terminal-body').forEach(applyTerminalTypewriter);
})();

// Expose for dynamic content (cap-detail card #01 re-renders a terminal on click)
window.__sc4sapApplyTypewriter = applyTerminalTypewriter;


// "Copy on Clipboard" toast — top-left under nav, fades in/out, theme-aware.
function showCopyToast(message) {
  let toast = document.querySelector('[data-copy-toast]');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'copy-toast';
    toast.setAttribute('data-copy-toast', '');
    toast.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M20 6L9 17l-5-5"/></svg>' +
      '<span data-copy-toast-msg></span>';
    document.body.appendChild(toast);
  }
  const msgEl = toast.querySelector('[data-copy-toast-msg]');
  if (msgEl) msgEl.textContent = message || 'Copy on Clipboard';
  // Force reflow so the transition fires even on rapid re-clicks
  void toast.offsetWidth;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.classList.remove('show'); }, 1600);
}

// Install line — copy command + lazy-fetch GitHub star count (cached 1h)
(function initInstallLine() {
  // Copy
  const btn = document.querySelector('[data-install-copy]');
  const cmd = document.querySelector('[data-install-cmd]');
  if (btn && cmd) {
    const label = btn.querySelector('span');
    const original = label ? label.textContent : 'Copy';
    btn.addEventListener('click', async () => {
      const text = cmd.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', '');
        ta.style.position = 'fixed'; ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (_) { /* noop */ }
        document.body.removeChild(ta);
      }
      btn.classList.add('copied');
      if (label) label.textContent = 'Copied';
      showCopyToast('Copy on Clipboard');
      setTimeout(() => {
        btn.classList.remove('copied');
        if (label) label.textContent = original;
      }, 1600);
    });
  }

  // GitHub stars
  const target = document.querySelector('[data-gh-stars]');
  if (!target) return;
  const REPO = 'babamba2/superclaude-for-sap';
  const CACHE_KEY = 'sc4sap-gh-stars';
  const TTL_MS = 60 * 60 * 1000;

  function format(n) {
    if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k';
    return String(n);
  }

  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached && (Date.now() - cached.t) < TTL_MS && typeof cached.n === 'number') {
      target.textContent = format(cached.n);
      return;
    }
  } catch (e) { /* ignore */ }

  fetch(`https://api.github.com/repos/${REPO}`, { headers: { Accept: 'application/vnd.github+json' } })
    .then(r => r.ok ? r.json() : null)
    .then(j => {
      if (!j || typeof j.stargazers_count !== 'number') return;
      target.textContent = format(j.stargazers_count);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ n: j.stargazers_count, t: Date.now() })); } catch (e) {}
    })
    .catch(() => { /* offline / rate-limited — leave dash */ });
})();


// acknowledge_risk demo — per-call, per-table, per-session 명시적 승인 시연.
// Scope-aware so it can be re-initialized when the demo lands inside a
// dynamically-rendered cap-detail panel (e.g. #07 Fit to System).
function initAckDemo(scope) {
  const root = scope || document;
  const buttons = root.querySelectorAll('.ack-btn');
  const output  = root.querySelector('.ack-output');
  if (!buttons.length || !output) return;

  const PASS = new Set(['yes', '승인', 'authorize', 'approve', 'proceed', 'confirmed']);
  const AMBIGUOUS = new Set(['뽑아봐', 'try it', 'my mistake', '해봐']);

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const kw = btn.dataset.kw || btn.textContent.trim();
      const t = (k) => (window.SC4_I18N && window.SC4_I18N.t) ? window.SC4_I18N.t(k) : k;
      output.classList.remove('pass', 'deny');
      if (PASS.has(kw)) {
        output.classList.add('pass');
        output.innerHTML = t('ackPass').replace(/\{kw\}/g, kw);
      } else if (AMBIGUOUS.has(kw)) {
        output.classList.add('deny');
        output.innerHTML = t('ackDeny').replace(/\{kw\}/g, kw);
      } else {
        output.textContent = t('ackDefault');
      }
    });
  });
}
// Initial pass for any ack-demo present at page load
initAckDemo();
