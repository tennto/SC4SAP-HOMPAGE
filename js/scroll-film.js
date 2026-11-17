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
  if (!ctx || !('IntersectionObserver' in window) || !window.fetch || !window.createImageBitmap) {
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

  /* A frame arrives as a file (blobs), and is decoded off the main thread
     into a bitmap shortly before it is drawn (keepDecoded). Drawing an
     undecoded image decodes it on the spot, and on the first play each of
     those stalled the film. Only a few bitmaps are held at a time: decoded,
     a 1920 frame takes 8 MB. */
  var blobs = new Array(FRAMES);
  var loaded = new Array(FRAMES);   // arrived, or given up on
  var bitmaps = new Array(FRAMES);
  var decoding = new Array(FRAMES);
  var held = [];
  var loadedCount = 0;
  var bytesIn = 0;
  var loadStart = 0;
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

  /* Each frame's size in bytes, and the first frame of each pack in
     assets/scroll-film/p: written by tools/film-pack.mjs. */
  var FRAME_BYTES = /* sizes:start */[3922,3904,3912,3940,4030,3980,3962,4002,4032,4070,4092,4126,4126,4090,4082,4120,4124,4154,4172,4160,4196,4224,4254,4252,4284,4306,4360,4388,4486,4574,4706,4914,5056,5550,5454,5870,5930,5900,5874,6500,6558,7214,6736,6868,7466,7442,7578,7628,8092,8602,9068,9616,9560,9576,10260,10556,10566,11004,10994,11256,10752,11070,11236,11652,11444,11822,11978,12436,11988,11846,12116,11530,11696,11852,11300,11746,11902,11768,12106,11992,12242,12196,12430,12510,13036,13170,12964,13422,14252,13906,13926,14396,14764,14356,14742,14980,14596,14610,14734,13910,14112,14004,13032,12984,12990,13264,12210,12298,12408,12010,11964,12282,12428,12662,13370,13916,14762,15030,14978,14960,15230,15796,15482,16004,16550,17046,15706,15306,15124,13924,13562,12918,12924,12016,11214,11350,11394,12154,12402,12514,12820,12790,13278,12944,13222,13216,13682,13084,13164,13656,13014,13248,13214,13286,13228,13332,13290,13448,13408,13208,13442,13302,13098,13164,13028,13276,12820,12940,12404,11402,10150,9402,8506,9188,8788,9040,9356,9364,9022,9260,9832,9940,10002,10526,10936,10760,11132,11802,11672,11544,16672,32104,34334,33024,33178,34080,33984,35854,36478,37092,35724,32202,32422,33182,33434,35186,37892,36632,32572,31080,34412,37254,37700,32954,28472,25112,17988,25038,33386,32608,30202,31862,23588,18794,16784,13818,11804,10060,7562,4740,4010,3962,4056,3928,3940,3934,3962,3924,3928,3932,3936,3910,3912,3906,3920,3912,3940,3910,3940,3904,3912,3910,3986,3890,3918,3928,3952,3908,3902,3918,3904,3906,3912,3914,1702,1702,1702,1718,5044,8002,8430,8974,8088,8282,9038,8882,8772,8818,8654,8502,8848,8612,8444,8780,8620,8452,8540,8498,8756,8590,8492,8384,9682,10820,10794,12544,12700,12774,12426,12258,11860,11788,12190,12278,11524,11812,11654,12014,12442,12124,12328,12230,12378,12194,12346,12386,12676,13078,13128,13830,13372,13618,13332,13350,13358,13412,13516,13856,14182,14048,14062,14386,14400,14594,15118,15824,15128,15822,15604,15696,15976,16098,16366,16576,16286,16552,16428,16356,16212,16306,16182,16276,17314,17292,16654,17032,16820,16992,17756,16676,16806,17550,17062,16518,16340,17116,16176,16360,16982,17268,18112,18792,19438,22024,21938,21948,24062,23758,23662,25658,25606,27258,30350,28530,26854,26834,26506,24420,23572,22890,23182,20262,18600,16254,12038,11414,10908,9958,9634,9276,8676,8660,8602,8818,8684,9150,9096,9086,8120,6948,5484,4020,2432,1702,1702,1702,1702,1702,1702,1702,1702,2834,3950,5356,7500,8170,8902,9472,10426,10230,10616,11038,11196,10802,11338,11472,11498,11434,11582,11486,11558,11412,11530,11538,11584,11510,11288,11644,11652,11850,11752,12186,11988,11978,11918,11980,11966,11974,11984,11950,12112,12070,12132,11872,12066,11566,11598,11748,11762,11876,11634,11556,11638,11784,11726,11790,11780,11940,12098,12056,12272,12112,12228,12146,11714,11826,11704,11640,11630,11456,11418,11604,11812,12848,13500,14346,15190,16188,16712,17786,18212,18586,19062,19166,18672,19070,19390,19594,19916,19808,20216,20136,20536,20168,20834,21308,21778,21488,21940,21830,22268,22514,22058,21976,22564,22526,22480,22604,22596,22488,22382,22712,22732,22704,22662,22694,22654,22538,22482,22462,22512,22402,22332,22454,22262,21544,20248,19594,18032,16610,13446,10938,9582,8850,8598,8118,7956,8160,8388,8356,8314,8044,8148,7986,7588,6994,6452,6276,5588,5154,4926,4422,4148,3774,3424,3096,2800,2238,1886,1782,1702,1702,1702,1702,1702,1702,1702,1794,1988,2318,2766,3080,3678,4310,5110,5828,6558,7198,8332,9064,9988,10372,11482,11990,13226,13434,13976,14446,15262,15278,16308,16242,16520,16246,16672,16984,17234,17166,17064,17116,17254,17006,17542,17146,17404,17366,17746,17592,17662,17526,17834,17692,17800,17640,18350,17572,17868,17436,17520,17390,17472,17520,17586,17778,17930,17754,17786,17794,17798,17764,17874,17558,17436,17286,17584,17614,17960,17532,17586,17372,17374,17294,17324,17328,17248,17148,17198,17116,17344,17282,17926,18182,18246,17696,17738,17174,17550,16904,17240,17114,17164,16884,17412,17394,17276,17476,17496,17498,17448,17032,17210,17118,17328,17494,17830,17824,17774,17576,17472,17468,17378,17382,17378,17370,17374,17312,17278,17182,17184,17014,17184,17232,17286,17988,17222,17054,16964,17042,17000,17074,17110,17222,17162,17276,17326,17292,17238,17204,17162,17006,17364,17330,17362,17204,17536,17380,17546,17546,17500,17602,17820,17948,17998,18244,18344,18162,18090,18242,18252,18156,18208,17904,17872,17676,17768,17982,18156,17818,17750,17594,17736,17534,17640,17454,17554,17280,17328,17438,17540,17454,17602,17596,17706,17550,17574,17544,17744,17548,17602,17580,17620,17362,17382,17412,17590,17276,17212,17262,17298,17250,17222,17314,17384,17230,17278,17278,17166,17190,17284,17308,17462,17454,17468,17484,17504,17554,17584,17622,17638,17796,17870,17634,17494,17280,17222,17540,17514,17330,17528,17402,17446,17566,17602,17600,17554,17488,17548,17582,17564,17510,17458,17314,17376,17242,17388,17216,17220,17194,17758,17178,17330,17354,17578,17546,17492,17324,17512,17512,17786,17740,18012,18014,18078,18032,18194,17988,18312,18020,18298,18270,18392,18354,18484,18280,18548,18432,18492,18480,18682,18594,18494,18278,18578,18438,18368,18388,18066,17722,17966,17694,17770,17446,17536,17562,17536,17418,18608,17426,17544,19012,18786,18626,18920,18612,18104,17948,17452,17490,17250,16972,16698,17280,16676,16598,16570,16590,16934,16608,16376,16322,17186,17006,17010,16932,15794,15388,13640,12446,11320,10560,9318,8960,9088,9184,8880,8890,8996,8910,8608,8502,9124,9800,9184,8736,8460,8112,8122,7682,7728,7472,7264,7284,7012,7114,7184,7244,7390,7124,7178,6954,6770,6590,5918,5648,5500,5222,4982,4912,4722,4596,4590,4356,4202,3982,3788,3756,3646,3582,3466,3396,3208,3166,3124,3018,2998,2958,2766,2540,2296,2058,1972,1886,1702,1702,1702,1702,1702,1702,1702,1702,1702,1702,1702,1702,1702,1702,1702,1702,1702,1702,1702,2902,3278,3976,5102,5442,5558,5850,6018,6124,6862,6888,7260,7098,7012,7276,7582,7402,7418,7504,7550,7550,7536,7666,7530,7858,7986,8076,8220,8218,8184,8152,8010,8030,7998,8056,8040,8240,8224,8284,8434,8474,8138,8526,8178,8266,8348,8322,8238,8422,8496,8728,8992,9558,9862,10328,11390,11922,13336,13394,13496,13842,13828,13982,14864,14970,15156,15868,16454,16488,16680,16662,16764,16850,16798,16730,16502,16486,16572,16584,17060,17126,17344,17496,17092,17514,18044,17444,17594,17702,17620,17910,17862,18174,18398,19566,18400,18280,19122,18394,18068,18156,18038,18018,18222,18136,18506,18160,18262,18244,18840,18330,18568,18130,18024,18186,18216,18362,18450,18352,18644,18610,18664,18508,18628,18690,18334,18240,17768,18022,18290,18250,18434,18116,18372,18430,18368,18180,18198,18200,18224,18184,18124,18336,18188,18200,18258,18098,18412,18080,18384,18624,19072,18830,18470,18930,18220,17972,17654,17530,17010,16262,16668,15120,14772,13918,13858,13454,13248,13334,13462,13204,13134,13358,13330,12782,12556,12680,11918,11664,11884,11362,11150,10798,10338,9686,9686,9542,9236,8584,8490,8414,8058,8022,8124,8276,8718,8704,8648,8832,8796,8996,9192,9022,9356,9896,9584,9398,9480,9604,9346,11174,10910,10482,8790,8410,8406,7966,8070,8070,7980,7900,7880,8050,8166,8202,9414,10146,10368,11016,11256,11264,11352,11482,11346,11118,11128,11536,11038,11100,10978,11254,10666,10742,10638,10770,10728,10730,10918,10838,10946,10934,11012,11570,11546,11758,11772,11994,11848,11518,11788,11498,11488,11528,11642,11604,11678,11696,11626,11524,11762,11512,11910,11770,11784,11598,11674,11902,11712,11850,11554,11728,11688,11666]/* sizes:end */;
  var PACKS = /* packs:start */[0,50,131,200,279,358,434,512,592,659,719,778,838,896,1038,1109,1167,1267]/* packs:end */;

  function packUrl(k) {
    return BASE + 'p/' + String(k).padStart(2, '0') + '.bin?v=' + FRAMES_VERSION;
  }

  /* The head script preloads the first pack under the same URL. */
  var preloaded = document.querySelector('link[rel="preload"][href*="scroll-film/p/00.bin"]');
  if (preloaded && preloaded.href !== packUrl(0)) {
    console.warn('scroll-film: the head preload asks for another pack than FRAMES_VERSION ' + FRAMES_VERSION);
  }

  /* Packs fetched at once: while one streams in, the next one's round
     trip is already under way. */
  var PARALLEL = 3;

  /* The frames come in packs of about 1 MB (tools/film-pack.mjs), in
     playing order: the film plays through by itself from the top. Fetched
     one by one, every frame paid a round trip to the server, and they came
     in slower than the film plays. Each frame is cut out of its pack as
     soon as its last byte arrives, so a pack need not be complete for its
     first frames to be drawn. */
  function startLoading() {
    if (started) return;
    started = true;
    loadStart = performance.now();
    if (location.protocol === 'file:') { loadFiles(); return; }
    var next = 0;

    function pump() {
      if (next < PACKS.length) getPack(next++, 0);
    }

    function getPack(k, tries) {
      var from = PACKS[k], to = k + 1 < PACKS.length ? PACKS[k + 1] : FRAMES;
      var size = 0;
      for (var s = from; s < to; s++) size += FRAME_BYTES[s];
      var buf = new Uint8Array(size), pos = 0, f = from, at = 0;

      /* Every frame the bytes so far reach the end of. */
      function cut() {
        while (f < to && pos >= at + FRAME_BYTES[f]) {
          if (!loaded[f]) {
            blobs[f] = new Blob([buf.subarray(at, at + FRAME_BYTES[f])], { type: 'image/webp' });
            arrive(f);
          }
          at += FRAME_BYTES[f];
          f++;
        }
      }
      function take(chunk) {
        if (pos + chunk.length > size) throw new Error('pack ' + k + ' is longer than FRAME_BYTES says');
        buf.set(chunk, pos);
        pos += chunk.length;
        bytesIn += chunk.length;
        cut();
      }

      fetch(packUrl(k)).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        if (!res.body || !res.body.getReader) {
          return res.arrayBuffer().then(function (ab) { take(new Uint8Array(ab)); });
        }
        var reader = res.body.getReader();
        return (function read() {
          return reader.read().then(function (r) {
            if (r.done) return;
            take(r.value);
            return read();
          });
        })();
      }).then(function () {
        if (f < to) throw new Error('pack ' + k + ' is shorter than FRAME_BYTES says');
        pump();
      }).catch(function () {
        /* Tried three times, then given up: frames not cut out by then are
           left to the nearest that came, and playback does not wait on
           them. */
        if (tries < 2) {
          setTimeout(function () { getPack(k, tries + 1); }, 1000 * (tries + 1));
        } else {
          for (var g = f; g < to; g++) if (!loaded[g]) arrive(g);
          pump();
        }
      });
    }

    for (var n = 0; n < PARALLEL; n++) pump();
  }

  /* A page opened as a file (file://) cannot fetch: there the frames come
     one by one as images (from the d set the packs are made of), which
     createImageBitmap decodes just the same. */
  function loadFiles() {
    var next = 0;
    function pump() {
      if (next >= FRAMES) return;
      var i = next++, img = new Image();
      img.onload = function () { blobs[i] = img; bytesIn += FRAME_BYTES[i]; arrive(i); pump(); };
      img.onerror = function () { arrive(i); pump(); };
      img.src = frameUrl('d', i);
    }
    for (var n = 0; n < 6; n++) pump();
  }

  function arrive(i) {
    loaded[i] = true;
    loadedCount++;
    dirty = true;
    bar.style.transform = 'scaleX(' + loadedCount / FRAMES + ')';
    if (loadedCount === FRAMES) root.classList.add('is-loaded');
  }

  /* Bitmaps for the frames about to be drawn: two behind frame b to ten
     ahead, plus the closing wave while it loops. Decoding a frame takes
     some 10 ms off the main thread, so ten ahead is a few hundred ms in
     hand even at the opening's speed. Every other bitmap is let go. */
  var DECODE_AHEAD = 10;
  function keepDecoded(b) {
    var lo = b - 2, hi = b + DECODE_AHEAD;
    var waving = b >= WAVE[0] - DECODE_AHEAD;
    function keep(i) { return (i >= lo && i <= hi) || (waving && i >= WAVE[0]); }
    for (var i = Math.max(0, lo); i <= Math.min(FRAMES - 1, hi); i++) decode(i);
    if (waving) for (var w = WAVE[0]; w <= WAVE[1]; w++) decode(w);
    held = held.filter(function (j) {
      if (keep(j)) return true;
      bitmaps[j].close();
      bitmaps[j] = null;
      return false;
    });
  }

  function decode(i) {
    if (!blobs[i] || bitmaps[i] || decoding[i]) return;
    decoding[i] = true;
    createImageBitmap(blobs[i]).then(function (bm) {
      decoding[i] = false;
      bitmaps[i] = bm;
      held.push(i);
      dirty = true;
    }, function () {
      /* A file that will not decode is treated as one that never came. */
      decoding[i] = false;
      blobs[i] = null;
    });
  }

  /* The closest frame ready to draw, an earlier one before a later. */
  function nearest(i) {
    var best = -1, dist = Infinity;
    held.forEach(function (j) {
      var d = j <= i ? i - j : j - i + 0.5;
      if (d < dist) { dist = d; best = j; }
    });
    return best;
  }

  /* Seconds after the film starts that each frame is due, at the speeds
     it plays at. */
  var due = null;
  function dueTimes() {
    due = [0];
    for (var f = 1; f < FRAMES; f++) due.push(due[f - 1] + 1 / (fpsAt(f - 1) * speedAt(f - 1)));
  }

  /* Whether the film can start now and play to its end without waiting
     on a frame: at the rate frames have come in so far, every frame still
     missing should arrive before it is due, with a fifth to spare. On a
     fast line that holds as soon as it is measured; on a slow one the
     first screen waits, rather than the film stalling mid-play. */
  var MEASURE_MS = 400;
  var MARGIN = 0.8;
  function canStart(now) {
    if (!loaded[0]) return false;
    if (loadedCount === FRAMES) return true;
    var secs = (now - loadStart) / 1000;
    if (secs * 1000 < MEASURE_MS || !FRAME_BYTES.length) return false;
    if (!due) dueTimes();
    var rate = bytesIn / secs * MARGIN;
    var missing = 0;
    for (var f = 0; f < FRAMES; f++) {
      if (!loaded[f]) missing += FRAME_BYTES[f];
      if (missing > rate * due[f]) return false;
    }
    return true;
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
    var img = bitmaps[index];
    var cw = canvas.width, ch = canvas.height;
    var iw = img.width, ih = img.height;

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
    ctx.drawImage(bitmaps[index], r.x, r.y, r.w, r.h);
    /* The picture's place on the stage, for captions set on it. */
    setBeside('--film-pic-l', r.x / cw);
    setBeside('--film-pic-t', r.y / ch);
    setBeside('--film-pic-w', r.w / cw);
    setBeside('--film-pic-h', r.h / ch);
    if (next >= 0 && mix > 0) {
      var r2 = layout(next, t);
      if (r2.x === r.x && r2.y === r.y && r2.w === r.w && r2.h === r.h) {
        ctx.globalAlpha = mix;
        ctx.drawImage(bitmaps[next], r.x, r.y, r.w, r.h);
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
  /* Playing from frame `from` on to `to`: the last frame it may reach
     without passing one still on its way. */
  function reachable(from, to) {
    for (var i = Math.floor(from) + 1; i <= Math.ceil(to) && i < FRAMES; i++) {
      if (!loaded[i]) return Math.max(from, i - 1);
    }
    return to;
  }
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

    /* At the top of the page the film plays as soon as it can play
       through (canStart), without waiting for a scroll. Once per visit. */
    if (autoStart && !playing && !done) {
      if (window.scrollY > 0 || box.top < 0) autoStart = false;
      else if (canStart(now)) { autoStart = false; playing = CHAPTERS[0]; }
    }

    /* Armed only by arriving from above; a jump into the middle stays scrubbed. */
    if (box.top > 0) openingReady = true;
    else if (openingReady && box.top < 0) {
      openingReady = false;
      if (target < OPENING_FRAMES - 1) playing = CHAPTERS[0];
    }

    if (playing) {
      /* Should a frame still be on its way (a slower line than measured,
         or a pull down before canStart), play waits at it rather than
         skipping past it. */
      current = reachable(current, current + Math.min(elapsed, 100) / 1000 * fpsAt(current) * speedAt(current));
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
    keepDecoded(base);
    var show = bitmaps[base] ? base : nearest(base);
    var next = show === base && mix > 0 && bitmaps[after] ? after : -1;
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
