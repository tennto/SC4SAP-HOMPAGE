/* ============================================================
   scroll-film.js — the mascot film in #film, played by the scrollbar.

   Three generated clips (39 s) were cut into one numbered WebP sequence
   of 468 frames at 12 fps, so they play as a single timeline. A sequence
   rather than a <video> because seeking a video backwards is what stutters:
   every step has to decode forward from the last keyframe.

   Each clip starts and ends on empty black, so the joins do not show.

   Without this script, with reduced motion or with data saving on, the
   section stays as it is in the HTML: captions beside still frames.
   ============================================================ */

(function () {
  var root = document.getElementById('film');
  if (!root) return;

  var BASE = new URL('../assets/scroll-film/', document.currentScript.src).href;
  var FRAMES = 468;
  var FPS = 12;
  /* The first clip's frames: 1920 wide in the d set, drawn full-stage. */
  var OPENING_FRAMES = 144;
  var FRAME_W = { d: 1280, m: 720 };
  /* The film ends here; the rest of the scroll holds the last frame so
     the closing copy can be read and its buttons reached. */
  var FILM_END = 0.94;
  /* Share of the frame's width shown on a portrait screen. The frame is
     letterboxed into pure black rather than cropped hard to the mascot. */
  var PORTRAIT_SHOW = 0.72;
  /* Vertical centre of the picture on a portrait screen, above the copy. */
  var PORTRAIT_Y = 0.38;
  /* [seconds, horizontal centre of the view]: follows the mascot on a
     portrait screen. The jumps sit where the frame is empty black. */
  var FOCUS = [[0, 0.5], [12, 0.5], [12.1, 0.36], [19.4, 0.36], [19.7, 0.66],
    [26.9, 0.66], [27.1, 0.5], [35.8, 0.5], [37.15, 0.36], [39.25, 0.36]];
  /* Time constant of the smoothing, in ms. Per time rather than per frame,
     or a slow device would trail far behind the scrollbar. */
  var SMOOTH_MS = 200;

  var saveData = navigator.connection && navigator.connection.saveData;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || saveData) return;

  var stage = root.querySelector('.film-stage');
  var canvas = root.querySelector('.film-canvas');
  var bar = root.querySelector('.film-load span');
  var ctx = canvas && canvas.getContext('2d', { alpha: false });
  if (!ctx || !('IntersectionObserver' in window)) return;

  root.classList.add('is-live');

  var beats = [].slice.call(root.querySelectorAll('.film-beat')).map(function (el) {
    return { el: el, from: +el.dataset.in, to: +el.dataset.out || Infinity, band: !el.classList.contains('film-beat--end') };
  });

  var images = new Array(FRAMES);
  var loaded = new Array(FRAMES);
  var loadedCount = 0;
  var started = false;
  var running = false;
  var current = 0;
  var lastTick = 0;
  var drawn = -1;
  var dirty = true;
  var portrait = false;
  var pinned = false;
  var armed = false;
  /* Tunables live on .film in css/scroll-film.css. */
  var styles = getComputedStyle(root);
  var PICTURE_W = parseFloat(styles.getPropertyValue('--film-picture-width'));
  var PICTURE_H = parseFloat(styles.getPropertyValue('--film-picture-height'));
  var MAX_UPSCALE = parseFloat(styles.getPropertyValue('--film-max-upscale'));
  var OPENING_SCALE = parseFloat(styles.getPropertyValue('--film-opening-scale'));
  var FEATHER = parseFloat(styles.getPropertyValue('--film-feather'));
  var mask = null;

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  function frameUrl(set, i) {
    return BASE + set + '/' + String(i + 1).padStart(4, '0') + '.webp';
  }

  /* Every 8th frame first, then the gaps: the whole film can be scrubbed
     early, and it sharpens as the rest arrives. */
  function loadOrder() {
    var seen = {}, order = [];
    [8, 4, 2, 1].forEach(function (step) {
      for (var i = 0; i < FRAMES; i += step) {
        if (!seen[i]) { seen[i] = true; order.push(i); }
      }
    });
    if (!seen[FRAMES - 1]) order.push(FRAMES - 1);
    return order;
  }

  function startLoading() {
    if (started) return;
    started = true;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var set = portrait || stage.clientWidth * dpr < 900 ? 'm' : 'd';
    var order = loadOrder();
    var next = 0;

    function pump() {
      if (next >= order.length) return;
      var i = order[next++];
      var img = new Image();
      images[i] = img;
      img.onload = function () {
        loaded[i] = true;
        loadedCount++;
        dirty = true;
        finish();
      };
      img.onerror = finish;
      img.src = frameUrl(set, i);
    }

    function finish() {
      bar.style.transform = 'scaleX(' + loadedCount / FRAMES + ')';
      if (loadedCount === FRAMES) root.classList.add('is-loaded');
      pump();
    }

    for (var n = 0; n < 6; n++) pump();
  }

  /* The closest frame that has arrived, so a fast scroll never blanks. */
  function nearest(i) {
    for (var d = 0; d < FRAMES; d++) {
      if (loaded[i - d]) return i - d;
      if (loaded[i + d]) return i + d;
    }
    return -1;
  }

  function focusAt(t) {
    for (var k = 1; k < FOCUS.length; k++) {
      if (t <= FOCUS[k][0]) {
        var a = FOCUS[k - 1], b = FOCUS[k];
        return a[1] + (b[1] - a[1]) * (t - a[0]) / (b[0] - a[0]);
      }
    }
    return FOCUS[FOCUS.length - 1][1];
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(stage.clientWidth * dpr);
    canvas.height = Math.round(stage.clientHeight * dpr);
    portrait = stage.clientWidth < stage.clientHeight;
    dirty = true;
  }

  function draw(index, t) {
    var img = images[index];
    var cw = canvas.width, ch = canvas.height;
    var iw = img.naturalWidth, ih = img.naturalHeight;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, cw, ch);
    ctx.imageSmoothingQuality = 'high';

    if (!portrait) {
      /* The opening clip is sharp enough to fill the stage. It ends on empty
         black, so the change of size to the next clip does not show. */
      if (index < OPENING_FRAMES) {
        var cover = Math.max(cw / iw, ch / ih) * OPENING_SCALE;
        var cwid = Math.round(iw * cover), chei = Math.round(ih * cover);
        var cx = Math.round((cw - cwid) / 2), cy = Math.round((ch - chei) / 2);
        ctx.drawImage(img, cx, cy, cwid, chei);
        ctx.drawImage(featherMask(), cx, cy, cwid, chei);
        return;
      }

      /* Sized to stay close to the frame's own pixels, floating on black. */
      var fit = Math.min(cw * PICTURE_W / iw, ch * PICTURE_H / ih, MAX_UPSCALE);
      /* Whole pixels: on a fractional edge the bright last column of the
         frame shows through the fade as a thin line. */
      var fw = Math.round(iw * fit), fh = Math.round(ih * fit);
      var fx = Math.round((cw - fw) / 2), fy = Math.round((ch - fh) / 2);
      ctx.drawImage(img, fx, fy, fw, fh);
      ctx.drawImage(featherMask(), fx, fy, fw, fh);
      return;
    }

    var scale = cw / (iw * PORTRAIT_SHOW);
    var w = iw * scale, h = ih * scale;
    var x = clamp(cw / 2 - focusAt(t) * w, cw - w, 0);
    var y = ch * PORTRAIT_Y - h / 2;
    ctx.drawImage(img, x, y, w, h);
    fadeEdges(0, y, cw, h);
  }

  /* A black veil that is clear in the middle and solid at the frame's edge.
     Rounded and eased, where four straight gradients would draw a box.
     Small and stretched, since it only holds a slow falloff. */
  function featherMask() {
    if (mask) return mask;
    var W = 256, H = 144, start = 1 - FEATHER;
    mask = document.createElement('canvas');
    mask.width = W;
    mask.height = H;
    var mctx = mask.getContext('2d');
    var data = mctx.createImageData(W, H);
    for (var py = 0; py < H; py++) {
      for (var px = 0; px < W; px++) {
        var u = Math.abs(px / (W - 1) * 2 - 1), v = Math.abs(py / (H - 1) * 2 - 1);
        var d = Math.pow(Math.pow(u, 8) + Math.pow(v, 8), 0.125);
        var s = clamp((d - start) / FEATHER, 0, 1);
        data.data[(py * W + px) * 4 + 3] = Math.round(255 * s * s * (3 - 2 * s));
      }
    }
    mctx.putImageData(data, 0, 0);
    return mask;
  }

  /* Portrait: the picture spans the width, so only top and bottom fade. */
  function fadeEdges(x, y, w, h) {
    var fade = h * 0.16;
    edge(x, y, w, fade, 0, fade, false);
    edge(x, y + h - fade, w, fade, 0, fade, true);
  }

  function edge(x, y, w, h, dx, dy, closing) {
    var g = ctx.createLinearGradient(x, y, x + dx, y + dy);
    g.addColorStop(closing ? 1 : 0, '#000');
    g.addColorStop(closing ? 0 : 1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  }

  function setBeats(t) {
    var band = false;
    beats.forEach(function (b) {
      var on = t >= b.from && t <= b.to;
      b.el.classList.toggle('is-on', on);
      if (on && b.band) band = true;
    });
    root.classList.toggle('has-band', band);
  }

  /* The first pull of the scroll plays the whole opening clip. Further pulls
     wait until it ends, and scrolling up takes the wheel back at any time. */
  var OPENING_SPEED = parseFloat(styles.getPropertyValue('--film-opening-speed'));
  var openingReady = false;
  var playing = false;
  var touchY = 0;

  function finishOpening(box) {
    playing = false;
    var end = OPENING_FRAMES - 1;
    var distance = (box.height - stage.clientHeight) * FILM_END * end / (FRAMES - 1);
    window.scrollTo({ top: box.top + window.scrollY + distance, behavior: 'instant' });
  }

  window.addEventListener('wheel', function (e) {
    if (!playing) return;
    if (e.deltaY < 0) playing = false;
    else e.preventDefault();
  }, { passive: false });

  window.addEventListener('keydown', function (e) {
    if (!playing) return;
    if (['ArrowUp', 'PageUp', 'Home'].indexOf(e.key) >= 0) playing = false;
    else if (['ArrowDown', 'PageDown', 'End', ' '].indexOf(e.key) >= 0) e.preventDefault();
  });

  window.addEventListener('touchstart', function (e) {
    touchY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchmove', function (e) {
    if (!playing) return;
    if (e.touches[0].clientY > touchY) playing = false;
    else if (e.cancelable) e.preventDefault();
  }, { passive: false });

  function setPinned(on) {
    if (on === pinned) return;
    pinned = on;
    document.documentElement.classList.toggle('film-pinned', on);
  }

  function progress() {
    var rect = root.getBoundingClientRect();
    return clamp(-rect.top / (rect.height - stage.clientHeight), 0, 1);
  }

  function tick(now) {
    if (!running) return;
    requestAnimationFrame(tick);

    var elapsed = lastTick ? now - lastTick : 16;
    lastTick = now;
    var box = root.getBoundingClientRect();
    setPinned(box.top <= 0 && box.bottom >= stage.clientHeight);
    var target = Math.min(progress() / FILM_END, 1) * (FRAMES - 1);

    /* Armed only by arriving from above; a jump into the middle stays scrubbed. */
    if (box.top > 0) openingReady = true;
    else if (openingReady && box.top < 0) {
      openingReady = false;
      playing = target < OPENING_FRAMES - 1;
    }

    if (playing) {
      current += Math.min(elapsed, 100) / 1000 * FPS * OPENING_SPEED;
      if (current >= OPENING_FRAMES - 1) {
        current = OPENING_FRAMES - 1;
        finishOpening(box);
      }
    } else {
      current += (target - current) * (1 - Math.exp(-elapsed / SMOOTH_MS));
      if (Math.abs(target - current) < 0.05) current = target;
    }

    var wanted = Math.round(current);
    var t = wanted / FPS;
    var show = nearest(wanted);
    if (show >= 0 && (show !== drawn || dirty)) {
      draw(show, t);
      drawn = show;
      dirty = false;
    }
    setBeats(t);
    /* Captions fade only once they hold their first real state; otherwise
       they all start visible and fade out together on arrival. */
    if (!armed) {
      armed = true;
      requestAnimationFrame(function () { root.classList.add('is-armed'); });
    }
  }

  new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) startLoading();
  }, { rootMargin: '150% 0px' }).observe(root);

  new IntersectionObserver(function (entries) {
    var visible = entries[0].isIntersecting;
    if (visible && !running) {
      running = true;
      lastTick = 0;
      /* Coming back from afar should not play the distance as a rewind. */
      current = Math.min(progress() / FILM_END, 1) * (FRAMES - 1);
      requestAnimationFrame(tick);
    } else if (!visible) {
      running = false;
      playing = false;
      openingReady = false;
      setPinned(false);
    }
  }).observe(root);

  /* Tabbing to a closing button takes the reader to where it is visible. */
  root.addEventListener('focusin', function () {
    var rect = root.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + rect.bottom - stage.clientHeight);
  });

  window.addEventListener('resize', resize, { passive: true });
  resize();
})();
