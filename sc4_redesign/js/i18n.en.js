/* English capability panels - consumed by main.js (window.SC4_PANELS_EN). */
window.SC4_PANELS_EN = (function () {
  const head = (no, icon, title, cmd) =>
    `<div class="capd-hd">
       <span class="capd-no">#${no}</span>
       <span class="capd-icon">${icon}</span>
       <h3>${title}</h3>
       ${cmd ? `<code class="capd-cmd">${cmd}</code>` : ''}
     </div>`;

  return {
    '01': { html: `<div class="capd capd-01">
      ${head('01','🔧','Auto MCP Install','/sc4sap:setup')}
      <p class="capd-lede">
        Setting up a SAP development environment - installing the MCP server, separating credentials, registering permission hooks, building the SPRO cache - can swallow half a day. SC4SAP breaks this process down into one answer per question and<br/><b>finishes it inside the setup wizard</b>
      </p>

      <div class="setup-wrap">
        <ul class="check-list">
          <li>
            <span class="check">1</span>
            <div><b>Automatic MCP server install</b> - clones, builds, and registers <code>abap-mcp-adt-powerup</code>.
            No need to hand-edit <code>claude_desktop_config.json</code></div>
          </li>
          <li>
            <span class="check">2</span>
            <div><b>Auto-generated .sc4sap/sap.env</b> - asks for URL, client, account, and auth method one line at a time and saves them
            <br/>Password masking + <code>sap.env.bak</code> backup</div>
          </li>
          <li>
            <span class="check">3</span>
            <div><b>Version · industry · country sync</b> - records SAP version, ABAP release, industry, and country
            into <code>.sc4sap/config.json</code> <br/>so every agent shares the same context</div>
          </li>
          <li>
            <span class="check">4</span>
            <div><b>Data-extraction blocklist hook registration</b> - verifies that
            <br/><code>permissionDecision: deny</code> works correctly via a BNKA smoke test</div>
          </li>
        </ul>

        <div class="terminal" aria-hidden="true">
          <div class="terminal-bar"><span></span><span></span><span></span></div>
          <div class="terminal-body">
<span class="prompt">$</span> <span class="cmd">/sc4sap:setup</span><br/>
<span class="dim">→ SAP system: </span><span class="y">S4 / ECC ?</span> <span class="ok">S4</span><br/>
<span class="dim">→ ABAP Release ?</span> <span class="ok">756</span><br/>
<span class="dim">→ Industry ?</span> <span class="ok">automotive</span><br/>
<span class="dim">→ Installing MCP server…</span> <span class="ok">✓ done</span><br/>
<span class="dim">→ Testing SAP connection…</span> <span class="ok">✓ GetSession OK</span><br/>
<span class="dim">→ Registering blocklist hook…</span> <span class="ok">✓ deny(BNKA) confirmed</span><br/>
<br/>
<span class="y">setup complete.</span> <span class="dim">ready to code.</span>
          </div>
        </div>
      </div>

      <div class="tagline-strong">
        Result - answer your SAP system details once and everything from MCP server install to permission verification and blocklist hook registration is completed in a single pass; when a teammate needs to set up the same environment, sharing the single <code>sap.env</code> file is all it takes
      </div>
    </div>` },

    '02': { html: `<div class="capd capd-02">
      ${head('02','🧠','Specialist Agents','25 agents · role-specialized collaboration')}
      <p class="capd-lede">A single prompt doesn't make every decision. Analysis, design, implementation, review, and debugging are delegated to <b>role-specialized agents</b>, and module-specific business judgment is escalated again to a consultant
      <br/>It's the exact opposite of one generalist handling the same SAP task - each agent answers only within its own field, and the path to inventing answers from "plausible-sounding SAP knowledge" is structurally closed off</p>

      <div class="agent-heads">
        <div class="agent-head">
          <span class="count">CORE · 10</span>
          <h4>Design · Implement · Review</h4>
          <p>analyst · architect · planner · executor · code-reviewer<br/>critic · debugger · qa-tester · doc-specialist · writer</p>
        </div>
        <div class="agent-head yellow">
          <span class="count">BASIS · 1</span>
          <h4>System · Transport</h4>
          <p>sap-bc-consultant<br/>Dedicated to transport strategy · dumps · performance tuning</p>
        </div>
        <div class="agent-head">
          <span class="count">MODULES · 14</span>
          <h4>Module Consultants</h4>
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
        <h4>Parallel collaboration - <code>/sc4sap:team</code></h4>
        <ul>
          <li>Multiple agents share the same task list and <b>work in parallel</b> - R/W permissions and context stay isolated</li>
          <li>When module judgment is needed, a <b>"## Module Consultation Needed"</b> block auto-delegates to the relevant consultant</li>
          <li>System-level issues (transport · authorization · performance) are escalated separately to the BC consultant</li>
        </ul>
      </div>
    </div>` },

    '03': { html: `<div class="capd capd-03">
      ${head('03','🔍','Program Analyze','/sc4sap:program-to-spec')}
      <p class="capd-lede">Turn legacy ABAP into a functional/technical spec - <b>reverse-engineering by the minute</b></p>
      <p class="capd-desc">Even a 3,000-line report has its selection-screen image, ALV column layout, process flowchart, and CBO/Enhancement dependencies extracted automatically
      <br/><b>4-axis Socratic questions</b> across Audience / Format / Depth / Language tune the depth and dodge the "document everything" trap
      <br/>Operational handover · audit response · legacy cleanup right before a system migration - the spec a person used to write by reading code line by line is compressed into minutes and produced in both Excel and Markdown formats at once</p>

      <!-- Pipeline flow: 4 steps with auto-arrows -->
      <div class="capd-flow">
        <div class="capd-flow-step"><b>STEP 1</b><span>Load source</span><small><code>GetProgFullCode</code><br/>Includes · Forms · Classes</small></div>
        <div class="capd-flow-step"><b>STEP 2</b><span>Extract structure</span><small>Selection · ALV<br/>Logic · CBO · Enhancement</small></div>
        <div class="capd-flow-step"><b>STEP 3</b><span>Render visuals</span><small>Selection PNG · ALV PNG<br/>Process Flowchart</small></div>
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
              <p>Program ID · author · last modified · 4-axis meta</p>
            </div>
          </li>
          <li>
            <span class="capd-xlsx-no">02</span>
            <div>
              <h6>Selection</h6>
              <p>Selection screen <b>PNG embed</b> + parameter table</p>
            </div>
          </li>
          <li>
            <span class="capd-xlsx-no">03</span>
            <div>
              <h6>Inputs / Screens</h6>
              <p>ALV column layout PNG · field descriptions · lengths</p>
            </div>
          </li>
          <li>
            <span class="capd-xlsx-no">04</span>
            <div>
              <h6>Process Logic</h6>
              <p>Auto-rendered <b>Process Flowchart</b> (boxes · decisions · terminators + ↓)</p>
            </div>
          </li>
          <li>
            <span class="capd-xlsx-no">05</span>
            <div>
              <h6>CBO / Enhancement</h6>
              <p>Z-object dependency tree · BAdI · CMOD · APPEND</p>
            </div>
          </li>
          <li class="warn">
            <span class="capd-xlsx-no">⚠</span>
            <div>
              <h6>Warnings</h6>
              <p>Unparseable · risky patterns · unresolved items</p>
            </div>
          </li>
        </ul>
      </div>
    </div>` },

    '04': { html: `<div class="capd capd-04">
      ${head('04','🧪','Analyze Code','/sc4sap:analyze-code')}
      <p class="capd-lede">Clean ABAP · performance · security · modernization - <b>severity-ranked static review</b></p>
      <p class="capd-desc">It reflects the project's <code>ABAP_RELEASE</code> / SAP version context and recommends <b>only the patterns that actually apply</b>
      <br/>It auto-detects the OOP / Procedural paradigm and presents impact via a Where-used graph. Line numbers, call paths, and ready-to-apply fix snippets all come back as one bundle
      <br/>The security category detects OWASP patterns like SQL Injection, missing AUTHORITY-CHECK, and dynamic code execution through static analysis
      <br/>and the performance category attaches concrete patch code that refactors nested LOOP/SELECT into sorted/hashed table look-ups</p>

      <!-- 4 review categories - chevron-stitched infographic with SAP-brand gradient
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

        <!-- Top chevron sections - Panel 1: rounded left + tip right -->
        <path d="M 18 5 L 184 5 L 200 50 L 184 95 L 18 95 Q 6 95 6 83 L 6 17 Q 6 5 18 5 Z" fill="url(#info4_g1)"/>
        <!-- Panel 2: notch left + tip right -->
        <path d="M 194 5 L 372 5 L 388 50 L 372 95 L 194 95 L 210 50 Z" fill="url(#info4_g2)"/>
        <!-- Panel 3: notch left + tip right -->
        <path d="M 382 5 L 560 5 L 576 50 L 560 95 L 382 95 L 398 50 Z" fill="url(#info4_g3)"/>
        <!-- Panel 4: notch left + rounded right -->
        <path d="M 570 5 L 736 5 Q 748 5 748 17 L 748 83 Q 748 95 736 95 L 570 95 L 586 50 Z" fill="url(#info4_g4)"/>

        <!-- Icons in chevron tops - vertical center y=38 (chevron mid = 50, icon group sits slightly above to share center with title below) -->
        <text x="95"  y="38" text-anchor="middle" font-size="24" dominant-baseline="middle">🧼</text>
        <text x="290" y="38" text-anchor="middle" font-size="24" dominant-baseline="middle">🚀</text>
        <text x="478" y="38" text-anchor="middle" font-size="24" dominant-baseline="middle">🛡️</text>
        <text x="660" y="38" text-anchor="middle" font-size="24" dominant-baseline="middle">✨</text>

        <!-- Titles - y=68 with middle baseline → icon (38) + title (68) form a centered pair around y=53, visually balanced inside chevron -->
        <text x="95"  y="68" text-anchor="middle" dominant-baseline="middle" font-size="11.5" font-weight="800" letter-spacing="2" class="info4-tt-w">CLEAN ABAP</text>
        <text x="290" y="68" text-anchor="middle" dominant-baseline="middle" font-size="11.5" font-weight="800" letter-spacing="2" class="info4-tt-w">PERFORMANCE</text>
        <text x="478" y="68" text-anchor="middle" dominant-baseline="middle" font-size="11.5" font-weight="800" letter-spacing="2" class="info4-tt-w">SECURITY</text>
        <text x="666" y="68" text-anchor="middle" dominant-baseline="middle" font-size="11.5" font-weight="800" letter-spacing="2" class="info4-tt-d">MODERNIZATION</text>

        <!-- Body text - 3 lines centered both axes inside the white card (y 100→215, center y=157.5).
             Lines at y=137 / 157 / 177 with dominant-baseline=middle = visual centers there. font 13 (was 11). -->
        <g class="info4-bd">
          <text x="95"  y="137" text-anchor="middle" dominant-baseline="middle" font-size="13">Naming · SRP</text>
          <text x="95"  y="157" text-anchor="middle" dominant-baseline="middle" font-size="13">Magic numbers · globals</text>
          <text x="95"  y="177" text-anchor="middle" dominant-baseline="middle" font-size="13">OOP / Proc. consistency</text>

          <text x="283" y="137" text-anchor="middle" dominant-baseline="middle" font-size="13">SELECT · indexes</text>
          <text x="283" y="157" text-anchor="middle" dominant-baseline="middle" font-size="13">Nested LOOP · INTO TABLE</text>
          <text x="283" y="177" text-anchor="middle" dominant-baseline="middle" font-size="13">sorted / hashed usage</text>

          <text x="471" y="137" text-anchor="middle" dominant-baseline="middle" font-size="13">SQL Injection</text>
          <text x="471" y="157" text-anchor="middle" dominant-baseline="middle" font-size="13">Missing AUTHORITY-CHECK</text>
          <text x="471" y="177" text-anchor="middle" dominant-baseline="middle" font-size="13">Dynamic code sanitize</text>

          <text x="659" y="137" text-anchor="middle" dominant-baseline="middle" font-size="13">VALUE / REDUCE / COND</text>
          <text x="659" y="157" text-anchor="middle" dominant-baseline="middle" font-size="13">FILTER · lambdas</text>
          <text x="659" y="177" text-anchor="middle" dominant-baseline="middle" font-size="13">Adopting new syntax</text>
        </g>
      </svg>

      <!-- Sample severity findings - top 3 issues from a typical legacy report -->
      <div class="capd-sev">
        <div class="capd-sev-row"><span class="capd-sev-tag crit">CRITICAL</span><span class="capd-sev-text"><b>Possible SQL Injection</b> - user input is concatenated directly into a dynamic WHERE clause (line 412). Replace <code>WHERE (lv_where)</code> with escaped binding</span></div>
        <div class="capd-sev-row"><span class="capd-sev-tag crit">CRITICAL</span><span class="capd-sev-text"><b>Missing AUTHORITY-CHECK</b> - output after a <code>BUKRS</code>-based query without permission verification (line 78). A check on the <code>F_BKPF_BUK</code> authorization object must be added</span></div>
        <div class="capd-sev-row"><span class="capd-sev-tag maj">MAJOR</span><span class="capd-sev-text"><b>SELECT … ENDSELECT loop</b> - switching to <code>INTO TABLE</code> + <code>LOOP AT</code> is expected to yield roughly <b>70% performance improvement</b></span></div>
      </div>
    </div>` },

    '05': { html: `<div class="capd capd-05">
      ${head('05','⚖️','Compare Programs','/sc4sap:compare-programs')}
      <p class="capd-lede">Why two or three programs that do the same job keep running side by side</p>
      <p class="capd-desc">
        <code>/sc4sap:compare-programs</code> - loads 2-5 ABAP programs at once and
        <b>compares them structurally across 10 dimensions</b>
        <br/>It distinguishes a "copy-and-tweaked program" from a "genuinely different program," giving you the basis for consolidate · retire · standardize decisions
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
                <li class="match"><span class="cmp-bullet">●</span><span class="cmp-row-label">Purpose · scope</span><span class="cmp-row-val">Receivables report</span></li>
                <li class="diff"><span class="cmp-bullet">◐</span><span class="cmp-row-label">Selection screen</span><span class="cmp-row-val">P_BUKRS · S_KUNNR</span></li>
                <li class="match"><span class="cmp-bullet">●</span><span class="cmp-row-label">Data source</span><span class="cmp-row-val">BSID + KNA1</span></li>
                <li class="opp"><span class="cmp-bullet">○</span><span class="cmp-row-label">Output structure</span><span class="cmp-row-val">List (WRITE)</span></li>
                <li class="diff"><span class="cmp-bullet">◐</span><span class="cmp-row-label">Message handling</span><span class="cmp-row-val">MESSAGE I999</span></li>
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
                <li class="match"><span class="cmp-bullet">●</span><span class="cmp-row-label">Purpose · scope</span><span class="cmp-row-val">Receivables report</span></li>
                <li class="diff"><span class="cmp-bullet">◐</span><span class="cmp-row-label">Selection screen</span><span class="cmp-row-val">+ S_BLDAT added</span></li>
                <li class="match"><span class="cmp-bullet">●</span><span class="cmp-row-label">Data source</span><span class="cmp-row-val">BSID + KNA1</span></li>
                <li class="opp"><span class="cmp-bullet">○</span><span class="cmp-row-label">Output structure</span><span class="cmp-row-val">CL_GUI_ALV_GRID</span></li>
                <li class="diff"><span class="cmp-bullet">◐</span><span class="cmp-row-label">Message handling</span><span class="cmp-row-val">BAL_LOG</span></li>
              </ul>
            </div>
          </div>
          <div class="cmp-legend">
            <span><b class="cmp-bullet" style="color:var(--ok)">●</b> Same</span>
            <span><b class="cmp-bullet" style="color:#B88900">◐</b> Differs</span>
            <span><b class="cmp-bullet" style="color:var(--danger)">○</b> Opposite</span>
            <span class="cmp-legend-meta">5 of 10 dimensions shown · the actual report compares all dimensions: purpose·scope / selection screen / data source / business logic / output / UI / messages / performance / Text Element / CBO·Enhancement</span>
          </div>
        </div>

        <div class="callout cmp-verdict">
          <span class="cmp-verdict-mark">VERDICT</span>
          On a project where 3 "similar but slightly different" Z reports had been drifting for years,
          a single 10-dimension comparison report lets you make the consolidate · retire · standardize decision all at once
          <br/>The principle that <b>you look at the programs you already have first</b>, before the AI proposes "let's build a new one,"
          extends through this feature all the way into operations
        </div>
      </div>
    </div>` },

    '06': { html: `<div class="capd capd-06">
      ${head('06','🩺','Maintenance Diagnosis','/sc4sap:analyze-symptom')}
      <p class="capd-lede">Give it just a dump ID and the first-pass analysis - down to SAP Note candidates - finishes inside Claude.</p>
      <p class="capd-desc">It pulls ST22 · SM02 · /IWFND/ERROR_LOG · the SAT profiler directly through MCP tools and analyzes them. Work is auto-delegated to <code>sap-debugger</code> / <code>sap-bc-consultant</code>, so it extends safely even into unfamiliar territory
      <br/>Rather than just printing a stack trace, it integrates the <b>call chain · variable dump · memory state</b> to propose a hypothesis and returns follow-up actions (apply Note · fix code · add authorization) as choices
      <br/>Even a dump you've never seen, right after an operational handover, can finish first-pass analysis and be passed to the BC team as a precise question</p>

      <div class="capd-flow">
        <div class="capd-flow-step"><b>STEP 1</b><span>Collect dump</span><small><code>RuntimeListDumps</code><br/><code>RuntimeAnalyzeDump</code></small></div>
        <div class="capd-flow-step"><b>STEP 2</b><span>Analyze stack</span><small>Call chain · source location · variable dump</small></div>
        <div class="capd-flow-step"><b>STEP 3</b><span>Root-cause hypothesis</span><small>Lock · Memory · Auth · DB · Network</small></div>
        <div class="capd-flow-step"><b>STEP 4</b><span>SAP Note candidates</span><small>Search keywords + action choices</small></div>
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
      <p class="capd-lede">The three things an operations site actually wants - <b>documentation · incident response · data protection</b></p>
      <p class="capd-desc">
        Generation features alone make it hard to fully fit into a live SAP operations environment
        <br/>Beyond new development, sc4sap delivers legacy documentation, first-pass incident analysis, and enterprise-grade data protection <b>all within one package</b>
      </p>

      <div class="fit-wrap">
        <div class="fit-card">
          <div class="fit-icon">📄</div>
          <h4>Reverse Engineering</h4>
          <p><b>Turning legacy back into a spec</b><br/><code>/sc4sap:analyze-code</code> · <code>/sc4sap:program-to-spec</code></p>
          <ul>
            <li>Review report by Clean ABAP · performance · security category</li>
            <li>Auto-generated functional/technical spec (Markdown or Excel)</li>
            <li>Socratic scope tuning to dodge the "document everything" trap</li>
            <li>Legacy documentation deferred for years, compressed into minutes</li>
          </ul>
        </div>
        <div class="fit-card y">
          <div class="fit-icon">🩺</div>
          <h4>Operational Triage</h4>
          <p><b>Incident analysis that finishes inside Claude</b><br/><code>/sc4sap:analyze-symptom</code></p>
          <ul>
            <li><b>ST22 dumps</b> - <code>RuntimeListDumps</code> / <code>RuntimeAnalyzeDump</code></li>
            <li><b>SM02 system messages</b> - <code>RuntimeListSystemMessages</code></li>
            <li><b>/IWFND/ERROR_LOG</b> Gateway errors - <code>RuntimeGetGatewayErrorLog</code></li>
            <li><b>SAT profiler</b> - <code>RuntimeAnalyzeProfilerTrace</code></li>
            <li>Stack trace analysis → SAP Note candidates → root-cause hypothesis → action choices</li>
          </ul>
        </div>
        <div class="fit-card g">
          <div class="fit-icon">🔒</div>
          <h4>Data Protection</h4>
          <p><b>4-layer defense + acknowledge_risk HARD RULE</b><br/>Blocks row-level leakage of PII · payroll · banking · transactional finance at the source</p>
          <ul>
            <li>L1 agent directives - category-based refusal + alternatives offered</li>
            <li>L2 global <code>CLAUDE.md</code> - auto-injected into every session</li>
            <li>L3 <code>PreToolUse</code> hook - blocks the call (deny)</li>
            <li>L4 MCP server internal guard - opt-in server-level block</li>
          </ul>
        </div>
      </div>

      <h3 class="subhead">4-layer defense structure <span class="ln"></span></h3>
      <div class="defense-table">
        <table>
          <thead>
            <tr><th>Layer</th><th>Location</th><th>Role</th></tr>
          </thead>
          <tbody>
            <tr><td>L1</td><td>Agent directives</td><td>Category-based refusal + alternatives offered (PII / HR / Banking / Transactional Finance ···)</td></tr>
            <tr><td>L2</td><td><code>CLAUDE.md</code> global</td><td>Data Extraction Policy auto-injected into every session</td></tr>
            <tr><td>L3</td><td>Claude Code <code>PreToolUse</code> hook</td><td>Blocks the actual MCP call with <code>permissionDecision: deny</code></td></tr>
            <tr><td>L4</td><td>MCP server internal guard</td><td>Opt-in block at the server level - seals off calls from other clients too</td></tr>
          </tbody>
        </table>
      </div>

      <h3 class="subhead">Blocklist profiles - pick a scope that fits your environment <span class="ln"></span></h3>
      <div class="profile-row">
        <div class="profile strict">
          <span class="name">strict</span>
          <p>PII + credentials + HR + transactional finance + audit logs + workflow. <b>Default</b>.</p>
        </div>
        <div class="profile standard">
          <span class="name">standard</span>
          <p>PII + credentials + HR + transactional finance. Default for typical projects.</p>
        </div>
        <div class="profile minimal">
          <span class="name">minimal</span>
          <p>PII + credentials + HR + Tax. Business-table queries allowed.</p>
        </div>
        <div class="profile custom">
          <span class="name">custom</span>
          <p>A user-defined list in <code>.sc4sap/blocklist-custom.txt</code>.</p>
        </div>
      </div>

      <div class="hard-rule">
        <span class="tag-hard">HARD RULE</span>
        <h4><code>acknowledge_risk</code> - explicit approval per-call · per-table · per-session</h4>
        <p>
          To access a sensitive table via <code>GetTableContents</code> / <code>GetSqlQuery</code>,
          the user must grant permission with an <b>explicit affirmative keyword</b>.
        </p>
        <p>
          Accepted expressions:
          <span class="kw">yes</span>
          <span class="kw">승인</span>
          <span class="kw">authorize</span>
          <span class="kw">approve</span>
          <span class="kw">proceed</span>
          <span class="kw">confirmed</span>
        </p>
        <p>
          Rejected expressions (ambiguous commands):
          <span class="bad">뽑아봐</span>
          <span class="bad">try it</span>
          <span class="bad">my mistake</span>
          <span class="bad">해봐</span>
        </p>
        <p style="margin-top:14px;">
          Approval is <b>valid only per-call · per-table · per-session</b> and does not carry over to the next request.
          The design goal is to <b>eliminate the very path by which "an AI accidentally pulls a sensitive table."</b>
        </p>
      </div>

      <div class="ack-demo">
        <h5>▶ Try the gate - click a keyword</h5>
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
        <div class="ack-output" aria-live="polite">→ Click one of the keywords above to see how the gate behaves.</div>
      </div>
    </div>` },

    '08': { html: `<div class="capd capd-08">
      ${head('08','🗃️','Reusability · CBO Reuse','/sc4sap:analyze-cbo-obj')}
      <p class="capd-lede">So the AI doesn't rebuild Z objects that already exist.</p>
      <p class="capd-desc">
        The longer a SAP system has been in use, the more hundreds of <code>ZCL_*</code> · <code>ZFM_*</code> · <code>Z*_DE</code> · custom structures and table types pile up. Hand development to an AI without knowing these assets, and
        <br/><b>building yet another Z object with the same function</b> keeps repeating - SC4SAP blocks this problem at the front of the pipeline
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
          <p>Finance/logistics substitution·validation rules</p>
        </div>
        <div class="rx-hub">
          <span class="rx-hub-eyebrow">REUSE FIRST</span>
          <h4>Proposes the assets<br/>you already have first</h4>
          <code class="rx-hub-cmd">/sc4sap:analyze-cbo-obj</code>
          <ul class="rx-hub-bullets">
            <li><b>create-program</b> loads the inventory at the plan stage</li>
            <li>Every <code>Create*</code> call must pass the <b>reuse gate</b></li>
            <li>Scan once → share the same inventory for weeks</li>
          </ul>
        </div>
        <div class="rx-card rx-right">
          <div class="rx-icon">🔌</div>
          <code>BAdI</code>
          <h5>Business Add-In</h5>
          <p>Classic / Kernel / Enhancement Spot<br/>implementation classes</p>
        </div>
        <div class="rx-card rx-bot">
          <div class="rx-icon">➕</div>
          <code>APPEND</code>
          <h5>Structure Append</h5>
          <p>CI/ZZ fields on standard tables·structures + BAPI <code>EXTENSION</code></p>
        </div>
      </div>

      <div class="callout rx-callout">
        <b>"Do we need to build a new CBO" is always the last question.</b>
        sc4sap includes user-exits · substitution/validation · BAdI implementations · APPEND structures in the inventory, structurally blocking the brownfield <b>"duplicate Z" accident</b>.
      </div>
    </div>` },

    '09': { html: `<div class="capd capd-09">
      ${head('09','🏭','Industry Context')}
      <p class="capd-lede"><b>Business context for 14 industries is built into the agents</b></p>
      <p class="capd-desc">Retail's Article and fashion's Style × Color × Size differ in their very master-data structure
      <br/>Automotive JIT/JIS scheduling, pharma GMP · Serialization, steel Characteristic Inventory · Coil · Heat tracking - different business rules run on the same ERP
      <br/>Based on the industry value in <code>config.json</code>, Analyst · Critic · Planner load the matching industry reference as <b>mandatory</b> before starting work
      <br/>and each file is organized into 4 sections - Business Characteristics / Key Processes / Master Data / Pitfalls - and cross-validated automatically with the module consultant
      <br/><b>The accident of "pushing automotive-style BOM onto a retail project" is structurally and fundamentally blocked</b></p>
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
      <p class="capd-lede">In Korea a tax invoice, in Italy SDI FatturaPA, in Mexico CFDI - even the same FI document has completely different output formats and legal requirements from country to country</p>
      <p class="capd-desc">Beyond output format, the <b>e-Invoicing mandate effective dates</b>, <b>bank communication protocols</b>, <b>tax filing cycles</b>, and <b>data retention periods</b> mean almost none of one country's accounting flow can be moved to another country as-is
      <br/>SC4SAP organizes 16 country references around the 4 reference points of <b>Tax · e-Invoicing · Banking · Statutory Reporting</b>
      <br/>and based on the country value in <code>config.json</code>, Analyst · Critic · Planner load the relevant file as <b>mandatory</b> before starting work
      <br/>In multi-country rollouts it then automatically flags cross-touchpoints like <b>intercompany · intra-EU VAT · transfer pricing</b>, helping you track per-country branching on a single codebase all at once</p>
      <div class="capd-carousel" data-speed="2400" aria-label="16 countries step-snap carousel">
        <div class="capd-carousel-track">
          <div class="capd-flag" data-name="Korea"      data-detail="e-Tax Invoice (NTS) · Business Registration Number · resident registration number PII"><span class="em">🇰🇷</span><span class="nm">KR</span><span class="tx">NTS · RRN</span></div>
          <div class="capd-flag" data-name="Japan"      data-detail="Qualified Invoice · Zengin · Corporate Number"><span class="em">🇯🇵</span><span class="nm">JP</span><span class="tx">Qualified Inv</span></div>
          <div class="capd-flag" data-name="China"      data-detail="Golden Tax · e-fapiao · SAFE FX"><span class="em">🇨🇳</span><span class="nm">CN</span><span class="tx">Golden Tax</span></div>
          <div class="capd-flag" data-name="USA"        data-detail="Sales &amp; Use Tax · EIN · 1099 · ACH · Nexus"><span class="em">🇺🇸</span><span class="nm">US</span><span class="tx">Sales · ACH</span></div>
          <div class="capd-flag" data-name="Germany"    data-detail="USt · ELSTER · XRechnung/ZUGFeRD · SEPA"><span class="em">🇩🇪</span><span class="nm">DE</span><span class="tx">XRechnung</span></div>
          <div class="capd-flag" data-name="UK"         data-detail="VAT + MTD · BACS/FPS/CHAPS · GB vs XI"><span class="em">🇬🇧</span><span class="nm">UK</span><span class="tx">VAT MTD</span></div>
          <div class="capd-flag" data-name="France"     data-detail="TVA · FEC · Factur-X 2026"><span class="em">🇫🇷</span><span class="nm">FR</span><span class="tx">FEC · Factur-X</span></div>
          <div class="capd-flag" data-name="Italy"      data-detail="IVA · FatturaPA/SDI · Split Payment"><span class="em">🇮🇹</span><span class="nm">IT</span><span class="tx">FatturaPA</span></div>
          <div class="capd-flag" data-name="Spain"      data-detail="IVA · SII real-time reporting · TicketBAI"><span class="em">🇪🇸</span><span class="nm">ES</span><span class="tx">SII · TicketBAI</span></div>
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
          <p class="ac-detail" data-ac-detail>e-Tax Invoice (NTS) · Business Registration Number · resident registration number PII</p>
        </div>
      </div>

      <div class="mechanism-note">
        <b>How it works</b>
        <ul>
          <li><code>.sc4sap/config.json</code> → the <code>industry</code> / <code>country</code> values are auto-loaded at session start</li>
          <li>Analyst · Critic · Planner load the Country Context block as <b>mandatory</b> before starting work</li>
          <li>In multi-country rollouts they load all relevant files and <b>automatically flag cross-touchpoints like intercompany · intra-EU VAT · transfer pricing</b></li>
        </ul>
      </div>
    </div>` },

    '11': { html: `<div class="capd capd-11">
      ${head('11','🎯','Active-Module Awareness')}
      <p class="capd-lede">It swaps which standard objects it uses based on the module mix.</p>
      <p class="capd-desc">Even the same "cost analysis" differs: on a <b>MM + PS</b> project it goes by WBS, on <b>SD + CO</b> by CO-PA segment
      <br/>Using the activeModules list in <code>config.json</code>, the agent auto-selects the <b>Standard</b> objects and <b>BAPIs</b> for each combination and flags cross-touchpoints
      <br/>When <b>FI + TR</b> is active, it designs the path all the way from payment proposal → cash management → House Bank transfer; with <b>QM + PP</b> it carries the flow so in-process inspection lots are auto-created at each production-order step</p>
      <div class="capd-combos">
        <div class="capd-combo">
          <div class="capd-combo-eq"><span>MM</span><span>+</span><span>PS</span><span class="arrow">⇒</span><span class="out">WBS cost</span></div>
          <p>Costs aggregated directly to WBS elements. Attributed to the project via the <code>PS_PSP_PNR</code> key on <code>BANFN</code> · <code>EBELN</code>.</p>
        </div>
        <div class="capd-combo">
          <div class="capd-combo-eq"><span>SD</span><span>+</span><span>CO</span><span class="arrow">⇒</span><span class="out">CO-PA</span></div>
          <p>Documents posted by segment/channel on an order · billing basis. Quantities and amounts decomposed into <code>CE1</code> / <code>CE4</code>.</p>
        </div>
        <div class="capd-combo">
          <div class="capd-combo-eq"><span>FI</span><span>+</span><span>TR</span><span class="arrow">⇒</span><span class="out">Funds · House Bank</span></div>
          <p>Payment proposal → TR cash management → House Bank transfer. Auto-recognizes the <code>FEBAN</code> · <code>FF7A</code> linkage path.</p>
        </div>
        <div class="capd-combo">
          <div class="capd-combo-eq"><span>QM</span><span>+</span><span>PP</span><span class="arrow">⇒</span><span class="out">Inspection lot</span></div>
          <p>In-process inspection lots created at each production-order step. Auto-branches at incoming-inspection · final-inspection points.</p>
        </div>
      </div>
    </div>` },

    '12': { html: `<div class="capd capd-12">
      ${head('12','🏗️','Formatted Auto Program Maker','/sc4sap:create-program')}
      <p class="capd-lede">A program that already follows the conventions on its first commit</p>
      <p class="capd-desc">
        <code>/sc4sap:create-program</code> is an 8-stage pipeline that runs from a one-line idea to an activated ABAP object
        <br/>The output isn't a "draft that happens to work" - it's <b>final code that strictly follows sc4sap coding conventions</b>
      </p>

      <div class="dev-flow">
        <div class="dev-spine" aria-hidden="true"></div>

        <div class="dev-step left">
          <span class="dev-pill y">PHASE 3</span>
          <h4>Spec authoring + approval gate</h4>
          <p>It won't move on until the user
          <br/>explicitly states <code>승인</code> / <code>approve</code></p>
        </div>

        <div class="dev-step right">
          <span class="dev-pill">PHASE 4</span>
          <h4>Parallel Include creation + batch activation</h4>
          <p>Main + conditional Includes generated in parallel, then a single Semantic Analysis + batch activation - roughly <b>40-60% faster</b> than per-object loops</p>
        </div>

        <div class="dev-step left">
          <span class="dev-pill">PHASE 6</span>
          <h4>4-bucket parallel convention review</h4>
          <p>ALV+UI · Logic · Structure+Naming · Platform reviewed in parallel with Sonnet - <b>Opus escalation only when a MAJOR
          <br/>is found</b></p>
        </div>

        <div class="dev-step right">
          <span class="dev-pill y">PHASE 8</span>
          <h4>Completion report (PASS gate)</h4>
          <p>Completion report conditional on a Phase 6 PASS, with a <code>state.json</code> timing table for
          <br/>C-2 resume support</p>
        </div>
      </div>

      <div class="dev-result">
        <div class="dev-result-line">
          <span class="dev-result-prompt">→</span>
          <span class="dev-result-text">As a result, the reviewer's job is spent on <b>"judging business logic"</b>, not <b>"correcting conventions"</b></span>
        </div>
        <div class="dev-result-sub">Because it produces code that passes from the start, people only need to look at whether this program <b><i>does the right thing</i></b></div>
      </div>
    </div>` }
  };
})();
