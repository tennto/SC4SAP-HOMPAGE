/* ============================================================
   app.js — theme, language, navigation, the capability index,
   and the small amount of motion this page uses.

   No scroll listeners anywhere. Nav state and reveals both run on
   IntersectionObserver.
   ============================================================ */

(function () {
  'use strict';

  var THEME_KEY = 'sc4sap-theme';   // same keys as the deployed site, so a
  var LANG_KEY  = 'sc4sap-lang';    // returning visitor keeps their settings
  var SUPPORTED = ['ko', 'en', 'ja'];
  var INSTALL_CMD = '/plugin install sc4sap';
  var REPO = 'babamba2/superclaude-for-sap';

  var root = document.documentElement;
  var S = window.SC4_STRINGS;

  function store(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* private mode */ } }
  function read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }

  /* ==========================================================
     Theme
     ========================================================== */

  var themeTimer = null;
  var THEME_SWAP = 380;   // matches the .theme-swap transition in base.css

  /* `animate` is false on first paint: the inline head script has already
     set the theme, and easing into it would be a flash, not a transition. */
  function applyTheme(theme, animate) {
    if (animate && !prefersReduced()) {
      root.classList.add('theme-swap');
      clearTimeout(themeTimer);
      themeTimer = setTimeout(function () {
        root.classList.remove('theme-swap');
        themeTimer = null;
      }, THEME_SWAP + 40);
    }
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
  }

  var storedTheme = read(THEME_KEY);
  var mql = window.matchMedia('(prefers-color-scheme: dark)');
  applyTheme(storedTheme || (mql.matches ? 'dark' : 'light'), false);

  mql.addEventListener('change', function (e) {
    if (!read(THEME_KEY)) applyTheme(e.matches ? 'dark' : 'light', true);
  });

  var themeBtn = document.querySelector('[data-theme-toggle]');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
    store(THEME_KEY, next);
  });

  /* ==========================================================
     Language
     ========================================================== */

  function detectLang() {
    var saved = read(LANG_KEY);
    if (SUPPORTED.indexOf(saved) > -1) return saved;
    var nav = (navigator.language || 'ko').toLowerCase();
    if (nav.indexOf('ja') === 0) return 'ja';
    if (nav.indexOf('ko') === 0) return 'ko';
    return 'en';
  }

  var lang = detectLang();
  function t(key) { return (S[lang] && S[lang][key]) || (S.ko[key] || key); }

  function applyLang() {
    root.setAttribute('lang', lang);

    document.querySelectorAll('[data-t]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-t'));
    });
    document.querySelectorAll('[data-t-html]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-t-html'));
    });
    document.querySelectorAll('[data-t-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-t-aria')));
    });

    document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang-btn') === lang));
    });

    moveLangThumb();
    splitHeadline();
    if (csRefresh) csRefresh();
    renderIndex();
  }

  /* ---------- The language highlight travels to the segment you pick ---------- */

  function moveLangThumb() {
    var wrap = document.querySelector('.lang');
    if (!wrap) return;
    var active = wrap.querySelector('[aria-pressed="true"]');
    if (!active) return;
    // offsetLeft is relative to .lang, which carries 2px of padding that
    // the thumb already accounts for in its own `left`.
    wrap.style.setProperty('--thumb-w', active.offsetWidth + 'px');
    wrap.style.setProperty('--thumb-x', (active.offsetLeft - 2) + 'px');
  }

  function settleLangThumb() {
    var wrap = document.querySelector('.lang');
    if (!wrap) return;

    // Re-measure without sliding whenever the control itself changes size:
    // the mobile menu stretches the segments, and web fonts land late.
    var remeasure = function () {
      wrap.classList.add('no-anim');
      moveLangThumb();
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { wrap.classList.remove('no-anim'); });
      });
    };

    remeasure();
    if (window.ResizeObserver) new ResizeObserver(remeasure).observe(wrap);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
  }

  /* ==========================================================
     Hero headline — each line rises out of its own clip window
     ========================================================== */

  function splitHeadline() {
    var h1 = document.querySelector('[data-hero-title]');
    if (!h1) return;

    // heroTitle carries the line breaks the copy was written around, so
    // the split follows the translation rather than a measured wrap.
    var lines = h1.innerHTML.split(/<br\s*\/?>/i);
    if (lines.length < 2) return;

    h1.innerHTML = lines
      .map(function (line) {
        return '<span class="hl"><span class="hl-i">' + line.trim() + '</span></span>';
      })
      .join('');
  }

  /* ==========================================================
     Install command types itself out, once
     ========================================================== */

  function typeCommand() {
    var host = document.querySelector('[data-type-cmd]');
    if (!host) return;
    var code = host.querySelector('code');
    if (!code) return;

    var full = code.textContent.trim();
    code.setAttribute('aria-label', full);

    if (prefersReduced()) return;   // leave the command fully typed

    var typed = document.createElement('span');
    var caret = document.createElement('span');
    caret.className = 'caret';
    caret.setAttribute('aria-hidden', 'true');

    code.textContent = '';
    code.append(typed, caret);
    host.classList.add('typing');

    var i = 0;
    var START = 900;        // let the headline land first
    var STEP = 42;

    setTimeout(function tick() {
      typed.textContent = full.slice(0, ++i);
      if (i < full.length) setTimeout(tick, STEP);
      else host.classList.remove('typing');   // caret starts blinking
    }, START);
  }

  /* Switching language cross fades the copy instead of swapping it under
     the reader. The segmented control updates on the click itself, so the
     UI answers immediately while the text takes its 420ms. */
  var swapTimer = null;
  var SWAP_OUT = 200;

  document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = btn.getAttribute('data-lang-btn');
      if (next === lang) return;

      lang = next;
      store(LANG_KEY, lang);

      document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-lang-btn') === lang));
      });
      moveLangThumb();

      if (prefersReduced()) { applyLang(); return; }

      // A click during a swap retargets it rather than being dropped, so
      // the last language pressed is always the one that lands.
      if (swapTimer) clearTimeout(swapTimer);
      document.body.classList.add('lang-swap');

      swapTimer = setTimeout(function () {
        applyLang();
        requestAnimationFrame(function () {
          document.body.classList.remove('lang-swap');
          swapTimer = null;
        });
      }, SWAP_OUT);
    });
  });

  /* ==========================================================
     Navigation
     ========================================================== */

  var nav = document.querySelector('.nav');
  var sentinel = document.querySelector('[data-nav-sentinel]');

  if (nav && sentinel) {
    new IntersectionObserver(function (entries) {
      nav.classList.toggle('scrolled', !entries[0].isIntersecting);
    }, { rootMargin: '0px' }).observe(sentinel);
  }

  var navToggle = document.querySelector('.nav-toggle');
  var navLinks  = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });

    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ==========================================================
     Copy the install command
     ========================================================== */

  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      /* Resolve the command from its own block. The hero command is typed
         out character by character, so its DOM text is unreliable mid
         animation; the declared data-cmd is the source of truth. */
      var holder = btn.closest('[data-cmd]');
      var block = btn.closest('.install-cmd, .cmd-block');
      var codeEl = block && block.querySelector('code');
      var CMD = (holder && holder.getAttribute('data-cmd'))
        || (codeEl && codeEl.textContent.trim())
        || INSTALL_CMD;

      var done = function () {
        btn.classList.add('done');
        btn.querySelector('[data-copy-label]').textContent = t('copied');
        setTimeout(function () {
          btn.classList.remove('done');
          btn.querySelector('[data-copy-label]').textContent = t('copy');
        }, 1800);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(CMD).then(done, fallback);
      } else {
        fallback();
      }

      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = CMD;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { /* nothing to do */ }
        document.body.removeChild(ta);
      }
    });
  });

  /* ==========================================================
     GitHub stars — decorated only on success, never a broken dash
     ========================================================== */

  fetch('https://api.github.com/repos/' + REPO)
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (d) {
      if (typeof d.stargazers_count !== 'number') return;
      document.querySelectorAll('[data-stars]').forEach(function (el) {
        el.textContent = String(d.stargazers_count);
        el.closest('.stars').hidden = false;
      });
    })
    .catch(function () { /* the strip simply stays hidden */ });

  /* ==========================================================
     Capability index
     ========================================================== */

  var indexEl = document.querySelector('[data-index]');
  var openId = null;   // survives a language switch

  function panelSet() {
    return ({ ko: window.SC4_PANELS_KO, en: window.SC4_PANELS_EN, ja: window.SC4_PANELS_JA })[lang]
      || window.SC4_PANELS_KO;
  }

  function panelHtml(id) {
    var set = panelSet();
    var entry = (set && set[id]) || (window.SC4_PANELS_KO && window.SC4_PANELS_KO[id]);
    return entry ? entry.html : '';
  }

  function renderIndex() {
    if (!indexEl) return;
    indexEl.innerHTML = '';

    S.titles.forEach(function (title, i) {
      var id = String(i + 1).padStart(2, '0');

      var entry = document.createElement('div');
      entry.className = 'entry';
      entry.dataset.capId = id;
      entry.dataset.open = 'false';

      /* Heading-wrapped button: the WAI-ARIA accordion pattern, so the
         twelve entries show up in a screen reader's heading list. */
      var heading = document.createElement('h3');
      heading.className = 'entry-h';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'entry-btn';
      btn.id = 'cap-btn-' + id;
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', 'cap-' + id);
      btn.innerHTML =
        '<span class="entry-n">' + id + '</span>' +
        '<span class="entry-title">' + title + '</span>' +
        '<span class="entry-sum">' + t('cap' + id) + '</span>' +
        '<i class="ph ph-plus entry-mark" aria-hidden="true"></i>';

      var body = document.createElement('div');
      body.className = 'entry-body';
      body.id = 'cap-' + id;
      body.setAttribute('role', 'region');
      body.setAttribute('aria-labelledby', 'cap-btn-' + id);
      var inner = document.createElement('div');
      body.appendChild(inner);

      btn.addEventListener('click', function () { toggle(id); });

      heading.appendChild(btn);
      entry.appendChild(heading);
      entry.appendChild(body);
      indexEl.appendChild(entry);
    });

    if (openId) open(openId, false);
  }

  function toggle(id) {
    if (openId === id) { close(id); openId = null; }
    else {
      if (openId) close(openId);
      openId = id;
      open(id, true);
    }
  }

  function entryFor(id) { return indexEl.querySelector('.entry[data-cap-id="' + id + '"]'); }

  function open(id, scroll) {
    var entry = entryFor(id);
    if (!entry) return;
    var inner = entry.querySelector('.entry-body > div');

    if (!inner.dataset.rendered || inner.dataset.lang !== lang) {
      inner.innerHTML = panelHtml(id);
      inner.dataset.rendered = '1';
      inner.dataset.lang = lang;
      initPanel(inner);
    }

    entry.dataset.open = 'true';
    entry.querySelector('.entry-btn').setAttribute('aria-expanded', 'true');

    // Replayed on every open, not just the first render.
    typeTerminals(inner);

    if (scroll) scrollRowUnderNav(entry);
  }

  /* ----------------------------------------------------------
     Bringing an opened row up under the bar

     This cannot be a single scrollTo. At the moment a row is opened the
     layout is not the layout we are scrolling to: the row that was open is
     still collapsing over the next 620ms, and if it sat above this one the
     whole page is about to move up by its height, which differs per panel.
     Reading a target now and scrolling to it lands somewhere different
     every time, depending on which row happened to be open before.

     Two smaller errors ride along with it. offsetHeight cannot see the
     nav's condense transform, so it reports 68 for a bar that will occupy
     60 once the page has moved. And opening one of the last rows targets a
     position past the end of a document that has not grown yet, so the
     browser clamps the scroll short and never revisits it.

     So the target is recomputed every frame and the scroll eases toward
     wherever it currently is. A moving layout needs a moving target.
     ---------------------------------------------------------- */

  var ROW_GAP = 16;      // breathing room between the bar and the row
  var TRIP_MIN = 380;    // a neighbouring row
  var TRIP_MAX = 720;    // and the whole index, which must not cost much more
  var TRIP_PER_PX = 0.06;

  function navClearance() {
    // offsetHeight reports the bar's laid-out 68px whether or not it has
    // slid up by its 8px of padding, so it is 8 too many once the page has
    // moved. The rect does see the transform. Reading it rather than
    // subtracting a number kept in the stylesheet also means the two can
    // never drift apart, and because this is recomputed every frame the
    // clearance corrects itself the moment the bar condenses.
    var bottom = nav.getBoundingClientRect().bottom;
    return bottom || nav.offsetHeight;
  }

  function scrollRowUnderNav(entry) {
    /* What the page is about to be, not what it is.

       Reading the row's position right now is reading it through a layout
       that is still moving: the row that was open is mid-collapse and, if it
       sits above this one, is about to take its whole height out from under
       it. Chasing that value frame by frame does land correctly in the end,
       but on the way it aims at a row that is still too far down, so the
       scroll sails past the resting place and comes back. Opening the
       eleventh row while the third is open overshoots by most of the third
       panel's height.

       So the pending change is measured and applied up front. A body that
       is closing will give back its current height; one that is opening will
       take its remaining height. The first only matters above this row; both
       matter to how far the document can scroll. */
    function pending() {
      var here = entry.getBoundingClientRect().top;
      var shrinkAbove = 0, shrinkAll = 0, growAll = 0;

      indexEl.querySelectorAll('.entry').forEach(function (row) {
        var body = row.querySelector('.entry-body');
        if (!body) return;
        var now = body.getBoundingClientRect().height;

        if (row.dataset.open === 'false') {
          if (now <= 0) return;                     // already settled shut
          shrinkAll += now;
          if (row.getBoundingClientRect().top < here) shrinkAbove += now;
        } else {
          var inner = body.firstElementChild;
          var full = inner ? inner.scrollHeight : 0;
          if (full > now) growAll += full - now;    // still opening
        }
      });

      return { above: shrinkAbove, doc: growAll - shrinkAll };
    }

    function target() {
      var p = pending();
      var top = entry.getBoundingClientRect().top + window.scrollY
        - p.above - navClearance() - ROW_GAP;
      var max = document.documentElement.scrollHeight + p.doc - window.innerHeight;
      return Math.max(0, Math.min(top, max));
    }

    // Anything the reader does outright wins over this.
    var cancelled = false;
    function stop() { cancelled = true; }
    var EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
    EVENTS.forEach(function (e) { window.addEventListener(e, stop, { passive: true, once: true }); });

    function release() {
      EVENTS.forEach(function (e) { window.removeEventListener(e, stop); });
    }

    /* Reduced motion takes the same loop with the easing removed rather than
       a one-shot scrollTo. It still needs more than one pass: the bar has
       not condensed at the instant of the jump, so a single measurement is
       8px out with no frames left to notice. Landing on the target and then
       re-measuring reads as one movement, because there is no easing to see
       and the panel it is chasing opened instantly too. */
    /* The travel is timed, not proportional. Closing a fixed fraction of the
       remaining distance each frame sounds even, but it means a long trip
       spends its last third crawling the final few pixels after the eye has
       been tracking something fast, which is what makes jumping from the
       first row to the tenth feel so much slower than moving one row down.

       A duration that grows with the distance but is capped keeps the whole
       index within a few hundred milliseconds of a single row. */
    var from = window.scrollY;
    var span = Math.abs(target() - from);
    var trip = prefersReduced() ? 0
      : Math.max(TRIP_MIN, Math.min(TRIP_MAX, TRIP_MIN + span * TRIP_PER_PX));

    /* Ease in as well as out. On a long trip a hard start reads as a yank,
       and the same curve has to serve a trip of 300px and one of 6000. */
    function ease(p) {
      return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    }

    var STILL = 5;       // frames the target must hold before we let go
    var lastTarget = null;
    var held = 0;
    var started = null;

    requestAnimationFrame(function step(now) {
      if (cancelled) { release(); return; }
      if (started === null) started = now;

      var to = target();
      held = (lastTarget !== null && Math.abs(to - lastTarget) < 0.5) ? held + 1 : 0;
      lastTarget = to;

      var p = trip ? Math.min((now - started) / trip, 1) : 1;
      // Re-read every frame, so a layout still settling underneath is
      // followed rather than scrolled past. Once p is 1 this is the target.
      window.scrollTo(0, from + (to - from) * ease(p));

      if (p >= 1 && held >= STILL) { window.scrollTo(0, to); release(); return; }
      if (now - started > trip + 1400) { release(); return; }   // never spin forever
      requestAnimationFrame(step);
    });
  }

  function close(id) {
    var entry = entryFor(id);
    if (!entry) return;
    entry.dataset.open = 'false';
    entry.querySelector('.entry-btn').setAttribute('aria-expanded', 'false');
  }

  function prefersReduced() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---------- Panel-local behaviour ---------- */

  /* ----------------------------------------------------------
     Label outlines are drawn at their real size

     The outline is an SVG rectangle laid over the label. Stretching one
     square viewBox to a label three times wider than it is tall would take
     the corner radius with it, turning a 4px round into a long shallow
     ellipse on one axis and almost nothing on the other. So the viewBox is
     set to the box the label actually occupies, which makes one user unit
     one pixel and the radius exactly the radius.

     Without this the markup still draws a dashed outline, just with a
     corner that leans. It is decoration either way.
     ---------------------------------------------------------- */

  var CHIP_RADIUS = 4;   // px, the --r-sm step

  function fitChipEdges(scope) {
    var edges = [].slice.call(scope.querySelectorAll('.chip-edge'));
    if (!edges.length) return;

    function fit() {
      edges.forEach(function (svg) {
        var box = svg.getBoundingClientRect();
        if (!box.width || !box.height) return;
        var rect = svg.querySelector('rect');
        if (!rect) return;
        svg.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
        // Inset by half the stroke so the whole hairline sits inside the
        // label rather than straddling its edge.
        rect.setAttribute('x', 0.5);
        rect.setAttribute('y', 0.5);
        rect.setAttribute('width', Math.max(0, box.width - 1));
        rect.setAttribute('height', Math.max(0, box.height - 1));
        rect.setAttribute('rx', CHIP_RADIUS);
      });
    }

    fit();
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(fit);
      edges.forEach(function (svg) { ro.observe(svg); });
    }
  }

  function initPanel(scope) {
    initAckDemo(scope);
    fitChipEdges(scope);
    if (window.twemoji) {
      try { window.twemoji.parse(scope, { folder: 'svg', ext: '.svg' }); } catch (e) { /* optional */ }
    }
  }

  /* ==========================================================
     Terminal transcripts play themselves out

     A line at a time, not a character at a time: an installer prints whole
     lines, and character-by-character on eight lines of mono reads as a
     typewriter rather than as a program running.

     Each line is split into beats at its green result. The prompt lands
     first and the result answers it a beat later, which is the rhythm the
     real command has.

     Nothing is added or removed from the flow: the beats are wrapped and
     hidden with visibility, so every line break and every character of
     width is reserved from the first frame and the box never reflows while
     it plays.
     ========================================================== */

  var LINE_MS = 600;   // one line lands, then the next
  var ECHO_MS = 360;   // and its result answers, sooner

  function typeTerminals(scope) {
    scope.querySelectorAll('.terminal-body').forEach(function (body) {
      // Re-opening replays it, so start from the authored markup every time.
      if (body._orig === undefined) body._orig = body.innerHTML;
      else body.innerHTML = body._orig;
      body.classList.remove('typed');

      // A later open cancels whatever the previous one was still playing.
      var run = (body._run || 0) + 1;
      body._run = run;

      // Split on the line breaks, which stay exactly where they were.
      var lines = [[]];
      [].slice.call(body.childNodes).forEach(function (n) {
        if (n.nodeName === 'BR') lines.push([]);
        else lines[lines.length - 1].push(n);
      });

      var schedule = [];   // the beat elements, in play order
      var times = [];      // and when each one lands
      var at = 0;

      lines.forEach(function (nodes) {
        if (!nodes.length) { at += LINE_MS; return; }   // a blank line still waits

        var okAt = -1;
        nodes.forEach(function (n, i) {
          if (okAt < 0 && n.nodeType === 1 && n.classList.contains('ok')) okAt = i;
        });
        var groups = okAt > 0 ? [nodes.slice(0, okAt), nodes.slice(okAt)] : [nodes];

        groups.forEach(function (group, gi) {
          var beat = document.createElement('span');
          beat.className = 'term-beat';
          group[0].parentNode.insertBefore(beat, group[0]);
          group.forEach(function (n) { beat.appendChild(n); });

          schedule.push(beat);
          times.push(at);
          // The last beat of a line waits out the line gap; a result
          // answers its own prompt sooner than that.
          at += (gi === groups.length - 1) ? LINE_MS : ECHO_MS;
        });
      });

      if (!schedule.length) { body.classList.add('typed'); return; }

      if (prefersReduced()) {
        schedule.forEach(function (b) { b.classList.add('on'); });
        body.classList.add('typed');
        return;
      }

      var caret = document.createElement('span');
      caret.className = 'term-caret';
      schedule[0].parentNode.insertBefore(caret, schedule[0]);

      var shown = 0;
      var startedAt = null;

      requestAnimationFrame(function step(now) {
        if (body._run !== run) return;
        if (startedAt === null) startedAt = now;
        var elapsed = now - startedAt;

        while (shown < schedule.length && elapsed >= times[shown]) {
          var beat = schedule[shown];
          beat.classList.add('on');
          beat.parentNode.insertBefore(caret, beat.nextSibling);
          shown++;
        }

        if (shown < schedule.length) requestAnimationFrame(step);
        else { body.appendChild(caret); body.classList.add('typed'); }
      });
    });
  }

  var ACK_PASS = ['yes', '승인', 'authorize', 'approve', 'proceed', 'confirmed'];
  var ACK_AMBIGUOUS = ['뽑아봐', 'try it', 'my mistake', '해봐'];

  function initAckDemo(scope) {
    var buttons = scope.querySelectorAll('.ack-btn');
    var output = scope.querySelector('.ack-output');
    if (!buttons.length || !output) return;

    output.textContent = t('ackDefault');

    /* Replacing innerHTML lands the new verdict in a single frame, which
       reads as a flicker rather than an answer. This takes the old one down
       first, swaps while nothing is showing, and brings the new one up. A
       second click during the handover retargets it instead of stacking a
       second timer on top. */
    var ACK_OUT = 200;
    var swapTimer = null;

    function show(html, isText) {
      function put() {
        if (isText) output.textContent = html;
        else output.innerHTML = html;
      }
      if (prefersReduced()) { put(); return; }

      clearTimeout(swapTimer);
      output.classList.add('swapping');
      swapTimer = setTimeout(function () {
        put();
        output.classList.remove('swapping');
        swapTimer = null;
      }, ACK_OUT);
    }

    buttons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');

        var kw = btn.dataset.kw || btn.textContent.trim();
        if (ACK_PASS.indexOf(kw) > -1) {
          show(t('ackPass').replace(/\{kw\}/g, kw));
        } else if (ACK_AMBIGUOUS.indexOf(kw) > -1) {
          show(t('ackDeny').replace(/\{kw\}/g, kw));
        } else {
          show(t('ackDefault'), true);
        }
      });
    });
  }

  /* ==========================================================
     Scroll reveal — sections resolve in reading order
     ========================================================== */

  var revealObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      obs.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.reveal').forEach(function (el, i) {
    /* An element that set its own delay in the markup keeps it. */
    if (!el.style.getPropertyValue('--reveal-delay')) {
      el.style.setProperty('--reveal-delay', (i % 4) * 60 + 'ms');
    }
    /* Without an observer there is nothing to add .in, and the stylesheet
       no longer keeps reveals opaque as a blanket fallback, so this is
       where that safety net belongs: detected properly rather than left to
       a class that outlives its usefulness. */
    if ('IntersectionObserver' in window) revealObserver.observe(el);
    else el.classList.add('in');
  });

  /* ==========================================================
     Fact strip — columns arrive left to right, numbers count up
     ========================================================== */

  (function initFacts() {
    var strip = document.querySelector('[data-facts]');
    if (!strip) return;

    strip.querySelectorAll('.fact').forEach(function (col, i) {
      col.style.setProperty('--fact-delay', i * 110 + 'ms');
    });

    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);
        e.target.classList.add('in');
        e.target.querySelectorAll('[data-count-to]').forEach(function (el, i) {
          countUp(el, i * 110 + 240);
        });
      });
    }, { threshold: 0.35 }).observe(strip);
  })();

  function countUp(el, delayMs) {
    var target = parseInt(el.getAttribute('data-count-to'), 10);
    if (!Number.isFinite(target)) return;
    var suffix = el.getAttribute('data-count-suffix') || '';
    var suffixHtml = suffix ? '<span class="suffix">' + suffix + '</span>' : '';

    // The final value is already in the markup, so a visitor who never
    // sees the animation still reads the real number.
    if (prefersReduced()) return;

    var DURATION = 1100;
    el.innerHTML = '0' + suffixHtml;

    setTimeout(function () {
      var start = null;
      requestAnimationFrame(function step(now) {
        if (start === null) start = now;
        var p = Math.min((now - start) / DURATION, 1);
        // Decelerating, so the number settles instead of stopping dead.
        var eased = 1 - Math.pow(1 - p, 3);
        el.innerHTML = Math.round(target * eased) + suffixHtml;
        if (p < 1) requestAnimationFrame(step);
      });
    }, delayMs);
  }

  /* ==========================================================
     CTA dot field follows the pointer
     ========================================================== */

  (function initCtaDots() {
    var host = document.querySelector('[data-cta-dots]');
    if (!host) return;

    var band = host.parentElement;
    // Nothing to follow without a real pointer, and a patch chasing the
    // cursor is exactly what reduced motion is asking us not to do.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (prefersReduced()) return;

    var x = 0, y = 0, queued = false;

    band.addEventListener('pointermove', function (e) {
      var r = band.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      // One style write per frame; the properties it sets feed transforms
      // only, so the browser composites rather than repaints.
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        host.style.setProperty('--dx', x + 'px');
        host.style.setProperty('--dy', y + 'px');
      });
    });

    band.addEventListener('pointerenter', function () { host.classList.add('lit'); });
    band.addEventListener('pointerleave', function () { host.classList.remove('lit'); });
  })();

  /* ==========================================================
     Why section — rows arrive in left/right pairs, top down
     ========================================================== */

  (function initShift() {
    var grid = document.querySelector('[data-shift]');
    if (!grid) return;

    var cols = grid.querySelectorAll('.shift-col');
    cols.forEach(function (col, colIndex) {
      col.querySelectorAll('.shift-list li').forEach(function (row, rowIndex) {
        // Pair index drives the cadence; the right column trails its
        // partner by 90ms so problem and answer read as one beat.
        row.style.setProperty('--row-delay', rowIndex * 150 + colIndex * 90 + 'ms');
      });
    });

    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);
        e.target.classList.add('in');
      });
    }, { threshold: 0.2 }).observe(grid);
  })();

  /* ==========================================================
     Impact — the card stack

     Ported from the React Bits CardSwap component. Nothing was installed:
     this project has no build step and no npm, so the swap timeline and
     the 3D slot maths were rewritten against the Web Animations API and
     GSAP's easing is evaluated from its own formula below.

     The timeline is the original's. The front card drops, the rest are
     promoted forward one slot on a stagger, and a beat later the dropped
     card is sent to the back of the stack, which is why it reads as one
     object moving through a queue rather than four things fading.

     The arrangement is the original's too: copy on the left, the deck
     anchored to the bottom right corner and hanging outside it. The one
     addition is a brake. A stack that turns itself every five seconds
     with prose on it is unreadable to anyone who reads slowly, so it
     pauses on hover and on focus, holds still under reduced motion, and
     does not run at all while it is off screen.
     ========================================================== */

  /* The component ships two easing configs. The elastic one overshoots and
     settles by design, and at this size that reads as a stutter rather
     than as spring, so this takes its other preset: power1.inOut with the
     shorter durations and earlier promote that go with it. */
  var CS = {
    /* cardDistance / verticalDistance, as fractions of the rendered card
       rather than in pixels. The card is sized against the viewport, so a
       fixed 62px step is a different-looking fan at every window width:
       generous at 1400, crowded at 1000. Measured and rebuilt on resize. */
    distX: 0.053,              // of the card's width
    distY: 0.115,              // of the card's HEIGHT, not its width: the card
                               // is far wider than it is tall on a phone, and a
                               // step taken from the width threw the fan up over
                               // the copy there
    skew: 4,                   // skewAmount, eased back from the original 6
    drop: 1.12,                // the original's y: '+=500', as a fraction of card height
    /* Stretched from the preset's 800. At 800 the whole swap was over in
       about 1.5s of a 2.5s turn, so the deck spent nearly a second dead
       still between moves and read as stopping rather than resting. At
       1100 the motion runs almost to the next turn. */
    durDrop: 1100,
    durMove: 1100,
    durReturn: 1100,
    promoteOverlap: 0.45,
    returnDelay: 0.2,
    stagger: 150,
    every: 2500,               // delay
    /* A beat before the first swap. Firing it the instant the deck is seen
       meant the front card was already leaving before the reader's eye had
       landed on it, which reads as a glitch on every refresh; waiting a
       whole turn instead reads as broken. This is long enough to take the
       deck in, short enough that it is clearly alive. */
    lead: 1100
  };

  /* Twelve capabilities through four cards. The titles and the summaries
     are the ones the capability accordion already uses, so this deck
     cannot drift out of step with the section it advertises. */
  var CS_ICONS = [
    'ph-plugs', 'ph-users-three', 'ph-file-text', 'ph-list-checks',
    'ph-git-diff', 'ph-stethoscope', 'ph-puzzle-piece', 'ph-arrows-clockwise',
    'ph-buildings', 'ph-globe-hemisphere-west', 'ph-squares-four', 'ph-code-block'
  ];

  /* GSAP's power1.inOut, which is quadratic in and out. Evaluating it here
     rather than shipping a library is why this section has no dependency. */
  function csPower1(t) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
  }

  /* Baked into a CSS linear() so the browser runs the curve itself. A
     segment can start partway along and still be normalised to its own
     endpoint, which is how the clipped drop below stays faithful. */
  function csEase(from, to, steps) {
    var end = csPower1(to);
    var pts = [];
    for (var i = 0; i <= steps; i++) {
      pts.push((csPower1(from + (to - from) * (i / steps)) / end).toFixed(4));
    }
    return 'linear(' + pts.join(',') + ')';
  }

  var CS_SUPPORTS_LINEAR = window.CSS && CSS.supports &&
    CSS.supports('transition-timing-function', 'linear(0, 1)');
  var CS_FALLBACK = 'cubic-bezier(0.45, 0, 0.55, 1)';   // the same curve, near enough

  var csPromoteAt = CS.durDrop * (1 - CS.promoteOverlap);            // 440ms
  var csReturnAt  = csPromoteAt + CS.durMove * CS.returnDelay;       // 600ms
  var csDropFrac  = csReturnAt / CS.durDrop;                         // 0.75
  var csFrontDur  = csReturnAt + CS.durReturn;                       // 1400ms

  var CS_EASE      = CS_SUPPORTS_LINEAR ? csEase(0, 1, 64) : CS_FALLBACK;
  var CS_EASE_DROP = CS_SUPPORTS_LINEAR ? csEase(0, csDropFrac, 48) : CS_FALLBACK;

  var csRefresh = null;   // set once the deck exists, so a language switch reaches it

  (function initCardSwap() {
    var deck = document.querySelector('[data-cs-deck]');
    if (!deck) return;

    var cards = [].slice.call(deck.querySelectorAll('[data-cs-card]'));
    var n = cards.length;
    if (n < 2) return;

    /* 02 through 12. The first entry is the installer, which is the one
       thing on the list that is not a capability so much as a prerequisite,
       and it opened the deck on the least interesting card it had. */
    var FIRST = 1;
    var total = S.titles.length - FIRST;
    var shows = cards.map(function (_, i) { return FIRST + (i % total); });
    var next = FIRST + (n % total);

    function fill(el, k) {
      var id = String(k + 1).padStart(2, '0');
      el.querySelector('.cs-bar i').className = 'ph ' + CS_ICONS[k % CS_ICONS.length];
      el.querySelector('.cs-bar b').textContent = id;
      el.querySelector('.cs-bar span').textContent = S.titles[k];
      el.querySelector('.cs-term').innerHTML = S.terminals[k];
    }

    csRefresh = function () {
      cards.forEach(function (el, i) { fill(el, shows[i]); });
    };

    /* The steps are read off the card as it actually rendered, so the fan
       keeps its shape at any window width. */
    var geo = { dx: 62, dy: 62, drop: 560 };
    function measure() {
      var box = deck.getBoundingClientRect();
      var w = box.width || 1180;
      var h = box.height || 500;
      geo.dx = w * CS.distX;
      geo.dy = h * CS.distY;
      geo.drop = h * CS.drop;
    }

    /* The original's slots: each card back in the stack steps right, up,
       and further away, so the title bars fan out and stay legible. */
    function slot(i) {
      return { x: i * geo.dx, y: -i * geo.dy, z: -i * geo.dx * 1.5 };
    }
    function tr(s, dy) {
      return 'translate(calc(-50% + ' + s.x + 'px), calc(-50% + ' + (s.y + (dy || 0)) + 'px))' +
             ' translateZ(' + s.z + 'px) skewY(' + CS.skew + 'deg)';
    }

    var order = cards.map(function (_, i) { return i; });
    var at = [];
    var live = cards.map(function () { return null; });
    var timer = null;

    /* No z-index anywhere. The deck is a preserve-3d context, so the
       browser sorts the cards by their own depth and keeps sorting as that
       depth animates. Flipping z-index on a timer instead meant four
       stacking-context changes per swap, each repainting the whole deck,
       and that was the hitch. */
    function place() {
      order.forEach(function (idx, i) {
        if (live[idx]) { try { live[idx].cancel(); } catch (e) { /* already gone */ } }
        live[idx] = null;
        cards[idx].style.transform = at[idx] = tr(slot(i));
      });
    }

    /* fill: 'both', not 'backwards'. With backwards the animation stops
       applying the instant it ends and the element falls back to its
       inline style; the two are the same transform written two ways, and
       the browser resolving them differently by a fraction of a pixel is
       the single frame that jumps right at the end of the slide. Holding
       the final value means there is no handover at all. The previous
       animation on that card is cancelled first, so held values cannot
       pile up. */
    /* The final transform is written first, every time. Everything below
       is the movement between two states the element would have reached
       anyway, so a browser without the Web Animations API lands on the
       right layout with no motion rather than throwing here and taking
       the rest of the page's initialisation down with it. */
    var CAN_ANIMATE = typeof Element !== 'undefined' && !!Element.prototype.animate;

    function run(idx, el, frames, dur, delay) {
      el.style.transform = frames[frames.length - 1].transform;
      if (prefersReduced() || !CAN_ANIMATE) return;
      if (live[idx]) { try { live[idx].cancel(); } catch (e) { /* already gone */ } }
      live[idx] = el.animate(frames, { duration: dur, delay: delay, easing: 'linear', fill: 'both' });
    }

    function swap() {
      var front = order[0];
      var rest = order.slice(1);
      var elF = cards[front];
      var back = tr(slot(n - 1));

      /* One animation for the front card, not two meeting mid-flight. The
         original retargets the drop partway through; here that handover is
         a keyframe at the same instant, with the drop's endpoint read off
         the same curve, so there is no frame where two animations both
         claim the element. */
      run(front, elF, [
        { transform: at[front], easing: CS_EASE_DROP, offset: 0 },
        { transform: tr(slot(0), geo.drop * csPower1(csDropFrac)), easing: CS_EASE, offset: csReturnAt / csFrontDur },
        { transform: back, offset: 1 }
      ], csFrontDur, 0);
      at[front] = back;

      rest.forEach(function (idx, i) {
        var to = tr(slot(i));
        run(idx, cards[idx], [{ transform: at[idx], easing: CS_EASE }, { transform: to }],
          CS.durMove, csPromoteAt + i * CS.stagger);
        at[idx] = to;
      });

      /* Refilled at the bottom of its drop, where the section has clipped
         it, so the next capability is already on the card before it climbs
         back into the stack. */
      setTimeout(function () {
        shows[front] = next;
        next = FIRST + ((next - FIRST + 1) % total);
        fill(elF, shows[front]);
      }, prefersReduced() ? 0 : csReturnAt);

      order = rest.concat(front);
    }

    /* The first swap runs the moment the deck is seen, as the original
       does, rather than after a full interval of nothing. Waiting 2.5s
       before anything moves reads as a deck that is broken, not resting.
       Only the first time: coming back from a hover must not jump. */
    var kicked = false;
    var lead = null;

    function start() {
      if (timer || lead || prefersReduced()) return;
      if (kicked) { timer = setInterval(swap, CS.every); return; }
      kicked = true;
      lead = setTimeout(function () {
        lead = null;
        swap();
        timer = setInterval(swap, CS.every);
      }, CS.lead);
    }

    function stop() {
      clearInterval(timer);
      timer = null;
      /* Interrupted during the lead-in, the deck has not moved yet, so the
         beat is owed again rather than skipped. */
      if (lead) { clearTimeout(lead); lead = null; kicked = false; }
    }

    /* There is deliberately no hover brake. The deck is wider than the
       window and hangs off the bottom, so its box covers most of the band:
       a reader whose cursor simply happened to be resting there, without
       moving at all, stopped it dead and nothing on screen explained why.
       pointerleave never fired either, because the pointer never left. The
       deck is set pointer-events: none in the stylesheet so it cannot
       swallow a hover, a click, or a text selection over half a section it
       has nothing interactive in.

       Reduced motion still stops it outright, and it does not run off
       screen. If a visible pause control is wanted, that is the honest
       place to put one, not an invisible trap the size of a section. */

    csRefresh();
    measure();
    place();

    /* Placed first, shown second, and two frames apart. The cards start
       life piled exactly on top of one another, and the deck is held
       transparent until it is a deck. One frame commits the placement,
       the next paints it while still invisible; only then is it faded up.
       Adding the class before placing left a window in which that pile
       could be painted and then resolve, which is the jump on refresh. */
    var host = deck.closest('.cswap');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { host.classList.add('ready'); });
    });

    /* The fan is measured off the rendered card, so a resize has to redo
       both. Snapping straight to the new slots rather than animating is
       correct: a window being dragged is not a transition. */
    if (window.ResizeObserver) {
      var settle = null;
      new ResizeObserver(function () {
        clearTimeout(settle);
        settle = setTimeout(function () {
          var dx = geo.dx;
          measure();
          /* place() cancels whatever is in flight, so it must not run for
             a resize that changed nothing. A scrollbar appearing used to
             be enough to abort a swap halfway and leave the deck sitting
             there. */
          if (Math.abs(geo.dx - dx) > 0.5) place();
        }, 160);
      }).observe(deck);
    }

    /* threshold 0, not 0.25. The deck is taller than the band that holds
       it and hangs out of the bottom, so its own box is only ever partly
       on screen; at a quarter it switched itself off while the section was
       still perfectly readable, which is the deck stopping for no reason
       anyone could see. Any part visible is enough to keep it running. */
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        /* Fully off screen it holds still: an interval running behind the
           fold is work nobody asked for. */
        if (e.isIntersecting) start();
        else stop();
      });
    }, { threshold: 0 }).observe(deck);
  })();

  /* ==========================================================
     Go
     ========================================================== */

  document.body.classList.remove('no-js');
  applyLang();
  settleLangThumb();
  typeCommand();   // once on load; the command is the same in every language
})();
