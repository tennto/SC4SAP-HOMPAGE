/* Fibre Arc (Originkit), ported from the React component to plain WebGL.
   The fragment shader is the original; the props are the preset the user
   supplied (base #50777C, accent #D3FFEB, density 19, direction 11deg,
   hover 174, reach 40, curve 20, spread 100, thickness 100, comb 170).
   The background is the page's black so the canvas has no visible edge.
   Mounts into every [data-fibre]. It draws only while on screen, and once,
   still, under reduced motion. */
(function () {
  'use strict';

  var MAX_DPR = 2;

  var VERT = 'attribute vec2 a_pos;\nvoid main() { gl_Position = vec4(a_pos, 0.0, 1.0); }';

  var FRAG = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH',
    'precision highp float;',
    '#else',
    'precision mediump float;',
    '#endif',
    'uniform vec2  uRes;',
    'uniform float uTime;',
    'uniform vec2  uMouse;',
    'uniform float uHover;',
    'const float PI  = 3.14159265;',
    'const float TAU = 6.28318531;',
    'float sat(float x){ return clamp(x, 0.0, 1.0); }',
    'float pw(float x, float e){ return pow(max(x, 1e-5), e); }',
    'float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 34.56); return fract(p.x * p.y); }',
    'uniform vec3 uBg, uBase, uAccent, uHigh;',
    'uniform float uStrands, uCurve, uSpread, uThin, uComb, uReach, uDir;',
    'void main(){',
    '  float ar = uRes.x / max(uRes.y, 1.0);',
    '  vec2 uv = gl_FragCoord.xy / uRes;',
    '  vec2 p = (uv - 0.5) * vec2(ar, 1.0);',
    '  float t = uTime;',
    '  vec2 apex = vec2(0.34, 0.20);',
    '  float cs = cos(uDir), sn = sin(uDir);',
    '  mat2 rot = mat2(cs, sn, -sn, cs);',
    '  vec2 q  = rot * p;',
    '  vec2 pm = q - rot * ((uMouse - 0.5) * vec2(ar, 1.0));',
    '  vec2 ps = q - normalize(pm + vec2(1e-5)) * uComb * 0.10 * sat(uHover)',
    '            * exp(-dot(pm, pm) / max(uReach * uReach, 1e-4));',
    '  float core = 0.0, halo = 0.0;',
    '  for(int i = 0; i < 26; i++){',
    '    float fi = float(i);',
    '    float f = fi / 25.0;',
    '    float on = sat(uStrands - fi);',
    '    float jit = hash21(vec2(fi, 1.7));',
    '    float k = uCurve * (0.55 + 1.30 * f + 0.10 * jit);',
    '    float ax = apex.x + (f - 0.5) * uSpread * 0.18;',
    '    float ay = apex.y + (f - 0.5) * uSpread * 0.14 + 0.012 * sin(t * 0.5 + fi);',
    '    float dx = ps.x - ax;',
    '    float yc = ay - k * dx * dx;',
    '    float sl = -2.0 * k * dx;',
    '    float dd = abs(ps.y - yc) / sqrt(1.0 + sl * sl);',
    '    float w = uThin * (0.0016 + 0.0032 * jit);',
    '    core += on * pw(w / (w + dd), 3.2);',
    '    halo += on * pw(w * 11.0 / (w * 11.0 + dd), 1.9) * 0.085;',
    '  }',
    '  float env = mix(0.20, 1.0, sat((ps.x + 0.52) / 0.95));',
    '  core *= env; halo *= env;',
    '  vec3 col = uBg;',
    '  col += uBase * halo * 1.5;',
    '  col += mix(uAccent, uHigh, sat(core * 0.75)) * core * 1.4;',
    '  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);',
    '}'
  ].join('\n');

  function hex(h) {
    return [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
  }

  // The preset, already scaled the way the component scales its props.
  var P = {
    bg: hex('#000000'),
    base: hex('#50777C'),
    accent: hex('#D3FFEB'),
    high: hex('#FFFFFF'),
    strands: 19,
    speed: 100 / 50,
    dir: 11 * Math.PI / 180,
    hover: 174 / 100,
    reach: 40 / 100,
    curve: 20 / 100,
    spread: 100 / 100,
    thin: 100 / 100,
    comb: 170 / 100
  };

  function compile(gl, type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error('FibreArc shader:', gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  }

  function mount(host) {
    var canvas = document.createElement('canvas');
    host.appendChild(canvas);
    var gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false });
    if (!gl) return;
    var vs = compile(gl, gl.VERTEX_SHADER, VERT), fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var pos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    var loc = {};
    function u(n) { return n in loc ? loc[n] : (loc[n] = gl.getUniformLocation(prog, n)); }

    // Constant uniforms, set once.
    gl.uniform3f(u('uBg'), P.bg[0], P.bg[1], P.bg[2]);
    gl.uniform3f(u('uBase'), P.base[0], P.base[1], P.base[2]);
    gl.uniform3f(u('uAccent'), P.accent[0], P.accent[1], P.accent[2]);
    gl.uniform3f(u('uHigh'), P.high[0], P.high[1], P.high[2]);
    gl.uniform1f(u('uStrands'), P.strands);
    gl.uniform1f(u('uReach'), P.reach);
    gl.uniform1f(u('uDir'), P.dir);
    gl.uniform1f(u('uCurve'), P.curve);
    gl.uniform1f(u('uSpread'), P.spread);
    gl.uniform1f(u('uThin'), P.thin);
    gl.uniform1f(u('uComb'), P.comb);

    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ptr = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, on: 0, onTarget: 0 };
    var raf = 0, last = performance.now(), clock = 0, visible = false;

    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock = (clock + dt * P.speed) % 3600;

      // The pointer eases in and out, as in the component.
      var k = 1 - Math.exp(-6 * dt);
      ptr.on += (ptr.onTarget - ptr.on) * k;
      ptr.x += ((ptr.onTarget > 0 ? ptr.tx : 0.5) - ptr.x) * k;
      ptr.y += ((ptr.onTarget > 0 ? ptr.ty : 0.5) - ptr.y) * k;

      var dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      var bw = Math.max(1, Math.round(canvas.clientWidth * dpr));
      var bh = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
      gl.viewport(0, 0, bw, bh);

      gl.uniform2f(u('uRes'), bw, bh);
      gl.uniform1f(u('uTime'), clock);
      gl.uniform2f(u('uMouse'), ptr.x, 1 - ptr.y);
      gl.uniform1f(u('uHover'), Math.min(1, ptr.on) * P.hover);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      raf = visible && !still ? requestAnimationFrame(frame) : 0;
    }
    function start() {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function track(e) {
      var r = canvas.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      ptr.tx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      ptr.ty = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      ptr.onTarget = 1;
    }
    if (!still) {
      canvas.addEventListener('pointermove', track);
      canvas.addEventListener('pointerenter', track);
      canvas.addEventListener('pointerleave', function () { ptr.onTarget = 0; });
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible) start();
      }).observe(host);
    } else { visible = true; start(); }
    // A resize while paused still gets a correct still frame.
    window.addEventListener('resize', function () { if (!raf) start(); });
  }

  [].forEach.call(document.querySelectorAll('[data-fibre]'), mount);
})();
