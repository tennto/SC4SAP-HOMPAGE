/* ============================================================
   n.js — behaviour for the landing page (index.html)

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
  var SUPPORTED = ['ko', 'en', 'ja'];
  var REPO = 'babamba2/superclaude-for-sap';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  function still() { return reduced.matches; }


  /* ==========================================================
     Language
     Each language has its own static page (/, /en/, /ja/; see
     tools/build-i18n.mjs), so the copy is whatever the markup says.
     It is captured once, before anything rewrites it. js/lang.js has
     already moved the visitor to the page in their language.
     ========================================================== */

  var nodes = [].slice.call(document.querySelectorAll('[data-i]'));
  var COPY = {};
  nodes.forEach(function (el) {
    var k = el.getAttribute('data-i');
    if (!(k in COPY)) COPY[k] = el.innerHTML;
  });

  var lang = SUPPORTED.indexOf(root.getAttribute('lang')) > -1 ? root.getAttribute('lang') : 'ko';

  function t(key) { return COPY[key]; }

  function applyLang() {
    nodes.forEach(function (el) { el.innerHTML = t(el.getAttribute('data-i')); });
    document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang-btn') === lang));
    });
    splitStatement();
    resetGate();
    onScroll();
  }

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

  /* ---------- Hero prompt bar: questions typed out in turn ---------- */

  (function ask() {
    var root = document.querySelector('[data-ask]');
    if (!root) return;
    var bar = root.querySelector('.ask');
    var text = root.querySelector('.ask-text');
    var qs = [].slice.call(root.querySelectorAll('li')).map(function (li) { return li.textContent.trim(); });
    if (!qs.length) return;

    // Reduced motion: the first question, typed, in the open bar.
    if (still()) { bar.classList.add('is-open'); text.textContent = qs[0]; return; }

    var OPEN = 650;     // matches --open
    var FADE_OUT = 500; // matches --fade-out
    var GAP = 150;      // nothing on screen between two rounds
    var PAUSE = 800;    // the short bar fades in (--fade), then opens straight away
    var HOLD = 3000;    // the finished question stays this long
    var TYPE = 50;      // per character, steady: uneven gaps read as stutter
    var q = 0, timer = null, running = false;
    var next = null, due = 0, left = 0;   // the step waiting to run, kept across a pause

    function later(fn, ms) {
      next = fn; due = Date.now() + ms;
      timer = setTimeout(function () { next = null; fn(); }, ms);
    }
    // Open the empty bar all the way, then type into it.
    function open() {
      bar.classList.add('is-open');
      later(function () { type(1); }, OPEN * 0.45);
    }
    function type(n) {
      var chars = Array.from(qs[q]);   // whole Hangul syllables, never half a pair
      text.textContent = chars.slice(0, n).join('');
      if (n < chars.length) later(function () { type(n + 1); }, TYPE);
      else later(clear, HOLD);
    }
    // The whole bar fades out; hidden, it snaps back to its minimum width,
    // fades back in short, rests a beat, then opens.
    function clear() {
      bar.classList.add('is-out');
      later(function () {
        text.textContent = '';
        bar.classList.add('is-reset');
        bar.classList.remove('is-open');
        void bar.offsetWidth;
        bar.classList.remove('is-reset');
        q = (q + 1) % qs.length;
        later(function () {
          bar.classList.remove('is-out');
          later(open, PAUSE);
        }, GAP);
      }, FADE_OUT);
    }
    // Off screen the bar pauses where it is and picks up from there on return.
    function play() {
      if (running) return;
      running = true;
      if (next) later(next, left);
      else later(open, 500);
    }
    function stop() {
      if (!running) return;
      running = false;
      clearTimeout(timer);
      left = Math.max(0, due - Date.now());
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es[0].isIntersecting ? play() : stop(); }).observe(root);
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
      // Line breaks are kept as they are, class and all (.br-m breaks on
      // phones only); they carry no words to light.
      if (node.nodeName === 'BR') { out.push(node.outerHTML); return; }
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
    var ch = { el: el, items: items, active: -1, pin: el.querySelector('.chapter-pin'), grid: el.querySelector('.chapter-grid') };
    items.forEach(function (item, i) {
      item.querySelector('[data-item-tab]').addEventListener('click', function () {
        if (!pinned.matches) return;
        var g = pinGeometry(ch);
        var top = el.getBoundingClientRect().top + window.scrollY + g.padTop - g.stick;
        window.scrollTo({ top: top + g.run * ((i + 0.5) / items.length), behavior: still() ? 'auto' : 'smooth' });
      });
    });
    return ch;
  });

  // Where the pinned stretch starts and how long it runs. The pin sticks
  // at its CSS top (under the nav), not at the top of the screen.
  function pinGeometry(ch) {
    var padTop = parseFloat(getComputedStyle(ch.el).paddingTop) || 0;
    var stick = parseFloat(getComputedStyle(ch.pin).top) || 0;
    return { padTop: padTop, stick: stick, run: ch.el.offsetHeight - padTop * 2 - ch.pin.offsetHeight };
  }

  // The pin is sized to the chapter's tallest state: each item is opened in
  // turn with transitions off and the grid measured, all inside one frame,
  // so nothing is painted mid-way. The original state goes back before
  // transitions come back on, so nothing animates either.
  function measurePins() {
    chapters.forEach(function (ch) {
      if (!pinned.matches) { ch.el.style.removeProperty('--pin-h'); return; }
      var was = ch.items.map(function (it) { return [it.classList.contains('is-active'), it.classList.contains('is-past')]; });
      ch.el.classList.add('is-measuring');
      var tallest = 0;
      ch.items.forEach(function (item, i) {
        ch.items.forEach(function (it, k) { it.classList.toggle('is-active', k === i); });
        tallest = Math.max(tallest, ch.grid.offsetHeight);
      });
      ch.items.forEach(function (it, k) { it.classList.toggle('is-active', was[k][0]); it.classList.toggle('is-past', was[k][1]); });
      void ch.grid.offsetHeight;
      ch.el.classList.remove('is-measuring');
      ch.el.style.setProperty('--pin-h', tallest + 'px');
    });
  }

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
      // from the section's padding edge reaching the pin's sticking line
      // until the pinned stage lets go. (The pin's own offsetTop cannot
      // be used; a stuck element reports where it is stuck.)
      var g = pinGeometry(ch);
      var p = g.run > 0 ? (g.stick - (r.top + g.padTop)) / g.run : 0;
      p = Math.max(0, Math.min(0.9999, p));
      setActive(ch, Math.floor(p * ch.items.length));
    });
  }

  /* ==========================================================
     Before -> After: states 0-8 over the pinned stretch.
     0 untouched · 1-5 a manual step is struck and the time drops
     · 6 the empty spec rises · 7-8 it widens over the meter and the
     result is drawn in. Stacked (narrow, short) everything shows at
     its final state.
     ========================================================== */

  var shift = document.querySelector('[data-shift]');
  var shiftUI = shift && {
    tasks: [].slice.call(shift.querySelectorAll('[data-task]')),
    num: shift.querySelector('[data-shift-num]'),
    val: shift.querySelector('[data-shift-val]'),
    win: shift.querySelector('.spec-win'),
    view: shift.querySelector('[data-dx]'),
    badge: shift.querySelector('.shift-done'),
    state: null,
    wide: null,
    token: 0
  };
  if (shiftUI) {
    shiftUI.page = shiftUI.view.querySelector('.dx-page');
    shiftUI.result = shiftUI.view.querySelector('.dx-result');
    shiftUI.prev = shiftUI.view.querySelector('[data-dx-prev]');
    shiftUI.docBody = shiftUI.view.querySelector('.dx-doc-body');
    shiftUI.scroller = shiftUI.view.querySelector('.dx-scroll');
    shiftUI.toc = [].slice.call(shiftUI.view.querySelectorAll('.dx-toc li'));
    shiftUI.cursor = shiftUI.view.querySelector('.dx-cursor');
    shiftUI.flow = shiftUI.view.querySelector('.dx-flow');
  }

  /* The demo's result phase, as motion/spec_b.html plays it: the result
     arrives, the page scrolls to the preview, then the cursor clicks two
     contents entries and the document moves to each. Positions are read
     from the layout each time, so they hold at any width. */
  function topIn(el, box) { return el.getBoundingClientRect().top - box.getBoundingClientRect().top; }
  function dxScrollPage(el, gap) {
    var ui = shiftUI;
    var max = Math.max(0, ui.page.offsetHeight - ui.view.clientHeight);
    var y = Math.min(max, Math.max(0, topIn(el, ui.page) - gap));
    ui.page.style.transform = 'translateY(' + -y + 'px)';
  }
  function dxScrollDoc(n) {
    var ui = shiftUI;
    var sec = ui.scroller.querySelector('[data-sec="' + n + '"]');
    var max = Math.max(0, ui.scroller.offsetHeight - ui.docBody.clientHeight);
    var y = Math.min(max, Math.max(0, topIn(sec, ui.scroller) - ui.docBody.clientHeight * 0.06));
    ui.scroller.style.transform = 'translateY(' + -y + 'px)';
    ui.toc.forEach(function (li, i) { li.classList.toggle('is-active', i === n - 1); });
  }
  function dxShowSection(n) {
    var ui = shiftUI;
    var sec = ui.scroller.querySelector('[data-sec="' + n + '"]');
    var max = Math.max(0, ui.scroller.offsetHeight - ui.docBody.clientHeight);
    var y = Math.min(max, Math.max(0, topIn(sec, ui.scroller) - ui.docBody.clientHeight * 0.06));
    ui.scroller.style.transition = 'none';                // lands there, it does not travel
    ui.scroller.style.transform = 'translateY(' + -y + 'px)';
    void ui.scroller.offsetWidth;
    ui.scroller.style.transition = '';
    ui.toc.forEach(function (li, i) { li.classList.toggle('is-active', i === n - 1); });
  }
  function dxPoint(el, fx, fy) {
    var r = el.getBoundingClientRect(), v = shiftUI.view.getBoundingClientRect();
    return [r.left - v.left + r.width * fx, r.top - v.top + r.height * fy];
  }
  function dxMove(p) { shiftUI.cursor.style.transform = 'translate(' + (p[0] - 3) + 'px,' + (p[1] - 2) + 'px)'; }
  function dxClick() {
    var c = shiftUI.cursor;
    c.classList.remove('is-click'); void c.offsetWidth; c.classList.add('is-click');
  }
  function dxReset() {
    var ui = shiftUI;
    ui.win.classList.remove('is-done');
    ui.page.style.transform = ''; ui.scroller.style.transform = '';
    ui.toc.forEach(function (li) { li.classList.remove('is-active'); });
    ui.cursor.classList.remove('is-on', 'is-click');
    ui.badge.classList.remove('is-on');
    ui.flow.classList.remove('is-live');
  }

  function playSpec(wide, animate) {
    var ui = shiftUI;
    if (ui.wide === wide) return;
    ui.wide = wide;
    var t = ++ui.token;                                 // a newer call cancels this run
    dxReset();
    if (!wide) return;
    ui.toc[0].classList.add('is-active');
    if (!animate) {
      ui.win.classList.add('is-done'); ui.badge.classList.add('is-on'); ui.flow.classList.add('is-live');
      // A phone shows the preview without the walk: open it on the data model.
      if (phone.matches) requestAnimationFrame(function () { if (t === ui.token) dxShowSection(2); });
      return;
    }
    var wait = function (ms) {
      return new Promise(function (res, rej) { setTimeout(function () { t === ui.token ? res() : rej(); }, ms); });
    };
    wait(1100)                                          // the window finishes widening
      .then(function () { ui.win.classList.add('is-done'); dxScrollPage(ui.result, 12); return wait(1500); })
      .then(function () { dxScrollPage(ui.prev, 10); return wait(1100); })
      .then(function () {
        dxMove(dxPoint(ui.view, 0.5, 0.92)); void ui.cursor.offsetWidth;
        ui.cursor.classList.add('is-on');
        return [2, 4].reduce(function (chain, n, i) {
          return chain.then(function () {
            dxMove(dxPoint(ui.toc[n - 1], 0.5, 0.55));
            return wait(380);
          }).then(function () {
            dxClick(); dxScrollDoc(n);
            // Section 4 holds the flowchart: it runs once the page settles.
            if (n === 4) setTimeout(function () { if (t === ui.token) ui.flow.classList.add('is-live'); }, 350);
            return wait(i ? 1300 : 800);
          });
        }, Promise.resolve());
      })
      .then(function () { ui.cursor.classList.remove('is-on'); ui.badge.classList.add('is-on'); })
      .catch(function () { /* cancelled by a newer state */ });
  }
  // Program -> Spec in Standard mode: 5-10 minutes in the app's own
  // estimate, shown at its upper end.
  // The words around the number, per page language. The unit is split off
  // into its own span below; English keeps its space inside the unit.
  var UNITS = {
    ko: { about: '약 ', day: '일', days: '일', min: '분' },
    en: { about: 'about ', day: ' day', days: ' days', min: ' min' },
    ja: { about: '約', day: '日', days: '日', min: '分' }
  }[lang];
  var FAST = UNITS.about + '10' + UNITS.min;
  var FAST_S = 600;
  var TOTAL = 5;                                     // days, the manual total

  function days(n) { return n > 0 ? (n % 1 ? n.toFixed(1) : n) + (n === 1 ? UNITS.day : UNITS.days) : FAST; }

  // Days left once the first `struck` manual steps are gone.
  function leftAfter(struck) {
    var left = TOTAL;
    for (var i = 0; i < struck; i++) left -= parseFloat(shiftUI.tasks[i].getAttribute('data-task'));
    return left;
  }

  function setShift(state, pinnedNow) {
    var ui = shiftUI;
    var key = state + (pinnedNow ? 'p' : 's');
    if (ui.state === key) return;
    ui.state = key;

    var struck = pinnedNow ? Math.min(state, ui.tasks.length) : 0;
    ui.tasks.forEach(function (task, i) { task.classList.toggle('is-done', i < struck); });
    // On a phone the meter runs its own loop (meterLoop) and is left alone here.
    if (pinnedNow || !ui.looping) setMeter(!pinnedNow || struck === ui.tasks.length, leftAfter(struck));

    shift.classList.toggle('is-up', !pinnedNow || state >= 6);
    var wide = pinnedNow && state >= 7;
    shift.classList.toggle('is-wide', wide);
    playSpec(wide || !pinnedNow, pinnedNow && !still());
  }

  // The big number, the SC4SAP bar and its value.
  function setMeter(fast, left) {
    var ui = shiftUI;
    var label = fast ? FAST : (left === TOTAL ? UNITS.about : '') + days(left);
    if (ui.num.getAttribute('data-label') !== label) {
      ui.num.setAttribute('data-label', label);
      // The unit goes in its own span so CSS can space it off the digits.
      var m = new RegExp('^(.*?)(' + [UNITS.days, UNITS.day, UNITS.min].join('|') + ')$').exec(label);
      ui.num.textContent = m ? m[1] : label;
      if (m) {
        var unit = document.createElement('span');
        unit.className = 'u';
        unit.textContent = m[2];
        ui.num.appendChild(unit);
      }
      ui.num.classList.remove('is-swap');
      void ui.num.offsetWidth;                       // restart the swap
      ui.num.classList.add('is-swap');
    }
    var val = fast ? FAST : days(left);
    if (ui.val.textContent !== val) {
      ui.val.textContent = val;
      ui.val.classList.remove('is-swap');
      void ui.val.offsetWidth;                       // the value eases in with the number
      ui.val.classList.add('is-swap');
    }
    // Ten minutes against five eight-hour days, kept as a visible sliver.
    shift.style.setProperty('--left', fast ? (FAST_S /(TOTAL * 8 * 3600)).toFixed(4) : (left / TOTAL).toFixed(3));

    shift.classList.toggle('is-fast', fast);
  }

  /* Phones have no pinned stretch to scroll the steps through, so while the
     meter or the step list is on screen it plays them on its own: five
     days, each step struck as its time falls away, ten minutes, a rest,
     and round again. */
  var phone = window.matchMedia('(max-width: 760px)');
  function meterLoop() {
    var ui = shiftUI, timer = null, at = 0;
    var HOLD_START = 1400, STEP = 750, HOLD_LAST = 1300, HOLD_END = 5000;   // the last strike is seen, then the spec is read
    // One step past the last strike, the spec takes the list's place (.is-spec).
    function step(n) {
      var last = ui.tasks.length, end = n >= last, spec = n > last;
      at = n;
      ui.tasks.forEach(function (task, i) { task.classList.toggle('is-done', i < n); });
      setMeter(end, leftAfter(Math.min(n, last)));
      shift.classList.toggle('is-spec', spec);
      timer = setTimeout(function () { step(spec ? 0 : n + 1); }, n === 0 ? HOLD_START : spec ? HOLD_END : end ? HOLD_LAST : STEP);
    }
    // Scrolled out and back, the loop pauses and picks up where it was.
    // Resetting it each time made the bar jump whenever the meter sat at
    // the edge of the screen and the observer flicked it off and on.
    function sync(inView) {
      var run = inView && phone.matches && !pinned.matches && !still();
      if (run === ui.looping) return;
      var wasLooping = ui.looping;
      ui.looping = run;
      shift.classList.toggle('is-looping', phone.matches && !pinned.matches && !still());   // kept while paused
      clearTimeout(timer);
      if (run) step(wasLooping === false && phone.matches ? at : 0);
      else if (!phone.matches || still()) { at = 0; ui.state = null; shift.classList.remove('is-spec'); stepShift(window.innerHeight); }   // no loop here: the resting state
    }
    // Either the meter or the step list on screen keeps it running.
    var shown = { meter: false, before: false };
    function seen() { return shown.meter || shown.before; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { shown[e.target.classList.contains('shift-meter') ? 'meter' : 'before'] = e.isIntersecting; });
      sync(seen());
    });
    io.observe(shift.querySelector('.shift-meter'));
    io.observe(shift.querySelector('.shift-before'));
    phone.addEventListener('change', function () { sync(seen()); });
  }
  if (shift && 'IntersectionObserver' in window) meterLoop();

  function stepShift(vh) {
    if (!shift) return;
    if (!pinned.matches) { setShift(7, false); return; }
    var r = shift.getBoundingClientRect();
    var run = shift.offsetHeight - vh;
    var p = run > 0 ? -r.top / run : 1;
    p = Math.max(0, Math.min(0.9999, p));
    setShift(Math.floor(p * 9), true);
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
      stepShift(vh);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  if (pinned.addEventListener) pinned.addEventListener('change', onScroll);

  // Pin heights follow the layout: measured now, after the web fonts land,
  // and after a resize settles.
  var pinTimer = null;
  function remeasure() { measurePins(); onScroll(); }
  remeasure();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
  window.addEventListener('resize', function () { clearTimeout(pinTimer); pinTimer = setTimeout(remeasure, 150); });
  if (pinned.addEventListener) pinned.addEventListener('change', remeasure);

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

  /* ---------- Phones open the site's own pages in place ---------- */

  // On a desktop the nav and footer pages open in new tabs, which are easy
  // to close; on a phone they pile up, so there the site's own links stay
  // in the same tab. Links off the site (GitHub) keep their new tab.
  var handheld = window.matchMedia('(max-width: 760px), (hover: none) and (pointer: coarse)');
  document.addEventListener('click', function (e) {
    if (!handheld.matches || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[target="_blank"]');
    if (!a || a.origin !== location.origin) return;
    e.preventDefault();
    location.href = a.href;
  });

  /* ---------- Launch notice: the workspace opens on 11 November ---------- */

  (function launchNotice() {
    var dlg = document.querySelector('[data-launch]');
    if (!dlg || typeof dlg.showModal !== 'function') return;   // old browsers follow the href
    var dday = dlg.querySelector('[data-launch-dday]');
    var OPENS = Date.UTC(2026, 10, 10, 15);                      // 2026-11-11 00:00 KST

    function count() {
      var days = Math.ceil((OPENS - Date.now()) / 86400000);
      dday.textContent = days > 0 ? 'D-' + days : 'D-DAY';
    }

    document.querySelectorAll('[data-launch-open]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        count();
        dlg.showModal();
      });
    });
    dlg.querySelector('[data-launch-close]').addEventListener('click', function () { dlg.close(); });
    // The page stays put behind the panel. Not overflow: hidden on <html>:
    // that removes the scrollbar, so the page shifts sideways and the empty
    // gutter shows as a strip the backdrop does not cover.
    // Wheel over the dimmed area lands on the document, not the dialog, so
    // listen on window; a panel taller than a short screen may still scroll.
    function hold(e) {
      if (!dlg.open) return;
      if (dlg.contains(e.target) && dlg.scrollHeight > dlg.clientHeight) return;
      e.preventDefault();
    }
    window.addEventListener('wheel', hold, { passive: false });
    window.addEventListener('touchmove', hold, { passive: false });
    dlg.addEventListener('keydown', function (e) {
      if (/^(ArrowUp|ArrowDown|PageUp|PageDown|Home|End)$/.test(e.key) ||
          (e.key === ' ' && !e.target.closest('button, a'))) e.preventDefault();
    });
    // A click on the dimmed page around the panel closes it too.
    dlg.addEventListener('click', function (e) {
      if (e.target !== dlg) return;
      var r = dlg.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dlg.close();
    });
  })();

  /* ---------- Run modes: the rim takes turns, both modes have their case ---------- */

  (function costRim() {
    var grid = document.querySelector('[data-cost]');
    if (!grid || still() || !('IntersectionObserver' in window)) return;
    var cards = [].slice.call(grid.querySelectorAll('.cost-card'));
    grid.classList.add('is-cycling');   // a phone shows one card and swaps its content (n.css)
    var at = cards.findIndex(function (c) { return c.classList.contains('is-lit'); });
    var timer = null;
    function turn() {
      at = (at + 1) % cards.length;
      cards.forEach(function (c, i) { c.classList.toggle('is-lit', i === at); });
    }
    // Only while the cards are on screen.
    new IntersectionObserver(function (es) {
      clearInterval(timer);
      if (es[0].isIntersecting) timer = setInterval(turn, 6000);
    }).observe(grid);
  })();

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
