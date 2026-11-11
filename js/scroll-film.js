/* ============================================================
   scroll-film.js — the mascot film in #film, played by the scrollbar.

   Generated clips were cut into one numbered WebP sequence of 1284
   frames, so they play as a single timeline: the opening, the developer
   and consultant, the maintenance scene and its exit, and the project
   leader clip that turns into the closing shot. Each plays at its own
   source rate (SEGMENTS): most sources repeat 3 frames in every 24 to fill
   24 fps, so they hold 21 real frames a second, and taking every other
   frame of that stutters. Past the opening, the sources' near-black
   backgrounds were pressed to pure black, so only a thin edge fade is
   needed. A sequence
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
  var FRAMES = 1284;
  var FPS = 12;
  /* The first clip's frames: 1920 wide in the d set, drawn full-stage. */
  var OPENING_FRAMES = 264;
  /* [first frame, frames a second] for each stretch of the sequence. */
  var SEGMENTS = [
    [0, 22],     // opening: 264 frames in 12 s, its source's 25 repeats taken out
    [264, 21],   // developer and consultant
    [580, 24],   // maintenance scene, a true 24 fps source
    [889, 21],   // its exit, cut in where its first frame best matches; its frames were rescaled (1.5% taller) and brightened 2% to match the scene's
    [995, 21]    // project leader, into the closing shot
  ];
  /* The maintenance scene, its exit included: frames 581 to 995. */
  var MT_FROM = 580;
  /* The project leader clip (frames 996 to 1284). Its times below are PL +
     seconds into the clip as cut: a turn (1.29 s) was taken out, so it turns
     once. */
  var PL_FRAME = 995;
  var PL_FPS = 21;
  /* Where the turn was cut out, as a frame of the sequence: from one angle
     early in the first turn to the same angle in the second. The camera
     pushes in all through, so after the cut the mascot stands CUT_ZOOM times
     taller; see zoomed(). */
  var CUT_AT = PL_FRAME + 216;

  /* Seconds into the film at frame f, and frames a second there. */
  var segStart = [0];
  for (var s = 1; s < SEGMENTS.length; s++) {
    segStart.push(segStart[s - 1] + (SEGMENTS[s][0] - SEGMENTS[s - 1][0]) / SEGMENTS[s - 1][1]);
  }
  function segOf(f) {
    for (var s = SEGMENTS.length - 1; s > 0; s--) if (f >= SEGMENTS[s][0]) return s;
    return 0;
  }
  function timeOf(f) { var s = segOf(f); return segStart[s] + (f - SEGMENTS[s][0]) / SEGMENTS[s][1]; }
  function fpsAt(f) { return SEGMENTS[segOf(f)][1]; }
  var PL = timeOf(PL_FRAME);
  var FRAME_W = { d: 1280, m: 720 };
  /* The film ends here; the rest of the scroll holds the last frame so
     the closing copy can be read and its buttons reached. */
  var FILM_END = 0.94;
  /* Share of the frame's width shown on a portrait screen (a desktop window
     taller than wide, like a tablet's; phones do not get the film). The
     whole frame: some scenes have a mascot at each side. */
  var PORTRAIT_SHOW = 1;
  /* Vertical centre of the picture on a portrait screen: a little above the
     middle, so picture and the copy under it sit centred as a pair. */
  var PORTRAIT_Y = 0.44;
  /* [seconds, horizontal centre of the view]: follows the mascot on a
     portrait screen. The jumps sit where the frame is empty black. */
  var FOCUS = [[0, 0.5], [12, 0.5], [12.1, 0.36], [19.4, 0.36], [19.7, 0.66],
    [26.9, 0.66], [27.1, 0.5], [PL + 11.2, 0.5], [PL + 12, 0.36], [PL + 13.8, 0.36]];
  /* Scenes played with the picture moved sideways and the caption beside
     the mascot: [from, to] seconds, and the tunables on .film that place
     them. Every end sits where the frame is empty black, so the move does
     not show. The developer stands left in the frame, so the picture moves
     left and the caption follows on its right; the consultant mirrors it. */
  var SCENES = [
    { from: 12, to: 19.3, name: 'dev', side: 'left' },
    { from: 19.4, to: 27.04, name: 'con', side: 'right' }
  ];
  /* The project leader scene plays with the picture lifted. It starts on
     empty black, but runs straight on into the closing shot, so the lift
     eases back down over [from, to], as its cards fold away. */
  var LIFT_IN = PL - 0.04;
  var LIFT_OUT = [PL + 7.6, PL + 9];
  /* Time constant of the smoothing, in ms. Per time rather than per frame,
     or a slow device would trail far behind the scrollbar. */
  var SMOOTH_MS = 200;

  var saveData = navigator.connection && navigator.connection.saveData;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || saveData) return;
  /* Phones and touch tablets do not get the film (css/scroll-film.css hides
     the section): playback and the pinned scroll do not hold up there.
     DESKTOP is the inverse of n.js's "handheld" query. The head script
     decides at load, before paint, whether the film stands in for the hero
     (html.has-film). A page opened at a phone's width that is then widened
     to a desktop's gets the film at that moment. */
  var DESKTOP = '(min-width: 761px) and (hover: hover), (min-width: 761px) and (pointer: fine)';
  var html = document.documentElement;
  if (html.classList.contains('has-film')) {
    init();
  } else {
    var desktop = window.matchMedia(DESKTOP);
    var onDesktop = function () {
      if (!desktop.matches) return;
      if (desktop.removeEventListener) desktop.removeEventListener('change', onDesktop);
      else desktop.removeListener(onDesktop);
      html.classList.add('has-film');
      init();
    };
    if (desktop.addEventListener) desktop.addEventListener('change', onDesktop);
    else desktop.addListener(onDesktop);
  }

  function init() {
  var stage = root.querySelector('.film-stage');
  var canvas = root.querySelector('.film-canvas');
  var bar = root.querySelector('.film-load span');
  var ctx = canvas && canvas.getContext('2d', { alpha: false });
  /* Without a canvas or IntersectionObserver the film cannot play: give
     the page its hero back, and the film its plain layout. */
  if (!ctx || !('IntersectionObserver' in window)) {
    document.documentElement.classList.remove('has-film');
    return;
  }

  root.classList.add('is-live');

  /* While the hero is hidden, links to it (#top: the brand, the rail's
     first mark) lead to the film, which then opens the page. A window
     narrowed to a phone's width gets the hero back, and the links with it. */
  var hero = document.getElementById('top');
  var topLinks = [].slice.call(document.querySelectorAll('a[href="#top"]'));
  function syncTopLinks() {
    var heroShown = hero && getComputedStyle(hero).display !== 'none';
    topLinks.forEach(function (a) { a.setAttribute('href', heroShown ? '#top' : '#film'); });
  }
  syncTopLinks();
  window.addEventListener('resize', syncTopLinks, { passive: true });

  /* A reload starts at the top of the page. Restoring the old position
     would glide down through the film (html has smooth scrolling) and play
     it in a rush. A link to a section (#...) still lands there. */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  var beats = [].slice.call(root.querySelectorAll('.film-beat')).map(function (el) {
    return { el: el, from: +el.dataset.in, to: +el.dataset.out || Infinity, band: !el.classList.contains('film-beat--end') && !/film-beat--(beside|before|mt)/.test(el.className) };
  });

  var images = new Array(FRAMES);
  var loaded = new Array(FRAMES);
  var loadedCount = 0;
  var openingLoaded = 0;
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
  var LIFT = parseFloat(styles.getPropertyValue('--film-pl-lift'));
  var DEV_TEXT_INSET = parseFloat(styles.getPropertyValue('--film-dev-text-inset'));
  var DEV_MASCOT_INSET = parseFloat(styles.getPropertyValue('--film-dev-mascot-inset'));
  var CON_TEXT_INSET = parseFloat(styles.getPropertyValue('--film-con-text-inset'));
  var CON_MASCOT_INSET = parseFloat(styles.getPropertyValue('--film-con-mascot-inset'));
  var BLEND = parseFloat(styles.getPropertyValue('--film-blend'));
  var MT_SCALE = parseFloat(styles.getPropertyValue('--film-mt-scale')) || 1;
  var MT_STRETCH = parseFloat(styles.getPropertyValue('--film-mt-stretch')) || 1;
  /* The closing wave, the sequence's last ten frames: the last leads back
     into the first as closely as any two neighbours do. */
  var WAVE = [FRAMES - 10, FRAMES - 1];
  var WAVE_SPEED = parseFloat(styles.getPropertyValue('--film-wave-speed'));
  var waveClock = 0;
  SCENES.forEach(function (sc) {
    sc.edge = parseFloat(styles.getPropertyValue('--film-' + sc.name + '-edge'));
    sc.text = parseFloat(styles.getPropertyValue('--film-' + sc.name + '-text'));
  });
  /* The nav capsule's two ends, as shares of the stage's width: the moved
     pictures and their captions line up with them. */
  var capsule = document.querySelector('.nav-capsule');
  var navL = 0.2, navR = 0.8;
  var besideSet = {};
  /* The closing shot, from the cut mid-turn, frames the mascot close: head
     and feet reach into the edge fade, so it takes a narrower one. */
  var FEATHER_CLOSE = parseFloat(styles.getPropertyValue('--film-feather-close'));
  var masks = {};

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  /* Raise when frames are renumbered or replaced: the files keep their
     names, so without it a browser shows the old frames from its cache. */
  var FRAMES_VERSION = 12;

  function frameUrl(set, i) {
    return BASE + set + '/' + String(i + 1).padStart(4, '0') + '.webp?v=' + FRAMES_VERSION;
  }

  /* The opening first, in order, since it plays as soon as the page opens.
     Then every 8th frame of the rest, then the gaps: the whole film can be
     scrubbed early, and it sharpens as the rest arrives. */
  function loadOrder() {
    var seen = {}, order = [];
    for (var o = 0; o < OPENING_FRAMES; o++) { seen[o] = true; order.push(o); }
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
    /* Always the full set: the film only runs on a desktop's width, where
       the opening fills the stage, and the small set (m, 720 wide) drawn
       that large breaks up. The choice is also made once, so a window
       narrow at first would have kept the small set when widened. */
    var set = 'd';
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
        if (i < OPENING_FRAMES) openingLoaded++;
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

  /* The picture's share of the stage's width: PICTURE_W on a wide screen,
     growing as the screen narrows (with the square root of how much
     narrower than WIDE it is, up to PICTURE_W_MAX), so it does not shrink
     into a small island in the middle. */
  var WIDE = 1920;
  var PICTURE_W_MAX = parseFloat(styles.getPropertyValue('--film-picture-width-max')) || 0.56;
  var pictureShare = PICTURE_W;
  var NARROW_PULL = parseFloat(styles.getPropertyValue('--film-narrow-pull')) || 0;
  var textPull = 0, mascotPull = 0;
  var dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var sw0 = stage.clientWidth;
    pictureShare = sw0 >= WIDE ? PICTURE_W : Math.min(PICTURE_W_MAX, PICTURE_W * Math.sqrt(WIDE / sw0));
    /* Only when it changes: setting a canvas's size clears it. */
    var cwNew = Math.round(stage.clientWidth * dpr), chNew = Math.round(stage.clientHeight * dpr);
    if (canvas.width !== cwNew) canvas.width = cwNew;
    if (canvas.height !== chNew) canvas.height = chNew;
    /* A window taller than wide keeps the desktop layout too: the film only
       runs on desktops, where a tall window is still a desktop's. */
    portrait = false;
    if (capsule) {
      var c = capsule.getBoundingClientRect(), sw = stage.clientWidth;
      navL = c.left / sw;
      navR = c.right / sw;
      /* On a narrower screen the capsule's ends stay far apart while the
         picture and copy do not shrink with it, so the gap between mascot
         and copy opens up. The two are drawn in towards each other by up
         to NARROW_PULL (copy) and half that (mascot), in full by 1024. */
      var pull = clamp((WIDE - sw) / (WIDE - 1024), 0, 1.2);
      textPull = NARROW_PULL * pull;
      mascotPull = NARROW_PULL / 2 * pull;
      setBeside('--film-text-l', navL + CON_TEXT_INSET + textPull);
      setBeside('--film-text-r', 1 - navR + DEV_TEXT_INSET + textPull);
    }
    measureEnd();
    dirty = true;
  }

  /* Where frame `index` goes on the canvas at time t. The layout follows the
     frame (its scene changes only on empty black); the lift and the portrait
     pan follow t, which runs between frames, so they glide. */
  function layout(index, t) {
    var img = images[index];
    var cw = canvas.width, ch = canvas.height;
    var iw = img.naturalWidth, ih = img.naturalHeight;

    if (!portrait) {
      /* The opening clip is sharp enough to fill the stage. It ends on empty
         black, so the change of size to the next clip does not show. */
      if (index < OPENING_FRAMES) {
        var cover = Math.max(cw / iw, ch / ih) * OPENING_SCALE;
        var cwid = Math.round(iw * cover), chei = Math.round(ih * cover);
        return { x: Math.round((cw - cwid) / 2), y: Math.round((ch - chei) / 2), w: cwid, h: chei, feather: true };
      }

      /* Sized to stay close to the frame's own pixels, floating on black. */
      var fit = Math.min(cw * pictureShare / iw, ch * PICTURE_H / ih, MAX_UPSCALE);
      /* Whole pixels: on a fractional edge the bright last column of the
         frame shows through the fade as a thin line. */
      var fw = Math.round(iw * fit), fh = Math.round(ih * fit);
      /* A moved scene puts the mascot's own edge on the capsule's end. */
      var scene = sceneAt(timeOf(index));
      var fx = Math.round((cw - fw) / 2 - endDx * dpr * endShiftAt(t)), fy = Math.round((ch - fh) / 2 - ch * LIFT * liftAt(timeOf(index), t));
      if (scene) {
        fx = scene.side === 'left'
          ? Math.round(cw * (navL + DEV_MASCOT_INSET + mascotPull) - fw * scene.edge)
          : Math.round(cw * (navR - CON_MASCOT_INSET - mascotPull) - fw * scene.edge);
      }
      /* The maintenance scene plays larger, and a touch taller: its source
         renders the mascots slightly squat next to the other clips. */
      if (index >= MT_FROM && index < PL_FRAME) {
        var mw = Math.round(fw * MT_SCALE), mh = Math.round(fh * MT_SCALE * MT_STRETCH);
        fx = Math.round(fx + (fw - mw) / 2);
        fy = Math.round(fy + (fh - mh) / 2);
        fw = mw;
        fh = mh;
      }
      return zoomed({ x: fx, y: fy, w: fw, h: fh, feather: true, scene: scene }, index, t);
    }

    var scale = cw / (iw * PORTRAIT_SHOW);
    var w = iw * scale, h = ih * scale;
    return zoomed({ x: clamp(cw / 2 - focusAt(t) * w, cw - w, 0), y: ch * PORTRAIT_Y - h / 2, w: w, h: h, feather: false }, index, t);
  }

  /* The closing shot and its copy sit centred as a pair, from the mascot's
     left edge to the copy's right edge: the picture moves left by endDx
     (CSS px), measured on the copy's real width in measureEnd(). It slides
     there as the mascot itself steps left, after the turn, so the slide
     reads as part of that step. */
  var END_TEXT_AT = parseFloat(styles.getPropertyValue('--film-end-text-at')) || 0.59;
  var END_BEAR_LEFT = 0.045;
  var endDx = 0;

  function measureEnd() {
    var copy = root.querySelector('.film-beat--end .film-text');
    if (!copy || portrait) return;
    var W = stage.clientWidth, H = stage.clientHeight;
    var fit = Math.min(W * pictureShare / 1280, H * PICTURE_H / 720, MAX_UPSCALE / dpr);
    var pw = 1280 * fit;
    var left = END_BEAR_LEFT * pw, right = END_TEXT_AT * pw + copy.offsetWidth;
    var px = W / 2 - (left + right) / 2;
    endDx = (W - pw) / 2 - px;
    setBeside('--film-end-x', (px + END_TEXT_AT * pw) / W);
    dirty = true;
  }
  var END_SLIDE = [PL + 11.2, PL + 12];

  /* The frames before the cut push in to the size after it over ZOOM_IN
     seconds, so the cut keeps the mascot's size. ZOOM_AT is the point that
     holds still, as shares of the frame, measured on the outline. */
  /* It starts while the mascot stands alone, before it turns. */
  var CUT_ZOOM = 1.203;
  var ZOOM_IN = [PL + 8.57, PL + 10.24];
  var ZOOM_AT = [0.5, 0.59];

  function zoomed(r, index, t) {
    if (index >= CUT_AT || index < PL_FRAME) return r;
    var k = clamp((t - ZOOM_IN[0]) / (ZOOM_IN[1] - ZOOM_IN[0]), 0, 1);
    if (k === 0) return r;
    k = k * k * (3 - 2 * k);
    var z = 1 + (CUT_ZOOM - 1) * k;
    var w = Math.round(r.w * z), h = Math.round(r.h * z);
    r.x = Math.round(r.x + (r.w - w) * ZOOM_AT[0]);
    r.y = Math.round(r.y + (r.h - h) * ZOOM_AT[1]);
    r.w = w;
    r.h = h;
    return r;
  }

  function endShiftAt(t) {
    var k = clamp((t - END_SLIDE[0]) / (END_SLIDE[1] - END_SLIDE[0]), 0, 1);
    return k * k * (3 - 2 * k);
  }

  /* Frame `index`, with frame `next` laid over it at `mix` (0 to 1), so
     the 12 frames a second blend into a smooth play. Frames are only
     blended when they share a place on the stage. */
  function draw(index, t, next, mix) {
    var cw = canvas.width, ch = canvas.height;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, cw, ch);
    ctx.imageSmoothingQuality = 'high';

    var r = layout(index, t);
    ctx.drawImage(images[index], r.x, r.y, r.w, r.h);
    /* The picture's place on the stage, for captions set on it. */
    setBeside('--film-pic-l', r.x / cw);
    setBeside('--film-pic-t', r.y / ch);
    setBeside('--film-pic-w', r.w / cw);
    setBeside('--film-pic-h', r.h / ch);
    if (next >= 0 && mix > 0) {
      var r2 = layout(next, t);
      if (r2.x === r.x && r2.y === r.y && r2.w === r.w && r2.h === r.h) {
        ctx.globalAlpha = mix;
        ctx.drawImage(images[next], r.x, r.y, r.w, r.h);
        ctx.globalAlpha = 1;
      }
    }
    if (r.feather) ctx.drawImage(featherMask(closeShot(index) ? FEATHER_CLOSE : FEATHER), r.x, r.y, r.w, r.h);
    else fadeEdges(0, r.y, cw, r.h);

    if (r.scene) {
      var edge = (r.x + r.w * r.scene.text) / cw;
      if (r.scene.side === 'left') setBeside('--film-beside-x', edge);
      else setBeside('--film-beside-end', 1 - edge);
    }
  }

  /* The caption beside the mascot follows the picture, as a share of the
     stage, so it holds at every window size. */
  function setBeside(prop, share) {
    var v = (share * 100).toFixed(2) + '%';
    if (besideSet[prop] === v) return;
    besideSet[prop] = v;
    root.style.setProperty(prop, v);
  }

  /* 1 while the picture is lifted, 0 when it sits in the middle. */
  /* `at` is the frame's own time, which switches the lift on and off on
     empty black; the ease down follows t, which runs between frames. */
  function liftAt(at, t) {
    if (at < LIFT_IN || at >= LIFT_OUT[1]) return 0;
    if (t <= LIFT_OUT[0]) return 1;
    if (t >= LIFT_OUT[1]) return 0;
    var k = (t - LIFT_OUT[0]) / (LIFT_OUT[1] - LIFT_OUT[0]);
    return 1 - k * k * (3 - 2 * k);
  }

  function sceneAt(t) {
    for (var k = 0; k < SCENES.length; k++) {
      if (t >= SCENES[k].from && t <= SCENES[k].to) return SCENES[k];
    }
    return null;
  }

  /* A black veil that is clear in the middle and solid at the frame's edge.
     Rounded and eased, where four straight gradients would draw a box.
     Small and stretched, since it only holds a slow falloff. */
  /* Past the opening the backgrounds are pure black, so the edge fade can
     be thin and stays off the mascots and their props. */
  function closeShot(index) {
    return index >= OPENING_FRAMES;
  }

  function featherMask(feather) {
    if (masks[feather]) return masks[feather];
    var W = 256, H = 144, start = 1 - feather;
    var mask = masks[feather] = document.createElement('canvas');
    mask.width = W;
    mask.height = H;
    var mctx = mask.getContext('2d');
    var data = mctx.createImageData(W, H);
    for (var py = 0; py < H; py++) {
      for (var px = 0; px < W; px++) {
        var u = Math.abs(px / (W - 1) * 2 - 1), v = Math.abs(py / (H - 1) * 2 - 1);
        var d = Math.pow(Math.pow(u, 8) + Math.pow(v, 8), 0.125);
        var s = clamp((d - start) / feather, 0, 1);
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

  /* One pull of the scroll plays the whole film to its end by itself: it
     starts on arrival from above, and a pull downward anywhere in it plays
     on from there. Further pulls wait until it ends, and scrolling up takes
     the wheel back at any time. A list, so the film can be cut into chapters
     again, each from the last one's end frame to its own. */
  var PLAY_SPEED = parseFloat(styles.getPropertyValue('--film-play-speed'));
  var OPENING_SPEED = parseFloat(styles.getPropertyValue('--film-opening-speed'));
  var DC_SPEED = parseFloat(styles.getPropertyValue('--film-dc-speed')) || PLAY_SPEED;
  var CHAPTERS = [
    { end: FRAMES - 1 }
  ];

  function speedAt(frame) {
    if (frame < OPENING_FRAMES) return OPENING_SPEED;
    if (frame < MT_FROM) return DC_SPEED;
    return PLAY_SPEED;
  }
  /* A trackpad keeps sending wheel events after the fingers lift. Those are
     held until the wheel has been quiet this long, so the swipe that started
     the film does not carry on past the closing copy. */
  var QUIET_MS = 350;
  var openingReady = false;
  var playing = null;
  var holding = false;
  var lastWheel = 0;
  var touchY = 0;
  /* Played through once: the film folds to its last screen for the rest of
     the visit, so scrolling back up never plays it in reverse. */
  var done = false;
  var autoStart = true;

  function finishChapter(box) {
    var end = playing.end;
    playing = null;
    holding = true;
    if (end === FRAMES - 1) {
      /* The section shrinks to one screen at its own top, where the stage
         already sits, so nothing on screen moves. */
      var top = box.top + window.scrollY;
      done = true;
      root.classList.add('is-done');
      window.scrollTo({ top: top, behavior: 'instant' });
      return;
    }
    var distance = (box.height - stage.clientHeight) * FILM_END * end / (FRAMES - 1);
    window.scrollTo({ top: box.top + window.scrollY + distance, behavior: 'instant' });
  }

  /* The chapter the scroll position sits in, if a pull down should play it. */
  function chapterAhead() {
    if (!pinned || done) return null;
    var at = Math.min(progress() / FILM_END, 1) * (FRAMES - 1);
    for (var k = 0; k < CHAPTERS.length; k++) {
      var from = k ? CHAPTERS[k - 1].end : 0;
      if (at >= from - 0.5 && at < CHAPTERS[k].end - 0.5) return CHAPTERS[k];
    }
    return null;
  }

  /* A pull downward: plays the chapter ahead, or is swallowed while one
     plays. Returns whether the page should stay where it is. */
  function pullDown() {
    if (playing) return true;
    var next = chapterAhead();
    if (!next) return false;
    playing = next;
    return true;
  }

  window.addEventListener('wheel', function (e) {
    var now = performance.now();
    var quiet = now - lastWheel > QUIET_MS;
    lastWheel = now;
    /* While it plays, the wheel does nothing either way. */
    if (playing) { e.preventDefault(); return; }
    if (e.deltaY < 0) { holding = false; return; }
    if (holding && !quiet) { e.preventDefault(); return; }
    holding = false;
    if (pullDown()) e.preventDefault();
  }, { passive: false });

  window.addEventListener('keydown', function (e) {
    var up = ['ArrowUp', 'PageUp', 'Home'].indexOf(e.key) >= 0;
    var down = ['ArrowDown', 'PageDown', 'End', ' '].indexOf(e.key) >= 0;
    if (playing && (up || down)) e.preventDefault();
    else if (down && pullDown()) e.preventDefault();
  });

  window.addEventListener('touchstart', function (e) {
    touchY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchmove', function (e) {
    if (playing) { if (e.cancelable) e.preventDefault(); return; }
    if (e.touches[0].clientY > touchY) return;
    if (pullDown() && e.cancelable) e.preventDefault();
  }, { passive: false });

  function setPinned(on) {
    if (on === pinned) return;
    pinned = on;
    document.documentElement.classList.toggle('film-pinned', on);
  }

  function progress() {
    if (done) return 1;
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

    /* At the top of the page the film plays as soon as its opening has
       arrived, without waiting for a scroll. Once per visit. */
    if (autoStart && !playing && !done) {
      if (window.scrollY > 0 || box.top < 0) autoStart = false;
      else if (openingLoaded >= OPENING_FRAMES) { autoStart = false; playing = CHAPTERS[0]; }
    }

    /* Armed only by arriving from above; a jump into the middle stays scrubbed. */
    if (box.top > 0) openingReady = true;
    else if (openingReady && box.top < 0) {
      openingReady = false;
      if (target < OPENING_FRAMES - 1) playing = CHAPTERS[0];
    }

    if (playing) {
      current += Math.min(elapsed, 100) / 1000 * fpsAt(current) * speedAt(current);
      if (current >= playing.end) {
        current = playing.end;
        finishChapter(box);
      }
    } else {
      current += (target - current) * (1 - Math.exp(-elapsed / SMOOTH_MS));
      if (Math.abs(target - current) < 0.05) current = target;
    }

    /* Between two frames, both are drawn, blended by how far along it is.
       Until both have arrived, the nearest one that has is drawn alone. */
    var base = Math.floor(current);
    var frac = current - base;
    var t = timeOf(base + frac);
    /* At rest the nearest frame is shown alone, sharp. In motion the blend
       is held to the middle of the step (BLEND wide), so each frame is seen
       clean most of the time and only the change between them is softened. */
    var mix = 0;
    if (playing || Math.abs(target - current) >= 0.05) {
      mix = BLEND > 0 ? clamp((frac - (1 - BLEND) / 2) / BLEND, 0, 1) : (frac >= 0.5 ? 1 : 0);
      mix = Math.round(mix * 20) / 20;
    } else if (frac >= 0.5) {
      base += 1;
    }
    var after = base + 1;

    /* Held on the last frame, the mascot keeps waving: WAVE is one swing,
       whose last frame leads back into its first as any two frames do. */
    if (!playing && current >= FRAMES - 1.05) {
      waveClock += elapsed;
      var span = WAVE[1] - WAVE[0] + 1;
      var pos = (span - 1 + waveClock / 1000 * PL_FPS * WAVE_SPEED) % span;
      base = WAVE[0] + Math.floor(pos);
      after = base === WAVE[1] ? WAVE[0] : base + 1;
      frac = pos - Math.floor(pos);
      mix = BLEND > 0 ? clamp((frac - (1 - BLEND) / 2) / BLEND, 0, 1) : (frac >= 0.5 ? 1 : 0);
      mix = Math.round(mix * 20) / 20;
    } else {
      waveClock = 0;
    }

    if (mix === 1) { base = after; after = base + 1; mix = 0; }
    var show = loaded[base] ? base : nearest(Math.round(current));
    var next = show === base && mix > 0 && loaded[after] ? after : -1;
    var key = show + (next >= 0 ? mix : 0);
    if (show >= 0 && (key !== drawn || dirty)) {
      draw(show, t, next, mix);
      drawn = key;
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
      /* Back at the top of the page, unplayed (say, a window narrowed to a
         phone's width mid-film and widened again): play it from there. */
      if (!done && window.scrollY === 0) autoStart = true;
      requestAnimationFrame(tick);
    } else if (!visible) {
      running = false;
      playing = null;
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
  /* The layout is measured on the stage, the nav capsule and the closing
     copy, and right after a load those change size without the window
     doing so: the web fonts arrive (the capsule and the copy re-set), the
     scrollbar appears as the page grows. Each change is measured again;
     otherwise a reload could leave the picture stretched and the captions
     off their marks, differently each time. */
  if ('ResizeObserver' in window) {
    var reMeasure = new ResizeObserver(function () { resize(); });
    reMeasure.observe(stage);
    if (capsule) reMeasure.observe(capsule);
    var endCopy = root.querySelector('.film-beat--end .film-text');
    if (endCopy) reMeasure.observe(endCopy);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
  }
})();
