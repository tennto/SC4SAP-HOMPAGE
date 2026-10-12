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

  /* Each language has its own URL: Korean at the root, the others under
     /en/ and /ja/ (built by tools/build-i18n.mjs). The URL decides the
     language on load; a saved choice has already been honoured by the
     redirect in the page head. Switching swaps the copy in place and
     moves the address along with it. */

  // The site root, wherever the page is served from: app.js is js/app.js.
  var SITE_ROOT = new URL('..', document.currentScript.src);
  var PAGE_FILE = /install\.html$/.test(location.pathname) ? 'install.html' : '';
  var META_KEY = PAGE_FILE ? 'insMetaTitle' : 'metaTitle';

  function langUrl(l) {
    return new URL((l === 'ko' ? '' : l + '/') + PAGE_FILE, SITE_ROOT).href + location.search + location.hash;
  }

  var pageLang = root.getAttribute('lang');
  var lang = SUPPORTED.indexOf(pageLang) > -1 ? pageLang : 'ko';
  function t(key) { return (S[lang] && S[lang][key]) || (S.ko[key] || key); }

  function applyLang() {
    root.setAttribute('lang', lang);
    if (S.ko[META_KEY]) document.title = t(META_KEY);

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
      try { history.replaceState(history.state, '', langUrl(lang)); } catch (e) { /* file:// */ }
      dismissHint();

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

  /* ---------- Offer the reader's own language, once ----------
     Only on the Korean pages, only to a browser that does not ask for
     Korean, and only until the reader has chosen a language or closed
     the offer. Written in the language it offers, since the reader may
     not read Korean. */

  var HINT_KEY = 'sc4sap-lang-hint';
  var HINT_DELAY = 1600;   // after the hero has finished arriving
  var hintEl = null;

  function dismissHint(remember) {
    if (remember) store(HINT_KEY, 'closed');
    if (!hintEl) return;
    var el = hintEl;
    hintEl = null;
    el.classList.remove('is-in');
    setTimeout(function () { el.remove(); }, prefersReduced() ? 0 : 700);
  }

  (function offerLang() {
    if (lang !== 'ko' || read(LANG_KEY) || read(HINT_KEY)) return;
    var asked = ((navigator.languages && navigator.languages[0]) || navigator.language || 'ko').toLowerCase();
    if (asked.indexOf('ko') === 0) return;
    var to = asked.indexOf('ja') === 0 ? 'ja' : 'en';
    var T = S[to];

    var el = document.createElement('div');
    el.className = 'lang-hint';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', T.ariaLang);
    el.lang = to;
    el.innerHTML =
      '<p class="lang-hint-text"><i class="ph ph-translate" aria-hidden="true"></i></p>' +
      '<a class="btn btn-primary lang-hint-go"></a>' +
      '<button type="button" class="icon-btn lang-hint-x"><i class="ph ph-x" aria-hidden="true"></i></button>';
    el.querySelector('.lang-hint-text').appendChild(document.createTextNode(T.hintText));
    var go = el.querySelector('.lang-hint-go');
    go.textContent = T.hintGo;
    go.href = langUrl(to);
    go.addEventListener('click', function () { store(LANG_KEY, to); });
    var x = el.querySelector('.lang-hint-x');
    x.setAttribute('aria-label', T.hintClose);
    x.addEventListener('click', function () { dismissHint(true); });

    setTimeout(function () {
      if (lang !== 'ko' || read(LANG_KEY)) return;   // chose a language meanwhile
      document.body.appendChild(el);
      hintEl = el;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { el.classList.add('is-in'); });
      });
    }, HINT_DELAY);
  })();

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
      var block = btn.closest('.cmd-block');
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
    // The globe's frame loop ends itself when its row is closed, rather
    // than turning a canvas over inside a collapsed panel, so re-opening
    // has to hand it back.
    inner.querySelectorAll('[data-globe]').forEach(function (g) {
      if (g._globeStart) g._globeStart();
    });

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

        /* Round the box before drawing into it, and this is not tidiness.

           getBoundingClientRect returns fractions — 161.797 tall is
           ordinary. Fed to the viewBox raw, the top edge of the rectangle
           lands at one subpixel offset and the bottom edge lands at a
           different one, so the rasteriser draws one of them across a
           single row of pixels and smears the other across two. The result
           is an outline whose bottom looks thinner and paler than its top,
           at the same stroke width and the same colour.

           An integer height cannot do that: both edges end up at the same
           subpixel phase, so both are drawn the same way, crisp or soft
           together. Same argument for width, left and right. The cost is
           under a pixel of stretch across the whole box, which
           non-scaling-stroke keeps off the hairline anyway. */
        var boxW = Math.round(box.width);
        var boxH = Math.round(box.height);

        svg.setAttribute('viewBox', '0 0 ' + boxW + ' ' + boxH);
        // Inset by half the stroke so the whole hairline sits inside the
        // label rather than straddling its edge.
        rect.setAttribute('x', 0.5);
        rect.setAttribute('y', 0.5);
        rect.setAttribute('width', Math.max(0, boxW - 1));
        rect.setAttribute('height', Math.max(0, boxH - 1));
        // The industry squares round harder than the #06 labels do, and the
        // radius has to match the CSS one or the outline cuts its corners.
        var r = parseFloat(svg.dataset.edgeRadius) || CHIP_RADIUS;
        rect.setAttribute('rx', r);

        /* Two ways to run the dashes round an outline, and they answer
           different questions.

           Leaving pathLength at 100 makes the dash a SHARE of the
           perimeter, so the rhythm looks identical on labels of different
           widths — right for the #06 row and the #09 field, where a dozen
           outlines sit side by side and should match each other.

           The #08 gate has no such neighbours. What it has to match is the
           four curves feeding into it, which are drawn in real pixels, so
           its dash has to be a real length too. data-edge-period says so,
           in px. pathLength is then set to the nearest whole number of
           those periods rather than to the raw perimeter: within a
           fraction of a percent it is still 1 unit = 1 pixel, and the
           pattern closes exactly where it started instead of leaving one
           short dash at the corner it began on. */
        var period = parseFloat(svg.dataset.edgePeriod);
        if (period > 0) {
          var w = Math.max(0, boxW - 1);
          var h = Math.max(0, boxH - 1);
          var rr = Math.min(r, w / 2, h / 2);
          // Four straight runs, minus the corners, plus one whole circle.
          var perimeter = 2 * (w + h) - 8 * rr + 2 * Math.PI * rr;
          var laps = Math.max(1, Math.round(perimeter / period));
          rect.setAttribute('pathLength', laps * period);
        }
      });
    }

    fit();
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(fit);
      edges.forEach(function (svg) { ro.observe(svg); });
    }
  }

  /* ----------------------------------------------------------
     The four feeds into the reuse gate are drawn at real size

     These curves used to be authored in the markup against a 0-100 box
     stretched to fit with preserveAspectRatio="none". That put the ends
     in the right places, but it scaled x by roughly ten and y by less
     than one, so a dash came out long where the curve ran flat and short
     where it dived — and none of them matched the gate below, whose own
     outline was normalised to a perimeter six times longer. Asking for
     one dash size across the figure is asking for one coordinate system.

     So the viewBox is the band's real pixel box, which makes a user unit
     a pixel, and the curves are rebuilt from where the tiles actually
     are. Reading the tiles rather than computing their centres from the
     column count also means the gutter can be anything it likes.

     Each curve puts both control points at the same height: the first
     directly under its tile, the second directly over the gate. That is
     what makes it leave straight down and arrive straight down, which is
     the shape being asked for — everything else about the curve follows.
     ---------------------------------------------------------- */

  var FLOW_BEND = 0.58;   // where the curve flattens, as a share of the band

  function fitFlowBands(scope) {
    scope.querySelectorAll('.reuse-flow').forEach(function (fig) {
      var svg = fig.querySelector('.rx-flow');
      var lanes = fig.querySelector('.rx-lanes');
      if (!svg || !lanes) return;

      var paths = [].slice.call(svg.querySelectorAll('path'));
      if (!paths.length) return;

      function fit() {
        var band = svg.getBoundingClientRect();
        var tiles = [].slice.call(lanes.children);
        // Nothing to draw between: the band is hidden at narrow widths,
        // and the panel may not have been laid out yet.
        if (!band.width || !band.height || tiles.length !== paths.length) return;

        // Whole units, for the same reason the outlines round: a fractional
        // viewBox puts the two ends of a curve at different subpixel
        // offsets and the rasteriser weights them differently.
        var bandW = Math.round(band.width);
        var bandH = Math.round(band.height);

        svg.setAttribute('viewBox', '0 0 ' + bandW + ' ' + bandH);

        var endX = bandW / 2;
        var endY = bandH;
        var bend = bandH * FLOW_BEND;

        tiles.forEach(function (tile, i) {
          var box = tile.getBoundingClientRect();
          var x = box.left - band.left + box.width / 2;
          paths[i].setAttribute('d',
            'M ' + x + ' 0 ' +
            'C ' + x + ' ' + bend + ', ' + endX + ' ' + bend + ', ' + endX + ' ' + endY);
        });
      }

      fit();
      if (window.ResizeObserver) {
        var ro = new ResizeObserver(fit);
        ro.observe(svg);
        ro.observe(lanes);
      }
    });
  }

  /* ==========================================================
     The country globe (#10)

     Sixteen country references, drawn as a globe you can spin rather than
     as sixteen tiles. The tiles said "here is a list"; a globe says "this
     is the world, and these sixteen places on it are covered", which is
     the sentence the paragraph above it is already making.

     Nothing is fetched and nothing is imported. The land is a one-degree
     bitmask baked into globe.data.js, the projection is nine lines of
     trigonometry, and it draws on a 2D canvas — so it runs without WebGL,
     without a CDN, and on hardware that would fall back to a blank box
     under the library this was modelled on.

     How it is drawn, since none of it is obvious from the code alone:

       · points are laid out by the Fibonacci sphere, which is the cheapest
         way to get an even scatter over a sphere — no crowding at the
         poles the way a lat/long grid gives
       · each point is kept only if its cell in the mask is land, so the
         continents come out of the sampling rather than being drawn
       · every frame each point is spun about the vertical axis by the
         current heading, tilted, and dropped to 2D; the ones facing away
         are skipped rather than drawn dim, so there is no back face
         showing through
       · the surviving points are bucketed by depth and each bucket is
         filled in one path, which is six fills a frame instead of five
         thousand — the difference between this being free and this being
         the reason the page stutters
     ========================================================== */

  var GLOBE_POINTS = 15000;   // candidates before the land mask thins them
  var GLOBE_SPIN = 0.0007;    // radians a frame, left to itself: ~2.5 min a turn
  var GLOBE_TILT = -0.32;     // radians, so the north is turned toward us
  var GLOBE_DEPTH_STEPS = 6;  // depth buckets, and so fills per frame

  /* Weight.

     The globe used to take the pointer's movement straight into its
     heading, which made it weightless: a flick threw it half a turn and it
     arrived the same frame you moved. A world ought to take a moment to
     come round.

     So the pointer no longer moves the globe. It moves a TARGET, and the
     globe eases toward that target a fraction at a time, which is what
     puts the lag between your hand and the sphere. Two numbers set the
     feel and they do different jobs: DRAG is how far a pixel of pointer
     asks for, EASE is how quickly the globe agrees to it. Lower either to
     make it heavier. A constant target speed still settles at that same
     speed, so the idle spin is unaffected by the easing. */
  var GLOBE_DRAG = 0.0030;    // radians asked for per px of pointer — was 0.006
  var GLOBE_DRAG_Y = 0.0022;  // the tilt takes even less, it has less room
  var GLOBE_EASE = 0.11;      // share of the remaining gap closed per frame
  var GLOBE_GLIDE = 0.92;     // how a throw runs down after release

  /* Room a label needs to itself, measured as an ellipse rather than a
     circle because a pill is far wider than it is tall: two of them side
     by side need real distance, two stacked need very little. A circle big
     enough to stop the first case was throwing away labels that would have
     sat happily above one another — which is most of Europe. */
  var GLOBE_LABEL_GAP_X = 26;
  var GLOBE_LABEL_GAP_Y = 17;

  // How far a finger may slide and still count as a tap rather than a drag.
  var GLOBE_TAP_SLOP = 8;

  /* How far inside the silhouette a label gives up. Depth is the cosine of
     the angle from the viewer, so 0 is the rim exactly: a label there is
     half off the edge of the sphere and pointing at nothing you can see. */
  var GLOBE_LABEL_EDGE = 0.16;
  var GLOBE_LABEL_FADE = 0.16;

  /* Hysteresis, which is the whole answer to labels flickering.

     Deciding what to show from scratch every frame means the decision can
     change every frame, and near any threshold it does: two labels a
     hair apart in depth trade the near-side spot back and forth as the
     globe turns, and one sitting exactly a gap away from another blinks.
     What you see is labels swapping and vanishing for no reason you can
     point at.

     So a label that is already showing is judged more kindly than one that
     is not. It ranks as if it were slightly nearer than it is, and it
     needs less clearance to keep its place than a newcomer needs to take
     it. Both margins are one-way, so a decision has to be beaten properly
     before it flips — never merely tied. */
  var GLOBE_LABEL_HOLD = 0.07;   // depth head start for a label already up
  var GLOBE_LABEL_KEEP = 0.74;   // share of the gap it needs to stay up

  var landBits = null;
  function landAt(lat, lon) {
    var L = window.SC4_LAND;
    if (!L) return true;                    // no mask: draw the whole sphere
    if (!landBits) {
      var raw = atob(L.bits);
      landBits = new Uint8Array(raw.length);
      for (var i = 0; i < raw.length; i++) landBits[i] = raw.charCodeAt(i);
    }
    var row = Math.floor(90 - lat);
    var col = Math.floor(lon + 180);
    if (row < 0) row = 0; else if (row >= L.rows) row = L.rows - 1;
    if (col < 0) col = 0; else if (col >= L.cols) col = L.cols - 1;
    var bit = row * L.cols + col;
    return !!(landBits[bit >> 3] & (128 >> (bit & 7)));
  }

  /* An even scatter over the sphere: walk the golden angle round the
     vertical while stepping evenly through the sine of the latitude. */
  function spherePoints(n) {
    var pts = [];
    var golden = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) {
      var y = 1 - (i / (n - 1)) * 2;
      var r = Math.sqrt(Math.max(0, 1 - y * y));
      var a = golden * i;
      var x = Math.cos(a) * r;
      var z = Math.sin(a) * r;
      var lat = Math.asin(y) * 180 / Math.PI;
      var lon = Math.atan2(z, x) * 180 / Math.PI;
      if (landAt(lat, lon)) pts.push(x, y, z);
    }
    return new Float32Array(pts);
  }

  function latLonToXYZ(lat, lon) {
    var p = lat * Math.PI / 180;
    var t = lon * Math.PI / 180;
    return [Math.cos(p) * Math.cos(t), Math.sin(p), Math.cos(p) * Math.sin(t)];
  }

  var globeGeometry = null;   // one scatter, shared by every globe on the page

  function initGlobes(scope) {
    scope.querySelectorAll('[data-globe]').forEach(function (root) {
      if (root.dataset.globeReady) return;
      root.dataset.globeReady = '1';

      var canvas = root.querySelector('[data-globe-canvas]');
      var list = root.querySelector('[data-globe-places]');
      if (!canvas || !list) return;

      var ctx = canvas.getContext && canvas.getContext('2d');
      if (!ctx) return;                     // no 2D context: the list stays

      if (!globeGeometry) globeGeometry = spherePoints(GLOBE_POINTS);
      var pts = globeGeometry;

      var places = [].slice.call(list.children).map(function (li) {
        var v = latLonToXYZ(parseFloat(li.dataset.lat), parseFloat(li.dataset.lon));
        // `on` is last frame's answer, which is what the hysteresis reads.
        return { el: li, x: v[0], y: v[1], z: v[2], sx: 0, sy: 0, depth: -1, on: false };
      });

      /* The palette is read from the stylesheet rather than written here,
         so the globe follows the theme toggle instead of holding its own
         copy of two colours that would then have to be kept in step. */
      var ink = '#676C74', accent = '#2F3540';
      function readTheme() {
        var cs = getComputedStyle(root);
        ink = (cs.getPropertyValue('--globe-dot') || '').trim() || ink;
        accent = (cs.getPropertyValue('--globe-mark') || '').trim() || accent;
      }
      readTheme();
      new MutationObserver(readTheme).observe(document.documentElement,
        { attributes: true, attributeFilter: ['data-theme'] });

      // What is drawn, and what it is heading toward. The gap between the
      // two pairs is the weight.
      var heading = 0, tilt = GLOBE_TILT;
      var wantHeading = 0, wantTilt = GLOBE_TILT;
      var glide = 0;
      var dragging = false, lastX = 0, lastY = 0;
      var openLabel = null;
      var W = 0, H = 0, R = 0, cx = 0, cy = 0, dpr = 1, dot = 1.6;

      /* Opening a label stops the world.

         The card is text to be read, and the pill it hangs off is pinned
         to a country: leave the globe turning and the thing you are
         reading slides out from under the pointer, which drops the card,
         which starts the globe again. That loop is the flicker.

         So the same act that opens a card holds the drift, and letting go
         hands it back. It is the target that is held rather than the
         globe frozen mid-frame, so it settles to a stop over the easing
         instead of stopping dead, and picks the drift back up from wherever
         it came to rest.

         data-open rather than :hover, because the stylesheet and the
         rotation have to agree on which label is open and there can only
         be one answer. */
      function openLabelFor(m) {
        if (dragging || m.el.dataset.off) return;
        if (openLabel && openLabel !== m) delete openLabel.el.dataset.open;
        openLabel = m;
        m.el.dataset.open = '1';
      }
      function closeLabel() {
        if (!openLabel) return;
        delete openLabel.el.dataset.open;
        openLabel = null;
      }

      /* A pointer that hovers opens on the way in and closes on the way
         out. A finger cannot hover, so it gets the other half of this
         further down: a tap opens, and a tap anywhere else closes.

         The two have to be kept apart. Touch also fires enter and leave —
         enter as the finger lands, leave as it lifts — so left unguarded a
         tap would open the card and shut it again in the same gesture, and
         nothing would ever stay open on a phone. */
      places.forEach(function (m) {
        m.el.addEventListener('pointerenter', function (e) {
          if (e.pointerType === 'touch') return;
          openLabelFor(m);
        });
        m.el.addEventListener('pointerleave', function (e) {
          if (e.pointerType === 'touch') return;
          if (openLabel === m) closeLabel();
        });
      });

      function measure() {
        var box = canvas.getBoundingClientRect();
        if (!box.width || !box.height) return false;
        dpr = Math.min(2, window.devicePixelRatio || 1);
        W = Math.round(box.width); H = Math.round(box.height);
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        R = Math.min(W, H) / 2 * 0.92;
        cx = W / 2; cy = H / 2;
        // The dot grows with the globe so the texture reads the same at
        // any size instead of turning to grit when the panel is wide.
        dot = Math.max(1, R / 150);
        return true;
      }

      function draw() {
        ctx.clearRect(0, 0, W, H);

        var cosH = Math.cos(heading), sinH = Math.sin(heading);
        var cosT = Math.cos(tilt), sinT = Math.sin(tilt);

        // Depth buckets: one path each, one fill each.
        var buckets = [];
        for (var b = 0; b < GLOBE_DEPTH_STEPS; b++) buckets.push([]);

        for (var i = 0; i < pts.length; i += 3) {
          var x = pts[i], y = pts[i + 1], z = pts[i + 2];
          var rx = x * cosH + z * sinH;          // spin about the vertical
          var rz = -x * sinH + z * cosH;
          var ry = y * cosT - rz * sinT;         // then tilt toward us
          var rzz = y * sinT + rz * cosT;
          if (rzz <= 0.02) continue;             // facing away
          var k = Math.min(GLOBE_DEPTH_STEPS - 1, (rzz * GLOBE_DEPTH_STEPS) | 0);
          buckets[k].push(cx + rx * R, cy - ry * R);
        }

        for (var d = 0; d < GLOBE_DEPTH_STEPS; d++) {
          var pt = buckets[d];
          if (!pt.length) continue;
          // Nearer dots read stronger, which is the only cue a flat
          // scatter has that it is wrapped round something.
          ctx.globalAlpha = 0.26 + 0.74 * ((d + 0.5) / GLOBE_DEPTH_STEPS);
          ctx.fillStyle = ink;
          ctx.beginPath();
          for (var p = 0; p < pt.length; p += 2) {
            ctx.rect(pt[p] - dot / 2, pt[p + 1] - dot / 2, dot, dot);
          }
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        /* Where the sixteen places are, so the labels can be put there.
           Nothing is painted for them: the label IS the marker, sitting on
           its own coordinates. A dot under a pill is the same point marked
           twice, and the one you cannot read is the one that goes. */
        places.forEach(function (m) {
          var rx = m.x * cosH + m.z * sinH;
          var rz = -m.x * sinH + m.z * cosH;
          var ry = m.y * cosT - rz * sinT;
          m.depth = m.y * sinT + rz * cosT;
          m.sx = cx + rx * R;
          m.sy = cy - ry * R;
        });

        placeLabels();
      }

      /* The labels are DOM, so they are text: translated with the rest of
         the panel, selectable, reachable by keyboard, and expanded on
         hover by the stylesheet rather than by a hit test against a
         canvas. All the script owes them is a position and a fade.

         Sixteen places do not fit sixteen labels. Seven of them are inside
         Europe, which at globe scale is a coin, so the nearest label to
         the viewer keeps its spot and any label that would land on top of
         one already placed stands down until the globe turns. Nearest
         wins, so what you see is always the front of the pile.

         Two things this got wrong the first time, both worth naming.

         A label being hidden used to return early, leaving its last
         position AND its last inline opacity behind. Inline styles beat
         the stylesheet, so the rule meant to hide it never applied and it
         hung at the rim like an afterimage. Everything is written every
         frame now, hidden or not: position so it fades back in where it
         belongs rather than jumping, opacity so there is exactly one thing
         deciding whether it can be seen.

         And it faded out at the silhouette, where a label is half off the
         edge of the sphere and pointing at nothing. It now goes while it
         is still on the face. */
      /* Grouping, which is the answer to the part of this that no amount
         of spacing could fix.

         Paris, Brussels and Amsterdam are five to thirteen pixels apart on
         a globe this size, and a label is twenty-six pixels wide. Hiding
         whichever lost meant three of the sixteen country references were
         never on screen at all, at any setting — measured over a full
         rotation, France, the Netherlands and the EU entry came out at
         flat zero. There is no arrangement of two-and-a-bit labels in
         five pixels, so they stop competing for the spot and share it: the
         nearest keeps its place, the ones it covers join it, and the pill
         says how many. Opening it lists every one of them.

         The group's pill is built here rather than authored, because which
         places fall together depends on where the globe is pointing. The
         sixteen list items are still the content — they stay in the
         document, and in the accessibility tree, whether or not their own
         pill has a place that frame. */
      var groupEls = [];

      function groupEl(i) {
        if (groupEls[i]) return groupEls[i];
        var el = document.createElement('li');
        el.dataset.group = '1';
        // Decoration: the sixteen real entries already say all of this.
        el.setAttribute('aria-hidden', 'true');
        el.innerHTML = '<b></b><span></span>';
        var g = { el: el, members: [], sx: 0, sy: 0, isGroup: true };
        el.addEventListener('pointerenter', function (e) {
          if (e.pointerType === 'touch') return;
          openLabelFor(g);
        });
        el.addEventListener('pointerleave', function (e) {
          if (e.pointerType === 'touch') return;
          if (openLabel === g) closeLabel();
        });
        list.appendChild(el);
        groupEls[i] = g;
        return g;
      }

      function fillGroup(g) {
        var b = g.el.firstChild, span = g.el.lastChild;
        var lead = g.members[0];
        b.textContent = lead.el.dataset.code + ' +' + (g.members.length - 1);
        span.textContent = '';
        g.members.forEach(function (m) {
          var row = document.createElement('div');
          var em = document.createElement('em');
          var i = document.createElement('i');
          em.textContent = m.el.querySelector('em').textContent;
          i.textContent = m.el.querySelector('i').textContent;
          row.appendChild(em);
          row.appendChild(i);
          span.appendChild(row);
        });
      }

      function placeLabels() {
        var shown = [];
        var groups = [];

        // Ranked nearest first, with a head start to whatever is already
        // up, and the label being read ahead of everything.
        var order = places.slice().sort(function (a, b) {
          return rank(b) - rank(a);
        });
        function rank(m) {
          if (openLabel === m) return 9;
          return m.depth + (m.on ? GLOBE_LABEL_HOLD : 0);
        }

        order.forEach(function (m) {
          var el = m.el;

          // Follows the globe whether or not it can be seen.
          el.style.left = (m.sx / W * 100) + '%';
          el.style.top = (m.sy / H * 100) + '%';

          // A card being read is never taken away mid-sentence.
          var held = openLabel === m;
          var slack = m.on ? GLOBE_LABEL_KEEP : 1;
          var edge = GLOBE_LABEL_EDGE * (m.on ? GLOBE_LABEL_KEEP : 1);

          if (!held && m.depth <= edge) { m.on = false; hide(m); return; }

          var covering = null;
          if (!held) {
            var gx = GLOBE_LABEL_GAP_X * slack, gy = GLOBE_LABEL_GAP_Y * slack;
            for (var i = 0; i < shown.length; i++) {
              var dx = (shown[i].sx - m.sx) / gx, dy = (shown[i].sy - m.sy) / gy;
              if (dx * dx + dy * dy < 1) { covering = shown[i]; break; }
            }
          }

          if (covering) {
            // Not dropped: folded into whoever is standing here.
            (covering.with || (covering.with = [covering])).push(m);
            m.on = false;
            hide(m);
            return;
          }

          m.on = true;
          m.with = null;
          shown.push(m);
          show(m, el);
        });

        // Anywhere two or more fell together, the pill becomes the group's.
        shown.forEach(function (m) {
          if (!m.with) return;
          var g = groupEl(groups.length);
          groups.push(g);
          g.members = m.with;
          g.sx = m.sx; g.sy = m.sy; g.depth = m.depth;
          fillGroup(g);
          hide(m);
          show(g, g.el);
        });

        // Whatever the pool is not using this frame.
        for (var k = groups.length; k < groupEls.length; k++) {
          if (openLabel === groupEls[k]) closeLabel();
          hide(groupEls[k]);
        }

        /* hide and show move the DOM only. Whether a place won its spot
           is recorded above, in m.on, and must not be undone here — a
           label that won and was then folded into a group still holds its
           head start for next frame, or the group would come apart and
           re-form on alternate frames. */
        function hide(m) {
          m.el.dataset.off = '1';
          m.el.style.opacity = '0';
          // A label that goes round the back while open would otherwise
          // hold the globe still forever, from behind it.
          if (openLabel === m) closeLabel();
        }

        function show(m, el) {
          delete el.dataset.off;
          el.style.left = (m.sx / W * 100) + '%';
          el.style.top = (m.sy / H * 100) + '%';
          // Which way the card opens, so it never runs off the block.
          el.dataset.side = m.sx > W * 0.56 ? 'left' : 'right';
          /* And how far it is from here back to the middle of the globe.
             Narrow screens open the card there instead of beside the pill
             — beside is not an option when a label near the rim has under
             a hundred pixels to its right — and the card is a child of its
             own label, so the only way it can find the centre is to be
             told where the centre is from where it stands. */
          el.style.setProperty('--to-mid-x', (W / 2 - m.sx).toFixed(1) + 'px');
          el.style.setProperty('--to-mid-y', (H / 2 - m.sy).toFixed(1) + 'px');
          // Eased in over the band just inside the edge rather than popping.
          el.style.opacity =
            Math.min(1, (m.depth - GLOBE_LABEL_EDGE) / GLOBE_LABEL_FADE).toFixed(3);
        }
      }

      var running = false;
      function frame() {
        if (!canvas.isConnected) { running = false; return; }
        var row = root.closest('.entry');
        if (row && row.dataset.open !== 'true') { running = false; return; }

        if (!W && !measure()) { requestAnimationFrame(frame); return; }

        // The pointer only ever moves the target. Left alone, the target
        // either runs down the last throw or drifts on by itself.
        if (!dragging && !openLabel) {
          if (Math.abs(glide) > 0.00002) {
            wantHeading += glide;
            glide *= GLOBE_GLIDE;
          } else if (!prefersReduced()) {
            wantHeading += GLOBE_SPIN;
          }
        }

        // And the globe closes a fraction of the remaining gap each frame,
        // which is the whole of the weight.
        heading += (wantHeading - heading) * GLOBE_EASE;
        tilt += (wantTilt - tilt) * GLOBE_EASE;

        draw();
        requestAnimationFrame(frame);
      }
      function start() {
        if (running) return;
        running = true;
        requestAnimationFrame(frame);
      }

      /* On the wrapper rather than the canvas, because the labels sit over
         the canvas and a drag that began on one of them is still a drag —
         catching only the canvas made the globe stick whenever you happened
         to grab it by a country. */
      /* Every press starts as a drag and may turn out to have been a tap.
         It cannot be decided on the way down — the same gesture begins a
         spin and begins a tap — so the press records where it landed and
         how far it has travelled, and the release reads that back. */
      var pressedOn = null, travelled = 0;

      root.addEventListener('pointerdown', function (e) {
        dragging = true;
        lastX = e.clientX; lastY = e.clientY;
        glide = 0;
        travelled = 0;
        pressedOn = e.target && e.target.closest ? e.target.closest('li') : null;
        // Labels stop taking the pointer for the duration, so a drag that
        // crosses one does not open it on the way past.
        root.dataset.dragging = '1';
        if (root.setPointerCapture) { try { root.setPointerCapture(e.pointerId); } catch (err) { /* unsupported */ } }
        start();
      });
      root.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var dx = e.clientX - lastX, dy = e.clientY - lastY;
        lastX = e.clientX; lastY = e.clientY;

        travelled += Math.abs(dx) + Math.abs(dy);
        // Past the slop it is unambiguously a drag, and a card left open
        // under the finger is only in the way of it.
        if (travelled > GLOBE_TAP_SLOP) closeLabel();

        wantHeading += dx * GLOBE_DRAG;
        // Clamped so the globe cannot be rolled past its own pole.
        wantTilt = Math.max(-1.2, Math.min(1.2, wantTilt + dy * GLOBE_DRAG_Y));
        // The last push is what carries on after release.
        glide = dx * GLOBE_DRAG;
        start();
      });
      function release(e) {
        if (!dragging) return;
        dragging = false;
        delete root.dataset.dragging;
        if (root.releasePointerCapture && e && e.pointerId !== undefined) {
          try { root.releasePointerCapture(e.pointerId); } catch (err) { /* gone */ }
        }

        /* It was a tap. On a label, that is the touch equivalent of
           hovering it — and tapping the open one again is how you put it
           away. Anywhere else on the globe closes whatever was open,
           which is the only way a finger has of saying "done reading". */
        if (travelled <= GLOBE_TAP_SLOP) {
          var m = pressedOn && !pressedOn.dataset.off ? byEl(pressedOn) : null;
          if (!m || openLabel === m) closeLabel();
          else openLabelFor(m);
        }
        pressedOn = null;

        start();
      }
      function byEl(el) {
        for (var i = 0; i < places.length; i++) if (places[i].el === el) return places[i];
        for (var g = 0; g < groupEls.length; g++) if (groupEls[g].el === el) return groupEls[g];
        return null;
      }
      root.addEventListener('pointerup', release);
      root.addEventListener('pointercancel', release);

      /* And a tap that lands somewhere else on the page closes it too. A
         card held open by a finger that has since gone elsewhere would
         otherwise sit there holding the globe still indefinitely.

         Guarded on isConnected rather than removed: a language switch
         throws this whole panel away, and the listener that outlives it
         must not keep the old one alive. */
      document.addEventListener('pointerdown', function (e) {
        if (!root.isConnected) return;
        if (!openLabel) return;
        if (root.contains(e.target)) return;
        closeLabel();
        start();
      });

      if (window.ResizeObserver) {
        new ResizeObserver(function () { measure(); start(); }).observe(canvas);
      }

      // Opening the row is what starts it; closing it lets the loop end.
      root._globeStart = start;
      start();
    });
  }

  /* ----------------------------------------------------------
     One industry at a time comes up out of the field

     Which one is random, but not drawn at random: pure random leaves some
     tiles dark for a minute at a stretch while others repeat twice in ten
     seconds, and a viewer watching for their own industry is exactly the
     one who would notice. So it deals from a shuffled bag of all fourteen
     and only reshuffles once the bag is empty, which gives every tile its
     turn inside each round while the order stays unguessable. The seam
     between two bags is the one place a repeat can happen back to back,
     so the new bag rotates if its first card is the one just shown.

     The field is inside a collapsed accordion row most of the time. Rather
     than run the cycle into a hidden panel, a closed row just parks the
     loop and it resumes on the next open, and a field that has been thrown
     away by a language switch ends the loop for good instead of leaving a
     timer running against a detached node.
     ---------------------------------------------------------- */

  /* The stylesheet fades a tile in and out over --ind-fade (900ms), so the
     hold has to be long enough to contain both ends and still leave the
     tile sitting there lit for a moment in between — otherwise the light
     is all travel and never arrives. The dark beat likewise has to outlast
     the fade down, or the next tile starts rising while the last one is
     still on its way back. */
  var LIT_MS = 3400;    // one tile stays up: ~900 up, ~1600 held, ~900 down
  var DARK_MS = 1000;   // and the field is even again before the next
  var FIRST_MS = 700;   // the panel has finished opening by now
  var PARK_MS = 500;    // how often a closed row looks to see if it reopened

  function initIndustryGrid(scope) {
    scope.querySelectorAll('.capd-grid').forEach(function (grid) {
      if (grid.dataset.litReady) return;
      grid.dataset.litReady = '1';

      var tiles = [].slice.call(grid.querySelectorAll('.ind'));
      if (tiles.length < 2 || prefersReduced()) return;

      var bag = [];
      var last = -1;

      function refill() {
        bag = tiles.map(function (_, i) { return i; });
        for (var i = bag.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var swap = bag[i]; bag[i] = bag[j]; bag[j] = swap;
        }
        if (bag[0] === last) bag.push(bag.shift());
      }

      function isOpen() {
        var row = grid.closest('.entry');
        return !row || row.dataset.open === 'true';
      }

      function step() {
        if (!grid.isConnected) return;          // replaced by a language switch
        if (!isOpen()) { setTimeout(step, PARK_MS); return; }

        if (!bag.length) refill();
        var tile = tiles[last = bag.shift()];
        tile.classList.add('is-lit');
        setTimeout(function () {
          tile.classList.remove('is-lit');
          setTimeout(step, DARK_MS);
        }, LIT_MS);
      }

      refill();
      setTimeout(step, FIRST_MS);
    });
  }

  function initPanel(scope) {
    initAckDemo(scope);
    fitChipEdges(scope);
    fitFlowBands(scope);
    initGlobes(scope);
    initIndustryGrid(scope);
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
     Impact — the demo reel

     The motion/ demos, one after another: intro, chat, spec, MCP, setup,
     and round again. Each file is a finished page with its own loop, so
     each runs in a frame and this decides which one is on screen.

     Every demo marks the end of a pass by putting `is-fading` on its
     root, which is the cue to move on. Two frames take turns: the one on
     screen plays, the other holds the next demo, loaded and not started.

     Left alone, a demo stops and rewinds to its first frame whenever it
     scrolls out of view, and switching between its light and dark files
     would do the same. Neither is wanted: the reel keeps playing off
     screen, and a theme switch must not rewind it. So each demo is loaded
     with its IntersectionObserver replaced ahead of its own script (see
     reelHook): it starts when the reel says so and never stops itself.
     The theme is switched by the demo's own `data-theme` attribute, which
     is all that separates each light file from its dark one, so a switch
     recolours the demo mid-play instead of reloading it.

     The stage holds one shape for every demo (1200 × 640, the shape most
     of them already have), so nothing below it moves when the demo
     changes. A demo of another shape is scaled to cover it and centred,
     so it loses a sliver of its outer margin rather than showing a band
     of empty ground.
     ========================================================== */

  /* chat_b is an older cut that only knows dark; chat_w carries both
     themes with identical dark values, so it serves both here and can be
     switched live like the others. */
  /* `shape` is each demo's own aspect ratio (width / height) as its file
     declares it: the wide cut, then the portrait cut it switches to below
     640px of its own width. */
  /* `title` is the frame's accessible name, in the page's languages. */
  var REEL = [
    { light: 'motion/intro_w.html', dark: 'motion/intro_b.html', shape: [1200 / 640, 480 / 640],
      title: { ko: 'Super-Claude for SAP 소개', en: 'Super-Claude for SAP intro', ja: 'Super-Claude for SAP 紹介' } },
    { light: 'motion/chat_w.html',  dark: 'motion/chat_w.html',  shape: [1200 / 640, 480 / 560],
      title: { ko: 'SAP AI 포탈 채팅 데모', en: 'SAP AI portal chat demo', ja: 'SAP AI ポータル チャットデモ' } },
    { light: 'motion/spec_w.html',  dark: 'motion/spec_b.html',  shape: [1200 / 620, 480 / 660],
      title: { ko: '프로그램 명세서 생성 데모', en: 'Program spec generation demo', ja: 'プログラム仕様書生成デモ' } },
    { light: 'motion/mcp_w.html',   dark: 'motion/mcp_b.html',   shape: [1200 / 640, 480 / 700],
      title: { ko: 'MCP 모니터 데모', en: 'MCP monitor demo', ja: 'MCP モニターデモ' } },
    { light: 'motion/set_h.html',   dark: 'motion/set_b.html',   shape: [1200 / 660, 480 / 720],
      title: { ko: '설정 데모', en: 'Settings demo', ja: '設定デモ' } }
  ];
  var REEL_COMPACT = 640;   // the demos' own portrait breakpoint

  /* Runs inside each demo before anything else does. Serialised into the
     frame, so it must not reach outside itself. */
  function reelHook() {
    var W = window, started = false, ios = [];
    W.IntersectionObserver = function (cb) {
      this.observe = function (el) {
        ios.push(function () { cb([{ isIntersecting: true, intersectionRatio: 1, target: el }]); });
      };
      this.unobserve = this.disconnect = function () {};
      this.takeRecords = function () { return []; };
    };

    W.__reel = {
      start: function () {
        if (started) return;
        started = true;
        ios.forEach(function (f) { f(); });
      }
    };
  }

  /* House style for the frame: the preview page's padding goes, the demo
     sits centred in the full height of the frame, and the demo's own frame
     goes, since the stage draws the one edge. The page ground is set to
     the demo's own ground from script (paint), so a demo shorter than the
     stage shows no band above or below it.
     `.demo-out` holds a finished demo blank while the next fades in over
     it; left alone it would loop back to its first frame mid-crossfade. */
  var REEL_ROOTS = '.kx, .sapd, .spx, .mcx, .stx';
  var REEL_CSS =
    'html, body { margin: 0 !important; padding: 0 !important; height: 100% !important;' +
    ' min-height: 0 !important; overflow: hidden !important; }' +
    'body { display: flex !important; align-items: center !important; justify-content: center !important;' +
    ' background: transparent; }' +
    '.preview-wrap { flex: none !important; }' +
    '.preview-wrap { width: 100%; max-width: none !important; }' +
    '.pv-bar { display: none !important; }' +
    REEL_ROOTS + ' { box-shadow: none !important; border-radius: 0 !important; }' +
    'html.demo-out .kx-stage, html.demo-out .spx-stage, html.demo-out .mcx-stage,' +
    ' html.demo-out .stx-stage, html.demo-out .sapd-main' +
    ' { opacity: 0 !important; transition: opacity .45s !important; }';
  var REEL_HEAD = '<script>(' + reelHook.toString() + ')();<\/script><style>' + REEL_CSS + '</style>';
  /* Each demo reads window.__reelLang before it fills in its text, so the
     page's language is handed in ahead of the demo's own script. */
  function reelHead(l) { return '<script>window.__reelLang=' + JSON.stringify(l) + ';<\/script>' + REEL_HEAD; }

  (function initReel() {
    var stage = document.querySelector('[data-demo-stage]');
    if (!stage || !window.fetch) return;
    var frames = [].slice.call(stage.querySelectorAll('[data-demo-frame]'));
    if (frames.length < 2) return;

    function theme() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
    function fadeMs() {
      var v = parseFloat(getComputedStyle(stage).getPropertyValue('--demo-fade'));
      return isNaN(v) ? 1100 : v;
    }

    var front = null;            // the frame on screen
    var current = -1;            // index into REEL of what it shows
    var busy = false;            // a crossfade is running
    var relang = false;          // the language changed during a crossfade
    var html = {};               // fetched demo pages, by path, as served

    function win(f) { try { return f.contentWindow && f.contentWindow.__reel; } catch (e) { return null; } }
    function demoRoot(f) {
      try { return f.contentDocument && f.contentDocument.querySelector(REEL_ROOTS); }
      catch (e) { return null; }
    }

    /* The light and dark files differ only in this attribute. The frame's
       ground follows the demo's, so the space around a shorter demo is
       the demo's own colour. */
    function paint(f) {
      var r = demoRoot(f);
      if (!r) return;
      if (theme() === 'light') r.setAttribute('data-theme', 'light');
      else r.removeAttribute('data-theme');
      try {
        f.contentDocument.body.style.background = f.contentWindow.getComputedStyle(r).backgroundColor;
      } catch (e) { /* gone */ }
    }

    function page(src, l) {
      // From the site root: /en/ and /ja/ share the one motion/ folder.
      var got = html[src] ? Promise.resolve(html[src]) : fetch(new URL(src, SITE_ROOT)).then(function (r) { return r.text(); }).then(function (t) {
        html[src] = t;
        return t;
      });
      return got.then(function (t) {
        return t.replace(/<head[^>]*>/i, function (m) { return m + reelHead(l); });
      });
    }

    /* Load REEL[i] into frame f, ready but not started. A frame already
       holding that demo is reused as it is. */
    function load(f, i) {
      if (f.dataset.index === String(i) && f.dataset.lang === lang && f.dataset.ready === '1') return Promise.resolve(f);
      var token = String(Math.random());
      f.dataset.index = String(i);
      f.dataset.lang = lang;
      f.dataset.ready = '0';
      f.dataset.token = token;
      f.title = REEL[i].title[lang] || REEL[i].title.ko;
      return page(REEL[i][theme()], lang).then(function (doc) {
        return new Promise(function (res) {
          f.onload = function () {
            if (f.dataset.token !== token) return;   // superseded by a later load
            f.dataset.ready = '1';
            paint(f);
            watch(f);
            res(f);
          };
          f.srcdoc = doc;
        });
      });
    }

    /* The end of a pass, seen from outside. */
    function watch(f) {
      var r = demoRoot(f);
      if (!r || !window.MutationObserver) return;
      new MutationObserver(function () {
        if (f !== front || busy) return;
        if (r.classList.contains('is-fading')) next();
      }).observe(r, { attributes: true, attributeFilter: ['class'] });
    }

    /* Cover the frame. The demo sizes itself from its width, so a shorter
       demo is given a little more width than the frame, until its height
       matches, and the overflow is split off both sides; a taller one keeps
       the frame's width and its overflow is split off top and bottom.
       The ratio comes from REEL rather than from measuring the demo: a demo
       switches between its wide and portrait cuts a frame after its width
       changes, so a measurement taken now can belong to the wrong cut.
       Widening must also never carry a portrait demo past its breakpoint,
       or it would flip back to the wide cut inside a portrait frame. */
    /* Covering is only worth it while the trim is a sliver of margin. A
       demo far off the frame's shape (the portrait chat, MCP and setup
       cuts) would lose real content, so past REEL_MAX_TRIM a side it is
       fitted whole instead, and the rest of the frame shows its own
       ground colour, which reads as more of the demo, not as a gap. */
    var REEL_MAX_TRIM = 0.025;
    function cover(f) {
      if (f.hidden) return;
      var r = demoRoot(f), item = REEL[+f.dataset.index];
      if (!r || !item) return;
      var W = f.clientWidth, H = f.clientHeight;
      if (!W || !H) return;
      var compact = W < REEL_COMPACT;
      var ratio = item.shape[compact ? 1 : 0];
      var fitH = H * ratio;          // the width at which the demo is exactly H tall
      var w;
      if (fitH > W) {
        // Shorter than the frame: covering means widening and trimming the sides.
        w = (fitH - W) / fitH / 2 > REEL_MAX_TRIM ? W : fitH;
      } else {
        // Taller than the frame: covering means trimming top and bottom.
        var h = W / ratio;
        w = (h - H) / h / 2 > REEL_MAX_TRIM ? fitH : W;
      }
      if (compact) w = Math.min(w, REEL_COMPACT - 1);
      r.parentElement.style.width = w + 'px';
    }

    function other(f) { return f === frames[0] ? frames[1] : frames[0]; }
    function frame2() {
      return new Promise(function (res) {
        requestAnimationFrame(function () { requestAnimationFrame(res); });
      });
    }

    /* Bring REEL[i] up in the back frame and fade the front one out. */
    function show(i) {
      busy = true;
      var out = front;
      var back = out ? other(out) : frames[0];

      return load(back, i).then(function () {
        if (out) {
          try { out.contentDocument.documentElement.classList.add('demo-out'); } catch (e) { /* gone */ }
        }
        back.hidden = false;
        cover(back);
        // One frame for display to take, one for the demo to size itself.
        return frame2();
      }).then(function () {
        front = back;
        current = i;
        var w = win(back);
        if (w) w.start();
        back.classList.add('is-on');
        if (out) out.classList.remove('is-on');
        return new Promise(function (res) { setTimeout(res, prefersReduced() ? 0 : fadeMs()); });
      }).then(function () {
        if (out) out.hidden = true;
        busy = false;
        if (relang) { relang = false; if (!relabel(front)) { show(current); return; } }
        // The next demo waits, loaded and not started, in the frame just vacated.
        load(out || other(front), (current + 1) % REEL.length);
      });
    }

    function next() { show((current + 1) % REEL.length); }

    /* Below 640px of their own width the demos switch to a portrait cut,
       and the stage switches shape with them. */
    function fit() {
      stage.classList.toggle('is-compact', stage.clientWidth < REEL_COMPACT);
      frames.forEach(cover);
    }
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(stage);
    else window.addEventListener('resize', fit);

    new MutationObserver(function () { frames.forEach(paint); })
      .observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    /* A language switch swaps the words in place: each demo exposes
       __reelSetLang, which retranslates what is on screen and what it will
       write next, without rewinding. A frame that cannot (still loading, or
       a demo without the hook) falls back: the one on screen restarts in
       the new language, a waiting one reloads on its turn. */
    function relabel(f) {
      if (f.dataset.ready !== '1' || f.dataset.lang === lang) return true;
      var set;
      try { set = f.contentWindow && f.contentWindow.__reelSetLang; } catch (e) { set = null; }
      if (typeof set !== 'function') return false;
      try { set(lang); } catch (e) { return false; }
      f.dataset.lang = lang;
      var item = REEL[+f.dataset.index];
      if (item) f.title = item.title[lang] || item.title.ko;
      return true;
    }
    new MutationObserver(function () {
      frames.forEach(function (f) { if (f !== front) relabel(f); });
      if (current < 0 || !front || relabel(front)) return;
      if (busy) relang = true;
      else show(current);
    }).observe(root, { attributes: true, attributeFilter: ['lang'] });

    /* Started when the section first nears the screen, then left running:
       scrolling away does not stop it. */
    var io = new IntersectionObserver(function (entries) {
      if (!entries.some(function (e) { return e.isIntersecting; })) return;
      io.disconnect();
      show(0);
    }, { rootMargin: '0px 0px 40% 0px' });
    io.observe(stage);
  })();

  /* ==========================================================
     Go
     ========================================================== */

  document.body.classList.remove('no-js');
  applyLang();
  settleLangThumb();
})();
