/* The dotted globe from the landing page (js/app.js, the #10 country
   globe), carried over without its country labels.

   The land is the one-degree bitmask in globe.data.js. Points are a
   Fibonacci scatter over the sphere, kept where the mask says land; each
   frame they are spun, tilted, dropped to 2D, and filled in six depth
   buckets (six fills a frame rather than one per dot). The pointer moves a
   target and the globe eases toward it, which is what gives it weight.

   Mounts into every [data-globe] holding a <canvas>. Draws only while on
   screen; under reduced motion it sits still but can still be turned. */
(function () {
  'use strict';

  var POINTS = 15000;      // candidates before the land mask thins them
  var SPIN = 0.0007;       // radians a frame, left to itself
  var TILT = -0.32;        // radians, north turned toward the viewer
  var DEPTH_STEPS = 6;     // depth buckets, and so fills per frame
  var DRAG = 0.0030;       // radians of heading per px of pointer
  var DRAG_Y = 0.0022;     // the tilt takes less
  var EASE = 0.11;         // share of the remaining gap closed per frame
  var GLIDE = 0.92;        // how a throw runs down after release

  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var landBits = null;
  function landAt(lat, lon) {
    var L = window.SC4_LAND;
    if (!L) return true;
    if (!landBits) {
      var raw = atob(L.bits);
      landBits = new Uint8Array(raw.length);
      for (var i = 0; i < raw.length; i++) landBits[i] = raw.charCodeAt(i);
    }
    var row = Math.min(L.rows - 1, Math.max(0, Math.floor(90 - lat)));
    var col = Math.min(L.cols - 1, Math.max(0, Math.floor(lon + 180)));
    var bit = row * L.cols + col;
    return !!(landBits[bit >> 3] & (128 >> (bit & 7)));
  }

  function spherePoints(n) {
    var pts = [];
    var golden = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) {
      var y = 1 - (i / (n - 1)) * 2;
      var r = Math.sqrt(Math.max(0, 1 - y * y));
      var a = golden * i;
      var x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (landAt(Math.asin(y) * 180 / Math.PI, Math.atan2(z, x) * 180 / Math.PI)) pts.push(x, y, z);
    }
    return new Float32Array(pts);
  }

  var geometry = null;

  function mount(root) {
    var canvas = root.querySelector('canvas');
    var ctx = canvas && canvas.getContext && canvas.getContext('2d');
    if (!ctx) return;
    if (!geometry) geometry = spherePoints(POINTS);
    var pts = geometry;

    // The dot colour comes from the stylesheet (--globe-dot).
    var ink = (getComputedStyle(root).getPropertyValue('--globe-dot') || '').trim() || '#B4B4B9';

    var heading = 0, tilt = TILT, wantHeading = 0, wantTilt = TILT, glide = 0;
    var dragging = false, lastX = 0, lastY = 0;
    var W = 0, H = 0, R = 0, cx = 0, cy = 0, dpr = 1, dot = 1.6;
    var visible = false, running = false;

    function measure() {
      var box = canvas.getBoundingClientRect();
      if (!box.width || !box.height) return false;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.round(box.width); H = Math.round(box.height);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(W, H) / 2 * 0.92;   // the halo's rim ring is placed for this
      cx = W / 2; cy = H / 2;
      dot = Math.max(1, R / 150);     // the texture reads the same at any size
      return true;
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var cosH = Math.cos(heading), sinH = Math.sin(heading);
      var cosT = Math.cos(tilt), sinT = Math.sin(tilt);
      var buckets = [];
      for (var b = 0; b < DEPTH_STEPS; b++) buckets.push([]);
      for (var i = 0; i < pts.length; i += 3) {
        var x = pts[i], y = pts[i + 1], z = pts[i + 2];
        var rx = x * cosH + z * sinH;
        var rz = -x * sinH + z * cosH;
        var ry = y * cosT - rz * sinT;
        var rzz = y * sinT + rz * cosT;
        if (rzz <= 0.02) continue;              // facing away
        buckets[Math.min(DEPTH_STEPS - 1, (rzz * DEPTH_STEPS) | 0)].push(cx + rx * R, cy - ry * R);
      }
      ctx.fillStyle = ink;
      for (var d = 0; d < DEPTH_STEPS; d++) {
        var pt = buckets[d];
        if (!pt.length) continue;
        // Nearer dots read stronger: the only cue that it is a sphere.
        ctx.globalAlpha = 0.22 + 0.78 * ((d + 0.5) / DEPTH_STEPS);
        ctx.beginPath();
        for (var p = 0; p < pt.length; p += 2) ctx.rect(pt[p] - dot / 2, pt[p + 1] - dot / 2, dot, dot);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function frame() {
      if (!visible && !dragging) { running = false; return; }
      if (!W && !measure()) { requestAnimationFrame(frame); return; }
      if (!dragging) {
        if (Math.abs(glide) > 0.00002) { wantHeading += glide; glide *= GLIDE; }
        else if (!still) wantHeading += SPIN;
      }
      heading += (wantHeading - heading) * EASE;
      tilt += (wantTilt - tilt) * EASE;
      draw();
      requestAnimationFrame(frame);
    }
    function start() {
      if (running) return;
      running = true;
      requestAnimationFrame(frame);
    }

    root.addEventListener('pointerdown', function (e) {
      dragging = true;
      lastX = e.clientX; lastY = e.clientY;
      glide = 0;
      if (root.setPointerCapture) { try { root.setPointerCapture(e.pointerId); } catch (err) { /* unsupported */ } }
      start();
    });
    root.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      wantHeading += dx * DRAG;
      wantTilt = Math.max(-1.2, Math.min(1.2, wantTilt + dy * DRAG_Y));
      glide = dx * DRAG;
    });
    function release(e) {
      if (!dragging) return;
      dragging = false;
      if (root.releasePointerCapture && e && e.pointerId !== undefined) {
        try { root.releasePointerCapture(e.pointerId); } catch (err) { /* gone */ }
      }
      start();
    }
    root.addEventListener('pointerup', release);
    root.addEventListener('pointercancel', release);

    if (window.ResizeObserver) new ResizeObserver(function () { measure(); if (!running) draw(); }).observe(canvas);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible) start();
      }).observe(root);
    } else { visible = true; start(); }
  }

  [].forEach.call(document.querySelectorAll('[data-globe]'), mount);
})();
