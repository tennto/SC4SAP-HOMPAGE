/* Stardrift Sphere (Originkit), ported from its React component to plain
   canvas for the analyze section's "묻는만큼 쌓이고" picture: a dotted
   sphere slowly turning, streaks falling into it, small splashes where
   they land. Same maths and the same preset the component shipped with;
   drag is off in that preset and is left out. Mounts on every
   [data-stardrift], draws only while on screen, and holds one still frame
   under reduced motion. */
(function () {
  'use strict';

  var TAU = Math.PI * 2;
  var GREYS = [42, 76, 113, 165, 203, 249].map(function (v) { return v / 249; });

  // The component's preset, merged over its defaults (its black fill dropped).
  var P = {
    speed: 64, scale: 115, density: 210, sphereDensity: 6000, streakLength: 53,   // scale: 83 in the preset, larger here
    color: '#889490', hoverIntensity: 11
  };
  var A = {
    cycleMs: 3100, centerX: 50, centerY: 50, sphereRadius: 20, shellThickness: 20,
    lumpiness: 0, rimBrightness: 55, faceBrightness: 22, backBrightness: 14,
    dotSize: 3, brightDotShare: 3, brightDotSize: 4, clusterCount: 36, clusterSize: 14,
    flicker: 60, autoRotate: 6, pointDrift: 20, dropCount: 6, splashCount: 5,
    dropRate: 12, approachShare: 18, splashReach: 20, nearDepth: 30, farDepth: 150,
    spreadMin: 30, spreadMax: 260, streakWidth: 3, farBrightness: 70, trailMs: 100,
    maxTrail: 50, gapStart: 35, gapEnd: 85, fadeIn: 6, fadeOut: 12, softEdge: 2, seed: 7
  };

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function smooth(x) { var t = clamp01(x); return t * t * (3 - 2 * t); }
  function smoothstep(a, b, x) { return smooth((x - a) / (b - a)); }
  function fract(x) { return x - Math.floor(x); }
  function hash(n) { var x = Math.sin(n * 12.9898) * 43758.5453123; return x - Math.floor(x); }

  function buildStreaks(n, seed, rhoMin, rhoMax) {
    var rnd = mulberry32(seed * 7919 + 13);
    var s = { n: n, cos: new Float32Array(n), sin: new Float32Array(n), rho: new Float32Array(n), p0: new Float32Array(n), laps: new Uint8Array(n) };
    var lo = Math.min(rhoMin, rhoMax), hi = Math.max(rhoMin, rhoMax);
    for (var i = 0; i < n; i++) {
      var a = rnd() * TAU;
      s.cos[i] = Math.cos(a); s.sin[i] = Math.sin(a);
      s.rho[i] = lo + (hi - lo) * Math.pow(rnd(), 1.2);
      s.p0[i] = rnd();
      s.laps[i] = rnd() < 0.35 ? 2 : 1;
    }
    return s;
  }

  function buildSphere(m, seed, shell, lump, brightShare, clusterCount, clusterSize) {
    var rnd = mulberry32(seed * 104729 + 71);
    var xs = [], ys = [], zs = [], us = [], ku = [], bs = [], sz = [], ar = [];
    var i, j;
    for (i = 0; i < m; i++) {
      var z = rnd() * 2 - 1, a = rnd() * TAU, rr = Math.sqrt(1 - z * z);
      var x = Math.cos(a) * rr, y = Math.sin(a) * rr;
      var R = 1 + (rnd() - 0.5) * shell + lump * (0.5 * Math.sin(3 * x + 2 * y + 1) + 0.35 * Math.sin(4 * y - 3 * z + 2) + 0.25 * Math.sin(5 * z + 2 * x));
      if (rnd() < 0.08) R += rnd() * 0.3;
      xs.push(x * R); ys.push(y * R); zs.push(z * R);
      us.push(rnd()); ku.push(rnd());
      bs.push(rnd() < brightShare ? 1 : 0);
      sz.push(0.75 + rnd() * 0.5); ar.push(0.5 + rnd() * 1.5);
    }
    var ringR = clusterSize / 2 / 150;
    for (var c = 0; c < clusterCount; c++) {
      var cz = -1;
      for (var tries = 0; tries < 20; tries++) { cz = rnd() * 2 - 1; if (cz < -0.3) break; }
      var ca = rnd() * TAU, crr = Math.sqrt(Math.max(0, 1 - cz * cz));
      var cx = Math.cos(ca) * crr * 0.92, cy = Math.sin(ca) * crr * 0.92;
      var count = 3 + Math.floor(rnd() * 4), u = rnd(), k = rnd(), rot = rnd() * TAU, rad = ringR * (0.6 + rnd() * 0.8);
      for (j = 0; j < count; j++) {
        var ang = rot + (j / count) * TAU + (rnd() - 0.5) * 0.4;
        xs.push(cx + Math.cos(ang) * rad); ys.push(cy + Math.sin(ang) * rad); zs.push(cz);
        us.push(u); ku.push(k); bs.push(1); sz.push(0.6 + rnd() * 0.25); ar.push(1);
      }
    }
    var n = xs.length;
    return {
      n: n, x: Float32Array.from(xs), y: Float32Array.from(ys), z: Float32Array.from(zs),
      u: Float32Array.from(us), ku: Float32Array.from(ku), sz: Float32Array.from(sz), ar: Float32Array.from(ar),
      px: new Float32Array(n), py: new Float32Array(n), ps: new Float32Array(n), lv: new Int8Array(n)
    };
  }

  function mount(wrap) {
    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    wrap.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var w = 0, h = 0, dpr = 1;
    function resize() {
      w = wrap.offsetWidth; h = wrap.offsetHeight;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      if (!running) draw(0);        // a resized still frame is redrawn, not left blank
    }

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var streaks = buildStreaks(P.density, A.seed, A.spreadMin / 100, A.spreadMax / 100);
    var sphere = buildSphere(P.sphereDensity, A.seed, A.shellThickness / 100, A.lumpiness / 100, A.brightDotShare / 100, A.clusterCount, A.clusterSize);
    var col = { r: 0x88, g: 0x94, b: 0x90 };
    var greys = GREYS.map(function (g) { return 'rgb(' + Math.round(col.r * g) + ',' + Math.round(col.g * g) + ',' + Math.round(col.b * g) + ')'; });

    var t = 0, last = -1, raf = 0, running = false, rotY = 0, rotX = 0, hoverTarget = 0, hoverAmt = 0;
    wrap.addEventListener('pointerenter', function () { hoverTarget = 1; });
    wrap.addEventListener('pointerleave', function () { hoverTarget = 0; });

    function draw(dt) {
      var still = reduced.matches;
      var C = Math.max(0.1, A.cycleMs / 1000);
      hoverAmt += (hoverTarget - hoverAmt) * Math.min(1, dt * 5);
      var hoverMul = 1 + (P.hoverIntensity / 100) * 0.6 * hoverAmt;
      if (still) t = 0; else t += dt * (P.speed / 50) * hoverMul;
      if (!still) rotY += A.autoRotate * (Math.PI / 180) * dt;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, w, h);   // transparent: it sits straight on the page, no box
      if (w < 2 || h < 2) return;

      var cx = (w * A.centerX) / 100, cy = (h * A.centerY) / 100;
      var r = ((Math.min(w, h) * A.sphereRadius) / 100) * (P.scale / 100);
      var ks = r / 150;
      var cosY = Math.cos(rotY), sinY = Math.sin(rotY), cosX = Math.cos(rotX), sinX = Math.sin(rotX);

      // Streaks
      var zN = Math.max(0.05, A.nearDepth / 100), zF = Math.max(zN + 0.05, A.farDepth / 100);
      var trail = (A.trailMs / 1000) * (P.streakLength / 50), maxTrail = (A.maxTrail / 100) * r;
      var halfDiag = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) + 20;
      var fb = A.farBrightness / 100, fi = Math.max(0.001, A.fadeIn / 100), fo = Math.max(0.001, A.fadeOut / 100);
      var g0 = A.gapStart / 100, g1 = Math.max(g0 + 0.01, A.gapEnd / 100), soft = A.softEdge * ks;
      ctx.lineCap = 'round';
      var S = streaks, i;
      for (i = 0; i < S.n; i++) {
        var k = S.laps[i], p = fract(S.p0[i] + (t * k) / C), z = zN + (zF - zN) * p;
        var hd = (r * S.rho[i]) / z;
        if (hd > halfDiag) continue;
        var a = smooth(p / fi) * smooth((1 - p) / fo) * smoothstep(g0, g1, hd / r);
        if (a < 0.01) continue;
        var pt = Math.max(0, p - (trail * k) / C), zt = zN + (zF - zN) * pt;
        var td = (r * S.rho[i]) / zt;
        if (td - hd > maxTrail) td = hd + maxTrail;
        if (td - hd < 0.6) td = hd + 0.6;
        var lum = fb + (1 - fb) * clamp01((zF - z) / (zF - zN));
        var cr = Math.round(col.r * lum), cg = Math.round(col.g * lum), cb = Math.round(col.b * lum);
        var hx = cx + S.cos[i] * hd, hy = cy + S.sin[i] * hd, tx = cx + S.cos[i] * td, ty = cy + S.sin[i] * td;
        var lw = Math.max(0.8, A.streakWidth * ks * Math.pow(0.6 / z, 1.25));
        var grad = ctx.createLinearGradient(tx, ty, hx, hy);
        grad.addColorStop(0, 'rgba(' + cr + ',' + cg + ',' + cb + ',0)');
        grad.addColorStop(0.3, 'rgba(' + cr + ',' + cg + ',' + cb + ',' + (a * 0.4).toFixed(3) + ')');
        grad.addColorStop(0.6, 'rgba(' + cr + ',' + cg + ',' + cb + ',' + (a * 0.9).toFixed(3) + ')');
        grad.addColorStop(1, 'rgba(' + cr + ',' + cg + ',' + cb + ',' + a.toFixed(3) + ')');
        ctx.strokeStyle = grad;
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy);
        if (soft > 0 && lw > 2.5) { ctx.globalAlpha = 0.22; ctx.lineWidth = lw + 2 * soft; ctx.stroke(); }
        ctx.globalAlpha = 1; ctx.lineWidth = lw; ctx.stroke();
      }

      // Sphere
      var Q = sphere, D = 4;
      var rimB = A.rimBrightness / 100, faceB = A.faceBrightness / 100, backB = A.backBrightness / 100;
      var fl = still ? 0 : clamp01(A.flicker / 100);
      var dotBase = A.dotSize * ks;
      var wobAmp = still ? 0 : clamp01(A.pointDrift / 100) * 0.06;
      for (i = 0; i < Q.n; i++) {
        var wob = wobAmp === 0 ? 1 : 1 + wobAmp * Math.sin((t * (1.1 + Q.ku[i] * 2.2) + Q.u[i]) * TAU);
        var px0 = Q.x[i] * wob, py0 = Q.y[i] * wob, pz0 = Q.z[i] * wob;
        var x1 = px0 * cosY + pz0 * sinY, z1 = -px0 * sinY + pz0 * cosY;
        var y2 = py0 * cosX - z1 * sinX, zz = py0 * sinX + z1 * cosX;
        var sc = D / (D + zz);
        Q.px[i] = cx + x1 * r * sc; Q.py[i] = cy + y2 * r * sc;
        var f = zz < 0 ? Math.min(1, -zz) : 0;
        var limbF = 1 - f, limbB = 1 - Math.min(1, Math.max(0, zz));
        var base = zz < 0 ? faceB + (rimB - faceB) * limbF * limbF : backB + (rimB - backB) * Math.pow(limbB, 4);
        Q.lv[i] = base < 0.07 ? -1 : Math.min(5, Math.floor(base * 6));
        Q.ps[i] = Math.max(1, dotBase * (0.6 + 0.4 * f) * Q.sz[i]);
      }
      for (var lvl = 0; lvl < 6; lvl++) {
        ctx.fillStyle = greys[lvl];
        for (i = 0; i < Q.n; i++) {
          if (Q.lv[i] !== lvl) continue;
          var s = Q.ps[i], ax = Math.max(1, s * Q.ar[i]), ay = Math.max(1, s / Q.ar[i]);
          ctx.fillRect(Q.px[i] - ax / 2, Q.py[i] - ay / 2, ax, ay);
        }
      }

      // Drops and their splashes
      var dHz = A.dropRate / 10, dropLife = Math.max(0.5, 2 / Math.max(0.1, dHz * 0.6 + 0.25));
      var approachFrac = clamp01(A.approachShare / 100), bRad = 0.5 * A.brightDotSize * ks;
      for (var d = 0; d < A.dropCount; d++) {
        var phase = t / dropLife + d * 0.3137, cycleIdx = Math.floor(phase), localT = fract(phase);
        var seedBase = d * 101.7 + cycleIdx * 57.13 + A.seed * 9.1;
        var az = hash(seedBase + 1.1) * TAU, z0 = -0.1 - hash(seedBase + 2.2) * 0.75, rr0 = Math.sqrt(Math.max(0, 1 - z0 * z0));
        var p0x = Math.cos(az) * rr0, p0y = Math.sin(az) * rr0, p0z = z0;
        var p0x1 = p0x * cosY + p0z * sinY, p0z1 = -p0x * sinY + p0z * cosY;
        var p0y2 = p0y * cosX - p0z1 * sinX, p0z2 = p0y * sinX + p0z1 * cosX;
        var sc0 = D / (D + p0z2), ipx = cx + p0x1 * r * sc0, ipy = cy + p0y2 * r * sc0;
        var f0 = p0z2 < 0 ? Math.min(1, -p0z2) : 0;
        if (f0 <= 0) continue;
        if (localT < approachFrac) {
          var ap = localT / approachFrac, Lb = (0.72 + 0.28 * f0) * (1 - fl + fl * smooth(ap));
          if (Lb < 0.07) continue;
          ctx.fillStyle = greys[Math.min(5, Math.floor(Lb * 6))];
          ctx.beginPath(); ctx.arc(ipx, ipy, Math.max(0.6, bRad * (0.4 + 0.6 * smooth(ap)) * (0.75 + 0.25 * f0)), 0, TAU); ctx.fill();
          continue;
        }
        var sp = (localT - approachFrac) / (1 - approachFrac), decel = 1 - (1 - sp) * (1 - sp);
        var fade = sp < 0.6 ? 1 : smooth(1 - (sp - 0.6) / 0.4);
        for (var j = 0; j < A.splashCount; j++) {
          var sj = seedBase + j * 7.77, dirAngle = hash(sj + 5.5) * TAU, reach = (A.splashReach / 100) * (0.55 + hash(sj + 6.6) * 0.9);
          var ax0 = -p0y, ay0 = p0x, alen = Math.hypot(ax0, ay0) || 1;
          ax0 /= alen; ay0 /= alen;
          var bx0 = -p0z * ay0, by0 = p0z * ax0, bz0 = p0x * ay0 - p0y * ax0, blen = Math.hypot(bx0, by0, bz0) || 1;
          bx0 /= blen; by0 /= blen; bz0 /= blen;
          var cs = Math.cos(dirAngle), sn = Math.sin(dirAngle);
          var tx2 = ax0 * cs + bx0 * sn, ty2 = ay0 * cs + by0 * sn, tz2 = bz0 * sn;
          var th = reach * decel, ct = Math.cos(th), st = Math.sin(th);
          var sx = p0x * ct + tx2 * st, sy = p0y * ct + ty2 * st, sz = p0z * ct + tz2 * st;
          var sx1 = sx * cosY + sz * sinY, sz1 = -sx * sinY + sz * cosY;
          var sy2 = sy * cosX - sz1 * sinX, sz2 = sy * sinX + sz1 * cosX;
          var sc2 = D / (D + sz2), f2 = sz2 < 0 ? Math.min(1, -sz2) : 0;
          if (f2 <= 0 || fade <= 0.02) continue;
          var Lb2 = (0.72 + 0.28 * f2) * (1 - fl + fl * fade);
          if (Lb2 < 0.07) continue;
          ctx.fillStyle = greys[Math.min(5, Math.floor(Lb2 * 6))];
          ctx.beginPath(); ctx.arc(cx + sx1 * r * sc2, cy + sy2 * r * sc2, Math.max(0.5, bRad * 0.55 * (0.75 + 0.25 * f2) * fade), 0, TAU); ctx.fill();
        }
      }
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      var dt = last < 0 ? 0 : Math.min(1 / 20, Math.max(0, (now - last) / 1000));
      last = now;
      draw(dt);
    }
    function play() { if (running || reduced.matches) return; running = true; last = -1; raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    new ResizeObserver(resize).observe(wrap);
    resize();
    draw(0);
    // Off screen it does not draw at all: the page already runs several shaders.
    new IntersectionObserver(function (es) { es[0].isIntersecting ? play() : stop(); }).observe(wrap);
    reduced.addEventListener('change', function () { if (reduced.matches) { stop(); draw(0); } });
  }

  [].forEach.call(document.querySelectorAll('[data-stardrift]'), mount);
})();
