/* Japanese capability panels - consumed by main.js (window.SC4_PANELS_JA). */
window.SC4_PANELS_JA = (function () {
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
        SAP開発環境を整えようとすると、MCPサーバーのインストール・認証情報の分離・権限フックの登録・SPROキャッシュの生成まで、
        半日が消えてしまいます。SC4SAPはこのプロセスを「質問1つにつき1つの回答」へと分解し、<b>セットアップウィザードの中で完結させます</b>
      </p>

      <div class="setup-wrap">
        <ul class="check-list">
          <li>
            <span class="check">1</span>
            <div><b>MCPサーバーの自動インストール</b> - <code>abap-mcp-adt-powerup</code>をクローン・ビルド・登録します
            <span class="check-note"><code>claude_desktop_config.json</code>を直接編集する必要はありません</span></div>
          </li>
          <li>
            <span class="check">2</span>
            <div><b>.sc4sap/sap.env の自動生成</b> - URL・クライアント・アカウント・認証方式を一行ずつ尋ねて保存します
            <span class="check-note">パスワードはマスキングし、<code>sap.env.bak</code>へバックアップします</span></div>
          </li>
          <li>
            <span class="check">3</span>
            <div><b>バージョン・業種・国の同期</b> - SAPバージョン・ABAPリリース・業種・国を
            <code>.sc4sap/config.json</code>に記録します
            <span class="check-note">すべてのエージェントが同じコンテキストを共有します</span></div>
          </li>
          <li>
            <span class="check">4</span>
            <div><b>データ抽出ブロックリストフックの登録</b> - BNKAスモークテストで
            <code>permissionDecision: deny</code>が正常に動作するか検証します</div>
          </li>
        </ul>

        <div class="terminal" aria-hidden="true">
          <div class="terminal-bar"><span class="terminal-tab">/sc4sap:setup</span></div>
          <div class="terminal-body">
<span class="prompt">$</span> <span class="cmd">/sc4sap:setup</span><br/>
<span class="dim">→ SAPシステム: </span><span class="y">S4 / ECC ?</span> <span class="ok">S4</span><br/>
<span class="dim">→ ABAP Release ?</span> <span class="ok">756</span><br/>
<span class="dim">→ Industry ?</span> <span class="ok">automotive</span><br/>
<span class="dim">→ MCPサーバーをインストール中…</span> <span class="ok">✓ done</span><br/>
<span class="dim">→ SAP接続テスト…</span> <span class="ok">✓ GetSession OK</span><br/>
<span class="dim">→ ブロックリストフックを登録中…</span> <span class="ok">✓ deny(BNKA) 確認</span><br/>
<br/>
<span class="y">setup complete</span> <span class="dim">ready to run</span>
          </div>
        </div>
      </div>

      <div class="tagline-strong">
        結果 - SAPシステム情報に一度答えるだけで、MCPサーバーのインストールから権限の検証、ブロックリストフックの登録までが一括で完了します。
        チームメンバーが同じ環境を再びセットアップする際も、<code>sap.env</code>という1つのファイルを共有するだけで済みます
      </div>
    </div>` },

    '02': { html: `<div class="capd capd-02">
      ${head('02','🧠','Specialist Agents','25 agents · 役割別の専門協働')}
      <p class="capd-lede">分析・設計・実装・レビュー・デバッグが<b>役割別の専門エージェント</b>に委任されます。<br class="br-wide"/>各自が自分の分野だけで答え、「それらしいSAP知識」で答えをでっち上げる経路そのものが構造的に塞がれています</p>

      <div class="agent-heads">
        <div class="agent-head">
          <span class="count">CORE · 10</span>
          <h4>設計・実装・レビュー</h4>
          <p>analyst · architect · planner · executor · code-reviewer<br/>critic · debugger · qa-tester · doc-specialist · writer</p>
        </div>
        <div class="agent-head yellow">
          <span class="count">BASIS · 1</span>
          <h4>システム・トランスポート</h4>
          <p>sap-bc-consultant<br/>トランスポート戦略・ダンプ・性能チューニング専任</p>
        </div>
        <div class="agent-head">
          <span class="count">MODULES · 14</span>
          <h4>モジュールコンサルタント</h4>
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
        <h4>並列協働 - <code>/sc4sap:team</code></h4>
        <ul>
          <li>複数のエージェントが同じタスクリストを共有して<b>並列で作業</b>します - R/W権限とコンテキストは隔離されます</li>
          <li>モジュール判断が必要になると、<b>"## Module Consultation Needed"</b>ブロックで該当コンサルタントへ自動委任します</li>
          <li>システムレベルの課題（トランスポート・権限・性能）はBCコンサルタントへ別途エスカレーションします</li>
        </ul>
      </div>
    </div>` },

    '03': { html: `<div class="capd capd-03">
      ${head('03','🔍','Program Analyze','/sc4sap:program-to-spec')}
      <p class="capd-lede">レガシーABAPを機能/技術仕様書へ - <b>リバースエンジニアリングを分単位で</b></p>
      <p class="capd-desc">3,000行のレポートでも、Selection screenの画像・ALVカラムレイアウト・Process flowchart・CBO/Enhancementの依存関係まで自動で抽出します
      <br/>Audience / Format / Depth / Languageの<b>4軸Socratic質問</b>で深さを調整し、「すべてを文書化する」という罠を回避します
      <br/>運用引き継ぎ・監査対応・システム移行直前のレガシー整理 - 人が逐一コードを読みながら作成していた仕様書を分単位に圧縮し、Excel/Markdownの2フォーマットで同時に出力します</p>

      <!-- Pipeline flow: 4 steps with auto-arrows -->
      <div class="capd-flow">
        <div class="capd-flow-step"><b>STEP 1</b><span>Sourceロード</span><small><code>GetProgFullCode</code><br/>Includes · Forms · Classes</small></div>
        <div class="capd-flow-step"><b>STEP 2</b><span>構造抽出</span><small>Selection · ALV<br/>Logic · CBO · Enhancement</small></div>
        <div class="capd-flow-step"><b>STEP 3</b><span>可視化レンダリング</span><small>Selection PNG · ALV PNG<br/>Process Flowchart</small></div>
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
              <p>プログラムID · 作成者 · 最終更新 · 4軸メタ</p>
            </div>
          </li>
          <li>
            <span class="capd-xlsx-no">02</span>
            <div>
              <h6>Selection</h6>
              <p>Selection screenの<b>PNG埋め込み</b> + パラメータ表</p>
            </div>
          </li>
          <li>
            <span class="capd-xlsx-no">03</span>
            <div>
              <h6>Inputs / Screens</h6>
              <p>ALVカラムレイアウトPNG · フィールド説明 · 長さ</p>
            </div>
          </li>
          <li>
            <span class="capd-xlsx-no">04</span>
            <div>
              <h6>Process Logic</h6>
              <p><b>Process Flowchart</b>を自動レンダリング（ボックス · 判定 · 終了 + ↓）</p>
            </div>
          </li>
          <li>
            <span class="capd-xlsx-no">05</span>
            <div>
              <h6>CBO / Enhancement</h6>
              <p>Zオブジェクト依存ツリー · BAdI · CMOD · APPEND</p>
            </div>
          </li>
          <li class="warn">
            <span class="capd-xlsx-no"><i class="ph ph-warning" aria-hidden="true"></i></span>
            <div>
              <h6>Warnings</h6>
              <p>パース不可 · 危険パターン · 未解決項目</p>
            </div>
          </li>
        </ul>
      </div>
    </div>` },

    '04': { html: `<div class="capd capd-04">
      ${head('04','🧪','Analyze Code','/sc4sap:analyze-code')}
      <p class="capd-lede">Clean ABAP · 性能 · セキュリティ · 現代化 - <b>severity-rankedな静的レビュー</b></p>
      <p class="capd-desc">プロジェクトの<code>ABAP_RELEASE</code> / SAP versionコンテキストを反映し、<b>適用可能なパターンのみ</b>を推奨します
      <br/>OOP / Proceduralのパラダイムを自動で認識し、Where-usedグラフで影響度まで併せて提示します。行番号・呼び出し経路・即座に適用できるfix snippetを1つのまとまりとして返します
      <br/>セキュリティカテゴリは、SQL Injection・AUTHORITY-CHECK漏れ・動的コード実行といったOWASPパターンを静的解析で検出し
      <br/>性能カテゴリは、ネストしたLOOP・SELECTをsorted/hashed tableのlook-upへとリファクタリングする具体的なパッチコードまで添付します</p>

      <!-- The four review categories. Plain markup on the same hairline grid
           the other panels use: the previous design drew this as a fixed
           760x220 chevron with brand gradients, drop shadows, emoji for
           icons, and text sized in viewBox units that grew and shrank with
           the container instead of holding a reading size. -->
      <div class="capd-review">
        <div class="capd-review-cat">
          <i class="ph ph-broom" aria-hidden="true"></i>
          <h6>CLEAN ABAP</h6>
          <ul>
            <li>命名 · 単一責任</li>
            <li>マジックナンバー · 大域変数</li>
            <li>OOP / Proceduralの一貫性</li>
          </ul>
        </div>
        <div class="capd-review-cat">
          <i class="ph ph-gauge" aria-hidden="true"></i>
          <h6>PERFORMANCE</h6>
          <ul>
            <li>SELECT · インデックス</li>
            <li>ネストLOOP · INTO TABLE</li>
            <li>sorted / hashedの使用</li>
          </ul>
        </div>
        <div class="capd-review-cat">
          <i class="ph ph-lock-key" aria-hidden="true"></i>
          <h6>SECURITY</h6>
          <ul>
            <li>SQL Injection</li>
            <li>AUTHORITY-CHECK漏れ</li>
            <li>動的コードのsanitize</li>
          </ul>
        </div>
        <div class="capd-review-cat">
          <i class="ph ph-arrow-circle-up" aria-hidden="true"></i>
          <h6>MODERNIZATION</h6>
          <ul>
            <li>VALUE / REDUCE / COND</li>
            <li>FILTER · ラムダ式</li>
            <li>新syntaxの導入</li>
          </ul>
        </div>
      </div>

      <!-- Sample severity findings - top 3 issues from a typical legacy report -->
      <div class="capd-sev">
        <div class="capd-sev-row"><span class="capd-sev-tag crit">CRITICAL</span><div class="capd-sev-body"><b>SQL Injectionの可能性</b><span class="capd-sev-text">動的WHERE句にユーザー入力が直接結合されています (line 412)。<code>WHERE (lv_where)</code> → escaped bindingへ置換</span></div></div>
        <div class="capd-sev-row"><span class="capd-sev-tag crit">CRITICAL</span><div class="capd-sev-body"><b>AUTHORITY-CHECK漏れ</b><span class="capd-sev-text"><code>BUKRS</code>ベースの照会後、権限検証なしで出力しています (line 78)。<code>F_BKPF_BUK</code>権限オブジェクトのチェック追加が必要です</span></div></div>
        <div class="capd-sev-row"><span class="capd-sev-tag maj">MAJOR</span><div class="capd-sev-body"><b>SELECT … ENDSELECTループ</b><span class="capd-sev-text"><code>INTO TABLE</code> + <code>LOOP AT</code>へ変更すると約<b>70%の性能改善</b>が見込まれます</span></div></div>
      </div>
    </div>` },

    '05': { html: `<div class="capd capd-05">
      ${head('05','⚖️','Compare Programs','/sc4sap:compare-programs')}
      <p class="capd-lede">同じことをするプログラムが、なぜ2つも3つも稼働しているのか</p>
      <p class="capd-desc">
        <code>/sc4sap:compare-programs</code> - 2〜5個のABAPプログラムを同時にロードし、
        <b>10の次元で構造的に比較</b>します
        <br/>「コピーして直したプログラム」と「本当に別物のプログラム」を区別し、統合・廃止・共通化を判断する根拠を作ります
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
                <li class="match"><span class="cmp-bullet">●</span><span class="cmp-row-label">目的・範囲</span><span class="cmp-row-val">未収金レポート</span></li>
                <li class="diff"><span class="cmp-bullet">◐</span><span class="cmp-row-label">選択画面</span><span class="cmp-row-val">P_BUKRS · S_KUNNR</span></li>
                <li class="match"><span class="cmp-bullet">●</span><span class="cmp-row-label">データソース</span><span class="cmp-row-val">BSID + KNA1</span></li>
                <li class="opp"><span class="cmp-bullet">○</span><span class="cmp-row-label">出力構造</span><span class="cmp-row-val">List (WRITE)</span></li>
                <li class="diff"><span class="cmp-bullet">◐</span><span class="cmp-row-label">メッセージ処理</span><span class="cmp-row-val">MESSAGE I999</span></li>
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
                <li class="match"><span class="cmp-bullet">●</span><span class="cmp-row-label">目的・範囲</span><span class="cmp-row-val">未収金レポート</span></li>
                <li class="diff"><span class="cmp-bullet">◐</span><span class="cmp-row-label">選択画面</span><span class="cmp-row-val">+ S_BLDAT 追加</span></li>
                <li class="match"><span class="cmp-bullet">●</span><span class="cmp-row-label">データソース</span><span class="cmp-row-val">BSID + KNA1</span></li>
                <li class="opp"><span class="cmp-bullet">○</span><span class="cmp-row-label">出力構造</span><span class="cmp-row-val">CL_GUI_ALV_GRID</span></li>
                <li class="diff"><span class="cmp-bullet">◐</span><span class="cmp-row-label">メッセージ処理</span><span class="cmp-row-val">BAL_LOG</span></li>
              </ul>
            </div>
          </div>
          <div class="cmp-legend">
            <span><b class="cmp-bullet" style="color:var(--ok)">●</b> 同一</span>
            <span><b class="cmp-bullet" style="color:#B88900">◐</b> 差異</span>
            <span><b class="cmp-bullet" style="color:var(--danger)">○</b> 相反</span>
            <span class="cmp-legend-meta">10次元のうち5つを表示 · 実際のレポートは 目的・範囲 / 選択画面 / データソース / ビジネスロジック / 出力 / UI / メッセージ / 性能 / Text Element / CBO·Enhancement の全次元を比較します</span>
          </div>
        </div>

        <div class="callout cmp-verdict">
          <span class="cmp-verdict-mark">VERDICT</span>
          何年もの間「似ているけど少し違う」3つのZレポートが漂っていたプロジェクトでも、
          10次元比較レポート1つで、統合・廃止・標準化の決定を一度に下せます
          <br/>AIが「新しく作ろう」と提案する前に、<b>すでにあるプログラムを先に見る</b>という原則が、
          この機能によって運用にまで拡張されます
        </div>
      </div>
    </div>` },

    '06': { html: `<div class="capd capd-06">
      ${head('06','🩺','Maintenance Diagnosis','/sc4sap:analyze-symptom')}
      <p class="capd-lede">ダンプIDを渡すだけでSAP Note候補まで、Claudeの中で一次分析を完了</p>
      <p class="capd-desc">ST22 · SM02 · /IWFND/ERROR_LOG · SATプロファイラをMCPツールで直接引き寄せて分析します。<code>sap-debugger</code> / <code>sap-bc-consultant</code>へ自動委任され、未知の領域まで安全に拡張します
      <br/>単なるスタックトレースの出力ではなく、<b>呼び出しチェーン・変数ダンプ・メモリ状態</b>を統合して仮説を提示し、後続アクション（Note適用・コード修正・権限追加）を選択肢として返します
      <br/>運用引き継ぎ直後に初めて見るダンプでも、一次分析を終えてBCチームへ的確な質問として引き渡せます</p>

      <div class="capd-flow">
        <div class="capd-flow-step"><b>STEP 1</b><span>ダンプ収集</span><small><code>RuntimeListDumps</code><br/><code>RuntimeAnalyzeDump</code></small></div>
        <div class="capd-flow-step"><b>STEP 2</b><span>スタック分析</span><small>呼び出しチェーン · Source位置 · 変数ダンプ</small></div>
        <div class="capd-flow-step"><b>STEP 3</b><span>原因仮説</span><small>Lock · Memory · Auth · DB · Network</small></div>
        <div class="capd-flow-step"><b>STEP 4</b><span>SAP Note候補</span><small>検索キーワード + アクション選択肢</small></div>
      </div>

      <div class="capd-chips">
        <span class="chip2"><svg class="chip-edge" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><rect x="0.5" y="0.5" width="99" height="99" rx="2" pathLength="100" /></svg><i class="ph ph-bug" aria-hidden="true"></i>ST22 Runtime Dumps</span>
        <span class="chip2"><svg class="chip-edge" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><rect x="0.5" y="0.5" width="99" height="99" rx="2" pathLength="100" /></svg><i class="ph ph-megaphone" aria-hidden="true"></i>SM02 System Msgs</span>
        <span class="chip2"><svg class="chip-edge" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><rect x="0.5" y="0.5" width="99" height="99" rx="2" pathLength="100" /></svg><i class="ph ph-globe" aria-hidden="true"></i>/IWFND/ERROR_LOG</span>
        <span class="chip2"><svg class="chip-edge" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><rect x="0.5" y="0.5" width="99" height="99" rx="2" pathLength="100" /></svg><i class="ph ph-timer" aria-hidden="true"></i>SAT Profiler</span>
        <span class="chip2"><svg class="chip-edge" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><rect x="0.5" y="0.5" width="99" height="99" rx="2" pathLength="100" /></svg><i class="ph ph-key" aria-hidden="true"></i>SU53 Auth Check</span>
        <span class="chip2"><svg class="chip-edge" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><rect x="0.5" y="0.5" width="99" height="99" rx="2" pathLength="100" /></svg><i class="ph ph-lock-simple" aria-hidden="true"></i>SM12 Lock Entries</span>
      </div>
    </div>` },

    '07': { html: `<div class="capd capd-07">
      ${head('07','🔒','Fit to System')}
      <p class="capd-lede">運用現場が本当に求める3つ - <b>文書化 · 障害対応 · データ保護</b></p>
      <p class="capd-desc">
        生成機能だけでは、実務のSAP運用環境に完全に適用させることは困難です
        <br/>sc4sapは新規開発に加えて、
        レガシーの文書化、障害の一次分析、エンタープライズ級のデータ保護まで<b>1つのパッケージの中で提供</b>します
      </p>

      <div class="fit-wrap">
        <div class="fit-card">
          <div class="fit-icon">📄</div>
          <h4>Reverse Engineering</h4>
          <p><b>レガシーを仕様へと戻す</b><br/><code>/sc4sap:analyze-code</code> · <code>/sc4sap:program-to-spec</code></p>
          <ul>
            <li>Clean ABAP · 性能 · セキュリティのカテゴリ別レビューレポート</li>
            <li>機能/技術仕様書（MarkdownまたはExcel）を自動生成</li>
            <li>Socraticなスコープ調整で「すべてを文書化する」罠を回避</li>
            <li>何年も先送りされてきたレガシー文書化作業を分単位に圧縮</li>
          </ul>
        </div>
        <div class="fit-card y">
          <div class="fit-icon">🩺</div>
          <h4>Operational Triage</h4>
          <p><b>Claudeの中で完結する障害分析</b><br/><code>/sc4sap:analyze-symptom</code></p>
          <ul>
            <li><b>ST22ダンプ</b> - <code>RuntimeListDumps</code> / <code>RuntimeAnalyzeDump</code></li>
            <li><b>SM02システムメッセージ</b> - <code>RuntimeListSystemMessages</code></li>
            <li><b>/IWFND/ERROR_LOG</b> Gatewayエラー - <code>RuntimeGetGatewayErrorLog</code></li>
            <li><b>SATプロファイラ</b> - <code>RuntimeAnalyzeProfilerTrace</code></li>
            <li>スタックトレース分析 → SAP Note候補 → 原因仮説 → アクション選択肢</li>
          </ul>
        </div>
        <div class="fit-card g">
          <div class="fit-icon">🔒</div>
          <h4>Data Protection</h4>
          <p><b>4重防御 + acknowledge_risk HARD RULE</b><br/>PII · 給与 · バンキング · 取引財務の行単位の流出を根本から遮断</p>
          <ul>
            <li>L1 エージェント指示文 - カテゴリ別の拒否 + 代替案の提示</li>
            <li>L2 グローバル<code>CLAUDE.md</code> - すべてのセッションに自動注入</li>
            <li>L3 <code>PreToolUse</code>フック - 呼び出しを遮断 (deny)</li>
            <li>L4 MCPサーバー内部ガード - opt-inのサーバーレベル遮断</li>
          </ul>
        </div>
      </div>

      <h3 class="subhead">4重防御レイヤー構造 <span class="ln"></span></h3>
      <div class="defense-table">
        <table>
          <thead>
            <tr><th>Layer</th><th>位置</th><th>役割</th></tr>
          </thead>
          <tbody>
            <tr><td>L1</td><td>エージェント指示文</td><td>カテゴリ別の拒否 + 代替案の提示 (PII / HR / Banking / Transactional Finance ···)</td></tr>
            <tr><td>L2</td><td><code>CLAUDE.md</code> グローバル</td><td>すべてのセッションに自動注入されるData Extraction Policy</td></tr>
            <tr><td>L3</td><td>Claude Code <code>PreToolUse</code> フック</td><td><code>permissionDecision: deny</code>で実際のMCP呼び出しを遮断</td></tr>
            <tr><td>L4</td><td>MCPサーバー内部ガード</td><td>サーバーレベルでopt-in遮断 - 他のクライアントからの呼び出しも封鎖</td></tr>
          </tbody>
        </table>
      </div>

      <h3 class="subhead">ブロックリストプロファイル - 環境に合わせてスコープを選択 <span class="ln"></span></h3>
      <div class="profile-row">
        <div class="profile strict">
          <span class="name">strict</span>
          <p>PII + クレデンシャル + HR + 取引財務 + 監査ログ + ワークフロー。<b>デフォルト</b></p>
        </div>
        <div class="profile standard">
          <span class="name">standard</span>
          <p>PII + クレデンシャル + HR + 取引財務。一般プロジェクトのデフォルト</p>
        </div>
        <div class="profile minimal">
          <span class="name">minimal</span>
          <p>PII + クレデンシャル + HR + Tax。業務テーブルの照会は許可</p>
        </div>
        <div class="profile custom">
          <span class="name">custom</span>
          <p><code>.sc4sap/blocklist-custom.txt</code>にユーザー指定リスト</p>
        </div>
      </div>

      <div class="hard-rule">
        <span class="tag-hard">HARD RULE</span>
        <h4><code>acknowledge_risk</code> - per-call · per-table · per-session の明示的な承認</h4>
        <p>
          <code>GetTableContents</code> / <code>GetSqlQuery</code>で機密テーブルにアクセスするには、
          ユーザーが<b>明示的な肯定キーワード</b>で許可する必要があります
        </p>
        <p>
          認められる表現:
          <span class="kw">yes</span>
          <span class="kw">승인</span>
          <span class="kw">authorize</span>
          <span class="kw">approve</span>
          <span class="kw">proceed</span>
          <span class="kw">confirmed</span>
        </p>
        <p>
          認められない表現（曖昧な命令）:
          <span class="bad">뽑아봐</span>
          <span class="bad">try it</span>
          <span class="bad">my mistake</span>
          <span class="bad">해봐</span>
        </p>
        <p style="margin-top:14px;">
          承認は<b>呼び出し単位・テーブル単位・セッション単位でのみ有効</b>であり、次のリクエストへは引き継がれません
          <b>「AIが誤って機密テーブルを抽出する経路」そのものをなくすこと</b>が設計目標です
        </p>
      </div>

      <div class="ack-demo">
        <h5 class="ack-head"><i class="ph ph-cursor-click" aria-hidden="true"></i>ゲート体験 - キーワードをクリックしてみてください</h5>
        <div class="ack-buttons">
          <button class="ack-btn" data-kw="yes">yes</button>
          <button class="ack-btn" data-kw="뽑아봐">뽑아봐</button>
          <button class="ack-btn" data-kw="authorize">authorize</button>
          <button class="ack-btn" data-kw="my mistake">my mistake</button>
          <button class="ack-btn" data-kw="해봐">해봐</button>
          <button class="ack-btn" data-kw="승인">승인</button>
          <button class="ack-btn" data-kw="approve">approve</button>
          <button class="ack-btn" data-kw="try it">try it</button>
        </div>
        <div class="ack-window">
          <div class="terminal-bar"><span class="terminal-tab">acknowledge_risk</span></div>
          <div class="ack-output" aria-live="polite">→ 上記のキーワードのいずれかをクリックして、ゲートの動作を確認してください</div>
        </div>
      </div>
    </div>` },

    '08': { html: `<div class="capd capd-08">
      ${head('08','🗃️','Reusability · CBO Reuse','/sc4sap:analyze-cbo-obj')}
      <p class="capd-lede">すでにあるZオブジェクトを、AIが作り直さないように</p>
      <p class="capd-desc">
        何年も使い込んできたSAPシステムほど、<code>ZCL_*</code> · <code>ZFM_*</code> · <code>Z*_DE</code> · カスタム構造体・テーブルタイプが
        数百個と積み重なっています。この資産を知らないままAIに開発を任せると
        <br/><b>同じ機能のZオブジェクトをまた作る</b>ことが繰り返されますが、SC4SAPはこの問題をパイプラインの前段で遮断します
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
          <p>財務・物流の置換・検証ルール</p>
        </div>
        <div class="rx-hub">
          <span class="rx-hub-eyebrow">REUSE FIRST</span>
          <h4>すでにある資産を<br/>先に提案します</h4>
          <code class="rx-hub-cmd">/sc4sap:analyze-cbo-obj</code>
          <ul class="rx-hub-bullets">
            <li><b>create-program</b>がプラン段階でインベントリをロード</li>
            <li>すべての<code>Create*</code>呼び出しは<b>再利用ゲート</b>の通過が必須</li>
            <li>1回スキャン → 数週間にわたり同じインベントリを共有</li>
          </ul>
        </div>
        <div class="rx-card rx-right">
          <div class="rx-icon">🔌</div>
          <code>BAdI</code>
          <h5>Business Add-In</h5>
          <p>Classic / Kernel / Enhancement Spot<br/>実装クラス</p>
        </div>
        <div class="rx-card rx-bot">
          <div class="rx-icon">➕</div>
          <code>APPEND</code>
          <h5>Structure Append</h5>
          <p>標準テーブル・構造体のCI/ZZフィールド + BAPI <code>EXTENSION</code></p>
        </div>
      </div>

      <div class="callout rx-callout">
        <b>「新しいCBOを作るべきか」は、常に最後の質問です</b>
        sc4sapはuser-exit · 置換/検証 · BAdI実装 · APPEND構造体までインベントリに含め、ブラウンフィールドの<b>「重複Z」事故</b>を構造的に遮断します
      </div>
    </div>` },

    '09': { html: `<div class="capd capd-09">
      ${head('09','🏭','Industry Context')}
      <p class="capd-lede">14業種に対する<b>ビジネスコンテキストがエージェントの中に搭載</b>されます</p>
      <p class="capd-desc">リテールのArticleと、ファッションのStyle × Color × Sizeでは、マスターデータの構造そのものが異なります
      <br/>自動車のJIT/JISスケジューリング、製薬のGMP · Serialization、鉄鋼のCharacteristic Inventory · Coil · Heatトラッキングのように、同じERPの上で異なる業務ルールが動いています
      <br/><code>config.json</code>のindustry値に応じて、Analyst · Critic · Plannerが該当業種のリファレンスを<b>mandatory</b>としてロードした上で作業を開始し
      <br/>各ファイルはBusiness Characteristics / Key Processes / Master Data / Pitfallsの4セクションに整理され、モジュールコンサルタントと自動で相互検証されます
      <br/><b>「リテールプロジェクトに自動車式のBOMを持ち込む」事故が、構造的かつ根本的に遮断</b>されます</p>
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
      <p class="capd-lede">韓国では税金計算書、イタリアではSDI FatturaPA、メキシコではCFDI - 同じFI伝票でも、出力様式と法定要件は国ごとに完全に異なります</p>
      <p class="capd-desc">出力様式だけでなく、<b>e-Invoicingの義務適用時期</b>、<b>銀行通信プロトコル</b>、<b>税務申告の周期</b>、<b>データ保存期間</b>まで、ある国の会計フローをそのまま別の国へ移せる部分はほとんどありません
      <br/>SC4SAPは16カ国のリファレンスを<b>Tax · e-Invoicing · Banking · Statutory Reporting</b>の4つの基準点に整理しておき
      <br/><code>config.json</code>のcountry値に応じて、Analyst · Critic · Plannerが該当ファイルを<b>mandatory</b>としてロードした上で作業を開始します
      <br/>その後のマルチカントリーロールアウトでは、<b>インターカンパニー · EU域内VAT · 移転価格</b>といった交差接点を自動でフラグし、単一コードベースの上で国別の分岐を一度に追跡できるよう支援します</p>
      <div class="capd-carousel" data-speed="2400" aria-label="16 countries step-snap carousel">
        <div class="capd-carousel-track">
          <div class="capd-flag" data-name="Korea"      data-detail="電子税金計算書(NTS) · 事業者登録番号 · 住民番号 PII"><span class="em">🇰🇷</span><span class="nm">KR</span><span class="tx">NTS · 住民番号</span></div>
          <div class="capd-flag" data-name="Japan"      data-detail="Qualified Invoice · Zengin · 法人番号"><span class="em">🇯🇵</span><span class="nm">JP</span><span class="tx">Qualified Inv</span></div>
          <div class="capd-flag" data-name="China"      data-detail="Golden Tax · e-fapiao · SAFE FX"><span class="em">🇨🇳</span><span class="nm">CN</span><span class="tx">Golden Tax</span></div>
          <div class="capd-flag" data-name="USA"        data-detail="Sales &amp; Use Tax · EIN · 1099 · ACH · Nexus"><span class="em">🇺🇸</span><span class="nm">US</span><span class="tx">Sales · ACH</span></div>
          <div class="capd-flag" data-name="Germany"    data-detail="USt · ELSTER · XRechnung/ZUGFeRD · SEPA"><span class="em">🇩🇪</span><span class="nm">DE</span><span class="tx">XRechnung</span></div>
          <div class="capd-flag" data-name="UK"         data-detail="VAT + MTD · BACS/FPS/CHAPS · GB vs XI"><span class="em">🇬🇧</span><span class="nm">UK</span><span class="tx">VAT MTD</span></div>
          <div class="capd-flag" data-name="France"     data-detail="TVA · FEC · Factur-X 2026"><span class="em">🇫🇷</span><span class="nm">FR</span><span class="tx">FEC · Factur-X</span></div>
          <div class="capd-flag" data-name="Italy"      data-detail="IVA · FatturaPA/SDI · Split Payment"><span class="em">🇮🇹</span><span class="nm">IT</span><span class="tx">FatturaPA</span></div>
          <div class="capd-flag" data-name="Spain"      data-detail="IVA · SII リアルタイム報告 · TicketBAI"><span class="em">🇪🇸</span><span class="nm">ES</span><span class="tx">SII · TicketBAI</span></div>
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
          <p class="ac-detail" data-ac-detail>電子税金計算書(NTS) · 事業者登録番号 · 住民番号 PII</p>
        </div>
      </div>

      <div class="mechanism-note">
        <b>動作の仕組み</b>
        <ul>
          <li><code>.sc4sap/config.json</code> → <code>industry</code> / <code>country</code>の値が、セッション開始時に自動ロードされます</li>
          <li>Analyst · Critic · PlannerはCountry Contextブロックを<b>mandatory</b>としてロードした上で作業を開始します</li>
          <li>マルチカントリーロールアウトでは、該当ファイルをすべてロードし、<b>インターカンパニー · EU域内VAT · 移転価格といった交差接点を自動でフラグ</b>します</li>
        </ul>
      </div>
    </div>` },

    '11': { html: `<div class="capd capd-11">
      ${head('11','🎯','Active-Module Awareness')}
      <p class="capd-lede">モジュールの組み合わせに応じて、標準オブジェクトを使い分けます</p>
      <p class="capd-desc">同じ「原価分析」でも、プロジェクトが<b>MM + PS</b>ならWBS基準、<b>SD + CO</b>ならCO-PAセグメント基準へと変わります
      <br/><code>config.json</code>のactiveModulesリストを根拠に、エージェントが組み合わせ別の<b>Standard</b>オブジェクトと<b>BAPI</b>を自動選択し、交差接点をフラグします
      <br/><b>FI + TR</b>が有効化されると、支払提案 → 資金管理 → House Bank振替までの経路が設計され、<b>QM + PP</b>なら製造オーダーの段階別にin-process検査lotが自動生成されるよう流れを組み立てます</p>
      <div class="capd-combos">
        <div class="capd-combo">
          <div class="capd-combo-eq"><span>MM</span><span>+</span><span>PS</span><span class="arrow">⇒</span><span class="out">WBSコスト</span></div>
          <p>WBS要素にコストを直接集計。<code>BANFN</code> · <code>EBELN</code>の<code>PS_PSP_PNR</code>キーでプロジェクトに帰属させます</p>
        </div>
        <div class="capd-combo">
          <div class="capd-combo-eq"><span>SD</span><span>+</span><span>CO</span><span class="arrow">⇒</span><span class="out">CO-PA</span></div>
          <p>受注 · 請求基準のセグメントチャネルで伝票を転記。数量・金額を<code>CE1</code> / <code>CE4</code>へ分解します</p>
        </div>
        <div class="capd-combo">
          <div class="capd-combo-eq"><span>FI</span><span>+</span><span>TR</span><span class="arrow">⇒</span><span class="out">資金・ハウスバンク</span></div>
          <p>支払提案 → TR資金管理 → House Bank振替。<code>FEBAN</code> · <code>FF7A</code>の連携経路を自動認識します</p>
        </div>
        <div class="capd-combo">
          <div class="capd-combo-eq"><span>QM</span><span>+</span><span>PP</span><span class="arrow">⇒</span><span class="out">検査lot</span></div>
          <p>製造オーダーの段階別にin-process検査lotを生成。受入検査・最終検査の時点を自動で分岐します</p>
        </div>
      </div>
    </div>` },

    '12': { html: `<div class="capd capd-12">
      ${head('12','🏗️','Formatted Auto Program Maker','/sc4sap:create-program')}
      <p class="capd-lede">最初のコミットが、すでにコンベンションを守っているプログラム</p>
      <p class="capd-desc">
        <code>/sc4sap:create-program</code>は、アイデア一行から有効化されたABAPオブジェクトまでつながる8段階のパイプラインです
        <br/>成果物は「動きはする下書き」ではなく、<b>sc4sapコーディングコンベンションを厳格に守った最終コード</b>として出力されます
      </p>

      <div class="dev-flow">
        <div class="dev-spine" aria-hidden="true"></div>

        <div class="dev-step left">
          <span class="dev-pill y">PHASE 3</span>
          <h4>仕様作成 + 承認ゲート</h4>
          <p>ユーザーが<code>승인</code> / <code>approve</code>を
          <br/>明示するまでは先へ進みません</p>
        </div>

        <div class="dev-step right">
          <span class="dev-pill">PHASE 4</span>
          <h4>並列Include生成 + 一括有効化</h4>
          <p>Main + 条件付きIncludeを並列生成した後、単一のSemantic Analysis + バッチ有効化。個別ループと比べて<b>約40〜60%短縮</b></p>
        </div>

        <div class="dev-step left">
          <span class="dev-pill">PHASE 6</span>
          <h4>4バケット並列コンベンションレビュー</h4>
          <p>ALV+UI · Logic · Structure+Naming · PlatformをSonnetで並列レビュー <b>MAJOR発見時のみ
          <br/>Opusへエスカレーション</b></p>
        </div>

        <div class="dev-step right">
          <span class="dev-pill y">PHASE 8</span>
          <h4>完了レポート (PASSゲート)</h4>
          <p>Phase 6 PASSを条件とする完了レポート。<code>state.json</code>のタイミングテーブルで
          <br/>C-2再開をサポート</p>
        </div>
      </div>

      <div class="dev-result">
        <div class="dev-result-line">
          <span class="dev-result-prompt">→</span>
          <span class="dev-result-text">結果として、レビュアーの仕事は<b>「コンベンションの補正」</b>ではなく<b>「ビジネスロジックの判断」</b>に費やされます</span>
        </div>
        <div class="dev-result-sub">最初から通過するコードを作るため、人はこのプログラムが<b><i>正しいことをしているか</i></b>だけを見れば済みます</div>
      </div>
    </div>` }
  };
})();
