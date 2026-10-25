/* ============================================================
   n.js — behaviour for redesign/index_n.html

   Language, nav state, the lit statement, the pinned chapters, the
   hero terminal, the acknowledge_risk gate, copy buttons and reveals.
   No dependencies. One rAF-throttled scroll handler drives the two
   things that follow the scroll exactly (statement, chapters); the
   rest runs on IntersectionObserver.
   ============================================================ */

(function () {
  'use strict';

  var root = document.documentElement;
  var I18N = window.N_I18N || {};
  var LANG_KEY = 'sc4sap-n-lang';   // separate from the deployed site's key on purpose
  var SUPPORTED = ['ko', 'en', 'ja'];
  var REPO = 'babamba2/superclaude-for-sap';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  function still() { return reduced.matches; }

  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }

  /* ==========================================================
     Language
     The Korean copy is whatever the markup says. It is captured once,
     before anything rewrites it, and becomes the `ko` table.
     ========================================================== */

  var nodes = [].slice.call(document.querySelectorAll('[data-i]'));
  var KO = {};
  nodes.forEach(function (el) {
    var k = el.getAttribute('data-i');
    if (!(k in KO)) KO[k] = el.innerHTML;
  });

  var saved = read(LANG_KEY);
  var lang = SUPPORTED.indexOf(saved) > -1 ? saved : 'ko';
  // While the switch is hidden the copy is being rewritten in Korean, and
  // the English and Japanese tables describe an older page.
  var langUI = document.querySelector('[data-lang]');
  if (!langUI || langUI.hidden) lang = 'ko';

  function t(key) {
    var table = lang === 'ko' ? KO : I18N[lang];
    return (table && table[key] != null) ? table[key] : KO[key];
  }

  function applyLang() {
    root.setAttribute('lang', lang);
    // Korean keeps the title and description written in the markup.
    var meta = lang !== 'ko' && I18N.meta && I18N.meta[lang];
    if (meta) {
      document.title = meta.title;
      var d = document.querySelector('meta[name="description"]');
      if (d) d.setAttribute('content', meta.desc);
    }
    nodes.forEach(function (el) { el.innerHTML = t(el.getAttribute('data-i')); });
    document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang-btn') === lang));
    });
    splitStatement();
    resetGate();
    onScroll();
  }

  var swapTimer = null;
  document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = btn.getAttribute('data-lang-btn');
      if (next === lang) return;
      lang = next;
      store(LANG_KEY, lang);
      document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      if (still()) { applyLang(); return; }
      clearTimeout(swapTimer);
      document.body.classList.add('is-swapping');
      swapTimer = setTimeout(function () {
        applyLang();
        requestAnimationFrame(function () { document.body.classList.remove('is-swapping'); });
      }, 260);
    });
  });

  /* ==========================================================
     Nav: condensed once the hero is gone, and the mobile menu
     ========================================================== */

  var nav = document.querySelector('[data-nav]');
  var capsule = nav && nav.querySelector('.nav-capsule');
  var toggle = document.querySelector('[data-nav-toggle]');

  if (toggle && capsule) {
    // The phone list fades at whichever edge still has entries beyond it.
    var list = capsule.querySelector('.nav-panel-in');
    var edges = function () {
      if (!list) return;
      list.classList.toggle('can-up', list.scrollTop > 2);
      list.classList.toggle('can-down', list.scrollTop + list.clientHeight < list.scrollHeight - 2);
    };
    if (list) list.addEventListener('scroll', edges, { passive: true });

    toggle.addEventListener('click', function () {
      var open = capsule.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      if (open && list) { list.scrollTop = 0; requestAnimationFrame(edges); setTimeout(edges, 600); }
    });
    capsule.querySelectorAll('.nav-group-links a').forEach(function (a) {
      a.addEventListener('click', function () {
        capsule.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Where am I: the rail follows the section in view ---------- */

  var sections = [].slice.call(document.querySelectorAll('[data-section]'));
  var marks = [].slice.call(document.querySelectorAll('.rail a'));

  if ('IntersectionObserver' in window) {
    var here = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = '#' + e.target.id;
        marks.forEach(function (a) {
          if (a.getAttribute('href') === id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { here.observe(s); });
  }

  /* ---------- Nav groups: the capsule grows to show one ----------
     Pointing at a group opens the capsule's second row with that group's
     entries; moving to the next group swaps the row's contents in place.
     Leaving the capsule closes it after a short grace period. Only the
     buttons decide which group shows, never the panel underneath, so the
     pointer resting between two buttons cannot flip them back and forth. */

  var menu = document.querySelector('.nav-menu');
  if (menu && capsule) {
    var wide = window.matchMedia('(min-width: 881px)');
    var glow = document.createElement('span');
    glow.className = 'nav-glow';
    glow.setAttribute('aria-hidden', 'true');
    menu.prepend(glow);

    var tops = [].slice.call(menu.querySelectorAll('.nav-top'));
    var groups = [].slice.call(capsule.querySelectorAll('.nav-group'));
    var panel = capsule.querySelector('.nav-panel');
    var active = null, closeTimer = null;

    // How much of the capsule the closed state cuts away: the panel row.
    var measure = function () {
      if (!wide.matches) { capsule.style.removeProperty('--cut'); return; }
      capsule.classList.add('is-measured');
      capsule.style.setProperty('--cut', panel.getBoundingClientRect().height + 'px');
    };
    measure();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

    var glowAt = function (btn) {
      if (!wide.matches || !btn) { glow.style.opacity = '0'; return; }
      var m = menu.getBoundingClientRect(), r = btn.getBoundingClientRect();
      var clip = 'inset(0 ' + (m.right - r.right) + 'px 0 ' + (r.left - m.left) + 'px round 999px)';
      if (glow.style.opacity !== '1') {
        glow.classList.add('is-snap');
        glow.style.clipPath = clip;
        glow.getBoundingClientRect();
        glow.classList.remove('is-snap');
      } else glow.style.clipPath = clip;
      glow.style.opacity = '1';
    };

    var show = function (name) {
      if (!wide.matches) return;
      clearTimeout(closeTimer);
      if (name === active) return;
      active = name;
      capsule.classList.toggle('is-expanded', !!name);
      tops.forEach(function (b) {
        var on = b.getAttribute('data-group') === name;
        b.setAttribute('aria-expanded', String(on));
        if (on) glowAt(b);
      });
      groups.forEach(function (g) { g.classList.toggle('is-on', g.getAttribute('data-group') === name); });
      if (!name) glowAt(null);
    };
    var closeSoon = function () {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(function () { show(null); }, 260);
    };

    tops.forEach(function (b) {
      var name = b.getAttribute('data-group');
      b.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') show(name); });
      b.addEventListener('click', function () { show(active === name ? null : name); });
      b.addEventListener('focus', function () { show(name); });
    });
    capsule.addEventListener('pointerenter', function () { clearTimeout(closeTimer); });
    capsule.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch') closeSoon(); });
    capsule.addEventListener('focusout', function (e) { if (!capsule.contains(e.relatedTarget)) closeSoon(); });
    capsule.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && active) {
        var b = menu.querySelector('[data-group="' + active + '"]');
        show(null);
        if (b) b.focus();
      }
    });
    capsule.querySelectorAll('.nav-group-links a').forEach(function (a) {
      a.addEventListener('click', function () { show(null); });
    });
    document.addEventListener('pointerdown', function (e) { if (active && !capsule.contains(e.target)) show(null); });
    window.addEventListener('resize', function () {
      measure();
      if (active) glowAt(menu.querySelector('[data-group="' + active + '"]'));
    });
    if (wide.addEventListener) wide.addEventListener('change', function () { show(null); measure(); });
  }

  /* ---------- Hero chip: the roles, one after another ---------- */

  (function rotor() {
    var chip = document.querySelector('[data-rotor]');
    if (!chip || still()) return;
    var items = [].slice.call(chip.querySelectorAll('.rotor-item'));
    var HOLD = 3600;   // from one change to the next, fades included
    var i = 0, timer = null;

    function step() {
      items[i].classList.remove('is-on');
      i = (i + 1) % items.length;
      items[i].classList.add('is-on');
      // The dot turns as the new words come in.
      setTimeout(function () { chip.setAttribute('data-tone', i % 2 ? 'teal' : 'amber'); }, 650);
    }
    function play() { if (!timer) timer = setInterval(step, HOLD); }
    function stop() { clearInterval(timer); timer = null; }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es[0].isIntersecting ? play() : stop(); }).observe(chip);
    } else play();
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : play(); });
  })();

  /* ==========================================================
     The statement: each word lights as the reading line passes it
     ========================================================== */

  var statement = document.querySelector('[data-statement]');
  var words = [];

  function splitStatement() {
    if (!statement) return;
    var out = [];
    [].slice.call(statement.childNodes).forEach(function (node) {
      var key = node.nodeType === 1;
      var text = node.textContent;
      // Space-separated scripts split on spaces; Japanese has none, so
      // it is lit a few characters at a time instead.
      var parts = lang === 'ja' ? text.match(/[^、。]{1,4}[、。]?/g) || [] : text.split(/(\s+)/);
      parts.forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { out.push(p); return; }
        out.push('<span class="w' + (key ? ' key' : '') + '">' + p + '</span>');
      });
    });
    statement.innerHTML = out.join('');
    words = [].slice.call(statement.querySelectorAll('.w'));
  }

  function litStatement(vh) {
    if (!words.length) return;
    if (still()) { words.forEach(function (w) { w.classList.add('lit'); }); return; }
    var r = statement.getBoundingClientRect();
    // From the statement's top reaching 80% of the screen to its bottom
    // reaching 45%: the sentence is read while it crosses the middle.
    var start = vh * 0.8, end = vh * 0.45;
    var p = (start - r.top) / ((start - end) + r.height);
    p = Math.max(0, Math.min(1, p));
    var n = Math.round(p * words.length);
    words.forEach(function (w, i) { w.classList.toggle('lit', i < n); });
  }

  /* ==========================================================
     Chapters: the pinned stage advances one item per --step of scroll
     ========================================================== */

  var pinned = window.matchMedia('(min-width: 1000px) and (min-height: 680px)');
  var chapters = [].slice.call(document.querySelectorAll('[data-chapter]')).map(function (el) {
    var items = [].slice.call(el.querySelectorAll('[data-item]'));
    var ch = { el: el, items: items, active: -1 };
    items.forEach(function (item, i) {
      item.querySelector('[data-item-tab]').addEventListener('click', function () {
        if (!pinned.matches) return;
        var top = el.getBoundingClientRect().top + window.scrollY;
        var run = el.offsetHeight - window.innerHeight;
        window.scrollTo({ top: top + run * ((i + 0.5) / items.length), behavior: still() ? 'auto' : 'smooth' });
      });
    });
    return ch;
  });

  function setActive(ch, idx) {
    if (ch.active === idx) return;
    ch.active = idx;
    ch.items.forEach(function (item, i) {
      item.classList.toggle('is-active', i === idx);
      item.classList.toggle('is-past', i < idx);
      var tab = item.querySelector('[data-item-tab]');
      // Stacked, the tab is only a label: keep it out of the tab order.
      if (idx === -2) { tab.setAttribute('tabindex', '-1'); tab.removeAttribute('aria-expanded'); }
      else { tab.removeAttribute('tabindex'); tab.setAttribute('aria-expanded', String(i === idx)); }
    });
  }

  function stepChapters(vh) {
    chapters.forEach(function (ch) {
      if (!pinned.matches) { setActive(ch, -2); return; }
      var r = ch.el.getBoundingClientRect();
      // Progress is measured over the stretch where the stage is pinned:
      // from the section's padding edge reaching the top of the screen
      // until the pinned stage lets go. (The pin's own offsetTop cannot
      // be used; a stuck element reports where it is stuck.)
      var padTop = parseFloat(getComputedStyle(ch.el).paddingTop) || 0;
      var run = ch.el.offsetHeight - padTop * 2 - vh;
      var p = run > 0 ? (-(r.top + padTop)) / run : 0;
      p = Math.max(0, Math.min(0.9999, p));
      setActive(ch, Math.floor(p * ch.items.length));
    });
  }

  /* ---------- One scroll handler, once a frame ---------- */

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var vh = window.innerHeight;
      if (nav) nav.classList.toggle('is-scrolled', window.scrollY > vh * 0.25);
      litStatement(vh);
      stepChapters(vh);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  if (pinned.addEventListener) pinned.addEventListener('change', onScroll);

  /* ==========================================================
     Hero terminal: lines arrive in order, then the session loops
     ========================================================== */

  (function terminal() {
    var term = document.querySelector('[data-term]');
    if (!term) return;
    var lines = [].slice.call(term.querySelectorAll('.term-body li'));
    var typed = term.querySelector('[data-type]');
    var full = typed ? typed.textContent : '';

    if (still()) { lines.forEach(function (l) { l.classList.add('is-shown'); }); return; }

    var GAP = 620;      // between lines
    var HOLD = 5200;    // finished session stays on screen
    var CHAR = 42;      // typing speed
    var timers = [];
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

    function run() {
      timers.forEach(clearTimeout); timers = [];
      lines.forEach(function (l) { l.classList.remove('is-shown'); });
      if (typed) { typed.textContent = ''; typed.classList.add('is-typing'); }
      lines[0].classList.add('is-shown');

      var at = 300;
      for (var i = 1; i <= full.length; i++) {
        (function (n) { later(function () { typed.textContent = full.slice(0, n); }, at + n * CHAR); })(i);
      }
      at += full.length * CHAR + 400;
      later(function () { typed.classList.remove('is-typing'); }, at);

      lines.slice(1).forEach(function (l, i) {
        // The approval line waits a beat longer: someone is reading the spec.
        var extra = l.previousElementSibling && l.previousElementSibling.classList.contains('t-wait') ? 900 : 0;
        at += GAP + extra;
        later(function () { l.classList.add('is-shown'); }, at);
      });
      later(run, at + HOLD);
    }

    if ('IntersectionObserver' in window) {
      var started = false;
      new IntersectionObserver(function (es) {
        if (es[0].isIntersecting && !started) { started = true; run(); }
      }, { threshold: 0.3 }).observe(term);
    } else run();
  })();

  /* ==========================================================
     The acknowledge_risk gate
     ========================================================== */

  var gate = document.querySelector('[data-gate]');
  var gateOut = gate && gate.querySelector('[data-gate-out]');

  function resetGate() {
    if (!gate) return;
    gate.querySelectorAll('[data-gate-key]').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
    gateOut.classList.remove('has-verdict');
  }

  if (gate) {
    gate.querySelectorAll('[data-gate-key]').forEach(function (b) {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        gate.querySelectorAll('[data-gate-key]').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        var tpl = (I18N.gate[lang] || I18N.gate.ko)[b.getAttribute('data-gate-key')];
        var kw = b.textContent.replace(/[<>&"]/g, '');
        gateOut.innerHTML = tpl.replace('{kw}', kw);
        gateOut.classList.add('has-verdict');
      });
    });
  }

  /* ==========================================================
     Copy buttons
     ========================================================== */

  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function () {
        btn.classList.add('is-done');
        btn.querySelector('.ph').className = 'ph ph-check';
        setTimeout(function () {
          btn.classList.remove('is-done');
          btn.querySelector('.ph').className = 'ph ph-copy';
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
    });
  });

  /* ==========================================================
     Reveals and count-ups
     ========================================================== */

  if ('IntersectionObserver' in window) {
    var rev = new IntersectionObserver(function (es, obs) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        obs.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      // Siblings arrive one after another, 110ms apart.
      var i = [].indexOf.call(el.parentElement.children, el);
      el.style.setProperty('--rd', (i % 4) * 110 + 'ms');
      rev.observe(el);
    });

    var counter = document.querySelector('[data-count]');
    if (counter && !still()) {
      new IntersectionObserver(function (es, obs) {
        if (!es[0].isIntersecting) return;
        obs.disconnect();
        counter.querySelectorAll('[data-to]').forEach(function (el, i) { countUp(el, i * 120); });
      }, { threshold: 0.4 }).observe(counter);
    }
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  function countUp(el, delay) {
    var to = parseInt(el.getAttribute('data-to'), 10);
    var suf = el.getAttribute('data-suffix');
    var tail = suf ? '<span class="suf">' + suf + '</span>' : '';
    el.innerHTML = '0' + tail;
    setTimeout(function () {
      var t0 = null, DUR = 1300;
      requestAnimationFrame(function step(now) {
        if (t0 === null) t0 = now;
        var p = Math.min((now - t0) / DUR, 1);
        el.innerHTML = Math.round(to * (1 - Math.pow(1 - p, 3))) + tail;
        if (p < 1) requestAnimationFrame(step);
      });
    }, delay);
  }

  /* ---------- Auras drift only while their section is on screen ---------- */

  if ('IntersectionObserver' in window) {
    var auraIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('is-idle', !e.isIntersecting); });
    }, { rootMargin: '10% 0px' });
    document.querySelectorAll('.aura').forEach(function (a) { auraIO.observe(a); });
  }

  /* ---------- GitHub stars, shown only when the request succeeds ---------- */

  fetch('https://api.github.com/repos/' + REPO)
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (d) {
      if (typeof d.stargazers_count !== 'number') return;
      document.querySelectorAll('[data-stars]').forEach(function (el) {
        el.textContent = d.stargazers_count;
        el.hidden = false;
      });
    })
    .catch(function () { /* stays hidden */ });

  /* ---------- Boot ---------- */

  applyLang();
})();
