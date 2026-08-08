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

    if (scroll) {
      var navH = nav.offsetHeight;
      var y = entry.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top: y, behavior: prefersReduced() ? 'auto' : 'smooth' });
    }
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

  function initPanel(scope) {
    initAckDemo(scope);
    if (window.twemoji) {
      try { window.twemoji.parse(scope, { folder: 'svg', ext: '.svg' }); } catch (e) { /* optional */ }
    }
  }

  var ACK_PASS = ['yes', '승인', 'authorize', 'approve', 'proceed', 'confirmed'];
  var ACK_AMBIGUOUS = ['뽑아봐', 'try it', 'my mistake', '해봐'];

  function initAckDemo(scope) {
    var buttons = scope.querySelectorAll('.ack-btn');
    var output = scope.querySelector('.ack-output');
    if (!buttons.length || !output) return;

    output.textContent = t('ackDefault');

    buttons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');

        var kw = btn.dataset.kw || btn.textContent.trim();
        if (ACK_PASS.indexOf(kw) > -1) {
          output.innerHTML = t('ackPass').replace(/\{kw\}/g, kw);
        } else if (ACK_AMBIGUOUS.indexOf(kw) > -1) {
          output.innerHTML = t('ackDeny').replace(/\{kw\}/g, kw);
        } else {
          output.textContent = t('ackDefault');
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
    el.style.setProperty('--reveal-delay', (i % 4) * 60 + 'ms');
    revealObserver.observe(el);
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
     Go
     ========================================================== */

  document.body.classList.remove('no-js');
  applyLang();
  settleLangThumb();
  typeCommand();   // once on load; the command is the same in every language
})();
