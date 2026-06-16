/*!
 * home.bundle.js — Bundle consolidado de la página de inicio.
 *
 * Concatenación de los 7 scripts específicos de `index.md` y sus includes:
 *   1. home-nav.js               — toggle de nav móvil + scroll-hide
 *   2. lab-home.js               — feed de laboratorio (shuffle + hash FNV-1a)
 *   3. home-canvas.js            — canvas#art (línea sinusoidal vibrátil)
 *   4. home-audio.js             — sintetizador generativo con Tone.js
 *   5. collage-home.js           — render del collage dinámico (incluido en home-collage.html)
 *   6. home-collage-carousel.js  — centrado del slide medio en móvil
 *   7. menu-char-glitch.js      — glitch de caracteres random en hover/focus del menú
 *   8. title-decoder.js          — scramble cíclico cada 10s del <h1 id="cenizas">
 *
 * Cada módulo sigue siendo IIFE autocontenido; no comparten estado.
 * Se sirven como un solo recurso `defer` para reducir peticiones HTTP
 * y eliminar el orden de carga como causa de fallos.
 *
 * Dependencias externas (cargadas por `_layouts/default.html`):
 *   - p5.js   (CDN, opcional, no usada directamente por estos scripts)
 *   - Tone.js (CDN, requerida por home-audio.js)
 */
(function () {
  "use strict";

  /* ===== 1. home-nav.js ============================================ */
  (function () {
    var header = document.querySelector(".home-header");
    var nav = document.querySelector(".home-nav");
    var btn = document.getElementById("home-nav-toggle");
    var panel = document.getElementById("home-nav-panel");
    if (!header || !nav || !btn || !panel) return;

    var mq = window.matchMedia("(max-width: 768px)");
    var SCROLL_HIDE_PX = 48;

    function updateScrollClass() {
      if (!mq.matches) {
        header.classList.remove("home-header--scrolled");
        return;
      }
      if (header.classList.contains("home-header--nav-open")) {
        header.classList.remove("home-header--scrolled");
        return;
      }
      if (window.scrollY > SCROLL_HIDE_PX) {
        header.classList.add("home-header--scrolled");
      } else {
        header.classList.remove("home-header--scrolled");
      }
    }

    function sync() {
      if (mq.matches) {
        var open = header.classList.contains("home-header--nav-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        panel.setAttribute("aria-hidden", open ? "false" : "true");
      } else {
        header.classList.remove("home-header--nav-open");
        btn.setAttribute("aria-expanded", "true");
        panel.setAttribute("aria-hidden", "false");
      }
    }

    btn.addEventListener("click", function () {
      if (!mq.matches) return;
      header.classList.toggle("home-header--nav-open");
      sync();
      updateScrollClass();
    });

    document.addEventListener("keydown", function (e) {
      if (
        e.key === "Escape" &&
        mq.matches &&
        header.classList.contains("home-header--nav-open")
      ) {
        header.classList.remove("home-header--nav-open");
        sync();
        updateScrollClass();
        btn.focus();
      }
    });

    panel.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        if (mq.matches) {
          header.classList.remove("home-header--nav-open");
          sync();
          updateScrollClass();
        }
      });
    });

    window.addEventListener(
      "scroll",
      function () {
        updateScrollClass();
      },
      { passive: true }
    );

    if (mq.addEventListener) {
      mq.addEventListener("change", function () {
        sync();
        updateScrollClass();
      });
    } else if (mq.addListener) {
      mq.addListener(function () {
        sync();
        updateScrollClass();
      });
    }

    sync();
    updateScrollClass();
  })();

  /* ===== 2. lab-home.js ============================================ */
  (function () {
    var elScript = document.getElementById("lab-items");
    var elRoot = document.getElementById("lab-feed-root");
    var elBtn = document.getElementById("lab-shuffle");
    var elCfg = document.getElementById("lab-home-config");
    if (!elScript || !elRoot) return;

    var cfg = {};
    if (elCfg && elCfg.textContent) {
      try { cfg = JSON.parse(elCfg.textContent); } catch (ignore) {}
    }
    var SAMPLE_COUNT =
      typeof cfg.sample_count === "number" && cfg.sample_count > 0
        ? Math.floor(cfg.sample_count)
        : 10;

    var items;
    try { items = JSON.parse(elScript.textContent); } catch (e) { return; }
    if (!Array.isArray(items) || items.length === 0) return;

    function shuffle(arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }

    function escapeHtml(s) {
      var d = document.createElement("div");
      d.textContent = s;
      return d.innerHTML;
    }

    function fnv1a32(str) {
      var h = 0x811c9dc5;
      for (var i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
        h >>>= 0;
      }
      return h >>> 0;
    }

    function canonicalKey(item) {
      var r = item.ref != null ? String(item.ref).trim() : "";
      if (r !== "") return r;
      var kind = String(item.kind || "");
      var href = String(item.href || "");
      var text = String(item.text || "").slice(0, 240);
      return kind + "\x1e" + href + "\x1e" + text;
    }

    function archiveHashHex(key) {
      var a = fnv1a32(key);
      var b = fnv1a32("\xff" + key + "\xfe");
      return a.toString(16).padStart(8, "0") + b.toString(16).padStart(8, "0");
    }

    function formatHexByFour(hex) {
      var s = String(hex);
      var out = [];
      for (var i = 0; i < s.length; i += 4) out.push(s.slice(i, i + 4));
      return out.join(".");
    }

    function kindPrefix(kind) {
      var k = String(kind || "").toUpperCase().replace(/\s/g, "");
      if (k === "CÓDIGO" || k === "CODIGO") return "COD/";
      if (k === "DIARIO") return "DIA/";
      if (k === "POEMA") return "POE/";
      if (k === "REPORTE") return "REP/";
      return "ARC/";
    }

    function pickWeighted() {
      return shuffle(items).slice(0, Math.min(SAMPLE_COUNT, items.length));
    }

    function render() {
      var pick = pickWeighted();
      var frag = document.createDocumentFragment();
      pick.forEach(function (item) {
        var text = item.text != null ? String(item.text) : "";
        var href = item.href != null ? String(item.href) : "#";
        var kind = item.kind != null ? String(item.kind) : "MUESTRA";
        var key = canonicalKey(item);
        var hex = archiveHashHex(key);
        var prefix = kindPrefix(kind);
        var hexDotted = formatHexByFour(hex);
        var label = prefix + hexDotted;
        var tip = label + " | " + key + " (FNV-1a)";

        var article = document.createElement("article");
        article.className = "lab-specimen";
        article.setAttribute("data-lab-key", key);
        article.setAttribute("data-lab-hash", hex);
        article.innerHTML =
          '<header class="lab-specimen-meta">' +
          '<span class="lab-kind" data-kind="' + escapeHtml(kind) + '">' + escapeHtml(kind) + "</span>" +
          '<span class="lab-num" title="' + escapeHtml(tip) + '">' +
          escapeHtml(label) + "</span>" +
          "</header>" +
          '<p class="lab-text"><a href="' + escapeHtml(href) + '">' +
          escapeHtml(text) + "</a></p>";
        frag.appendChild(article);
      });
      elRoot.innerHTML = "";
      elRoot.appendChild(frag);
    }

    render();
    if (elBtn) elBtn.addEventListener("click", render);
  })();

  /* ===== 3. home-canvas.js ========================================= */
  (function () {
    var canvas = document.getElementById("art");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var t = 0;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#999";
      ctx.beginPath();
      for (var x = 0; x < canvas.width; x += 10) {
        var y = canvas.height / 2 + Math.sin(x * 0.01 + t) * 20;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      t += 0.05;
      requestAnimationFrame(draw);
    }
    draw();
  })();

  /* ===== 4. home-audio.js ========================================== */
  (function () {
    "use strict";

    if (typeof Tone === "undefined") {
      console.warn("Tone.js no está cargado");
      return;
    }

    var audioButton = document.getElementById("audio-control");
    if (!audioButton) return;

    var isPlaying = false;
    var masterVolume = new Tone.Volume(-4).toDestination();

    var SAMPLE_PATH = "/assets/media/audio/";

    var samples = {
      kick: "kick.wav",
      drone: "drone.wav",
      perc: "perc.wav",
      bass: { A: "bass-a.wav", B: "bass-b.wav", "C#": "bass-cs.wav", "D#": "bass-ds.wav", F: "bass-f.wav", G: "bass-g.wav" },
      hihat: { "01": "hihat-01.wav", "02": "hihat-02.wav", "03": "hihat-03.wav", "04": "hihat-04.wav", "05": "hihat-05.wav", "06": "hihat-06.wav", "07": "hihat-07.wav", "08": "hihat-08.wav" }
    };

    var kickOriginal = new Tone.Player(SAMPLE_PATH + samples.kick).toDestination();
    var drone = new Tone.Player(SAMPLE_PATH + samples.drone).toDestination();
    var perc = new Tone.Player(SAMPLE_PATH + samples.perc).toDestination();

    var kick4_4 = new Tone.MembraneSynth({
      pitchDecay: 0.05, octaves: 10,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
    });

    var bassSamples = Object.values(samples.bass).map(function (file) {
      return new Tone.Player(SAMPLE_PATH + file);
    });
    var hihatSamples = Object.values(samples.hihat).map(function (file) {
      return new Tone.Player(SAMPLE_PATH + file);
    });

    var bassSynth = new Tone.MonoSynth({
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.5 },
      filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.3, baseFrequency: 200, octaves: 2 }
    });
    var padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 2, decay: 1, sustain: 0.8, release: 3 }
    });
    var leadSynth = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.5 }
    });

    var reverb = new Tone.Reverb({ roomSize: 0.95, dampening: 4000 });
    reverb.wet.value = 0.5;
    var delay = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.4, wet: 0.3 });
    var longDelay = new Tone.FeedbackDelay({ delayTime: "2n", feedback: 0.2, wet: 0.15 });
    var filter = new Tone.Filter({ type: "lowpass", frequency: 800, Q: 1 });
    var filterLFO = new Tone.LFO({ frequency: 0.05, min: 400, max: 2000 });
    var chorus = new Tone.Chorus({ frequency: 1.5, delayTime: 2.5, depth: 0.3, wet: 0.2 });
    var compressor = new Tone.Compressor({ threshold: -24, ratio: 12, attack: 0.003, release: 0.1 });

    drone.chain(reverb, delay, longDelay, masterVolume);
    padSynth.chain(chorus, delay, longDelay, reverb, filter, masterVolume);
    leadSynth.chain(delay, longDelay, reverb, masterVolume);
    bassSynth.chain(filter, masterVolume);
    kick4_4.chain(compressor, masterVolume);

    bassSamples.forEach(function (b) { b.chain(filter, compressor, masterVolume); });

    var hihatDelay = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.35, wet: 0.3 });
    var hihatReverb = new Tone.Reverb({ roomSize: 0.8, dampening: 2000 });
    hihatReverb.wet.value = 0.4;
    var hihatVolume = new Tone.Volume(0);
    hihatSamples.forEach(function (hh) { hh.chain(hihatDelay, hihatReverb, hihatVolume, compressor, masterVolume); });

    perc.chain(compressor, masterVolume);
    kickOriginal.chain(compressor, masterVolume);
    filterLFO.connect(filter.frequency);
    filterLFO.start();

    var scale = ["C2", "Eb2", "F2", "G2", "Bb2", "C3", "Eb3", "F3", "G3", "Bb3"];
    var stepCount = 0;
    var padChordStep = 0;
    var hihatEnergyCycle = 0;
    var HIHAT_CYCLE_LENGTH = 128;

    var kickLoop = new Tone.Loop(function (time) {
      stepCount++;
      var step = stepCount % 16;
      if (step === 0 || step === 4 || step === 8 || step === 12) {
        kick4_4.triggerAttackRelease("C1", "8n", time);
      }
    }, "16n");

    var bassLoop = new Tone.Loop(function (time) {
      var step = stepCount % 16;
      var bassPattern = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1];
      if (bassPattern[step]) {
        var bassIndex = Math.floor(Math.random() * bassSamples.length);
        var selectedBass = bassSamples[bassIndex];
        selectedBass.playbackRate = 0.98 + Math.random() * 0.04;
        selectedBass.start(time);
      }
    }, "16n");

    var hihatLoop = new Tone.Loop(function (time) {
      var step = stepCount % 16;
      hihatEnergyCycle = (hihatEnergyCycle + 1) % HIHAT_CYCLE_LENGTH;
      var energyLevel = 0;
      if (hihatEnergyCycle < 64) {
        energyLevel = 0;
      } else if (hihatEnergyCycle < 96) {
        energyLevel = (hihatEnergyCycle - 64) / 32;
      } else {
        energyLevel = 1;
      }
      var hhPattern = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
      if (hhPattern[step] && energyLevel > 0.1) {
        var hhIndex = Math.floor(Math.random() * hihatSamples.length);
        var selectedHH = hihatSamples[hhIndex];
        selectedHH.volume.value = -15 + energyLevel * 7;
        selectedHH.playbackRate = 0.95 + Math.random() * 0.1;
        selectedHH.start(time);
      }
      var fadeVolumeDb = energyLevel > 0 ? (energyLevel * 6 - 12) : -Infinity;
      hihatVolume.volume.rampTo(fadeVolumeDb, 0.1);
    }, "16n");

    var padLoop = new Tone.Loop(function (time) {
      padChordStep++;
      if (padChordStep % 32 === 0) {
        var chordIdx = Math.floor(padChordStep / 32) % 4;
        var chords = [
          ["C3", "Eb3", "G3"],
          ["F3", "Ab3", "C4"],
          ["G3", "Bb3", "D4"],
          ["Eb3", "G3", "Bb3"]
        ];
        padSynth.triggerAttackRelease(chords[chordIdx], "2n", time);
        drone.playbackRate = 0.9 + Math.random() * 0.2;
        drone.start(time);
      }
    }, "4n");

    var percLoop = new Tone.Loop(function (time) {
      var percPattern = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1];
      var step = stepCount % 16;
      if (percPattern[step]) {
        perc.playbackRate = 0.95 + Math.random() * 0.1;
        perc.start(time);
      }
    }, "16n");

    var leadLoop = new Tone.Loop(function (time) {
      if (Math.random() > 0.8) {
        var note = scale[Math.floor(Math.random() * scale.length)];
        var duration = ["8n", "4n", "8n."][Math.floor(Math.random() * 3)];
        leadSynth.triggerAttackRelease(note, duration, time);
      }
    }, "4n");

    kick4_4.volume.value = -4;
    bassSamples.forEach(function (b) { b.volume.value = -8; });
    hihatSamples.forEach(function (hh) { hh.volume.value = -10; });
    drone.volume.value = -10;
    perc.volume.value = -8;
    kickOriginal.volume.value = -12;
    bassSynth.volume.value = -12;
    padSynth.volume.value = -14;
    leadSynth.volume.value = -16;

    audioButton.addEventListener("click", function () {
      if (!isPlaying) {
        Tone.start().then(function () {
          return Promise.all([reverb.generate(), hihatReverb.generate()]);
        }).then(function () {
          Tone.Transport.bpm.value = 120;
          stepCount = 0;
          padChordStep = 0;
          hihatEnergyCycle = 0;
          kickLoop.start(0);
          bassLoop.start(0);
          hihatLoop.start(0);
          padLoop.start(0);
          leadLoop.start(0);
          percLoop.start(0);
          Tone.Transport.start();
          isPlaying = true;
          audioButton.innerHTML = "⏸ Pausar";
          audioButton.style.opacity = "0.9";
        });
      } else {
        Tone.Transport.stop();
        kickLoop.stop();
        bassLoop.stop();
        hihatLoop.stop();
        padLoop.stop();
        leadLoop.stop();
        percLoop.stop();
        bassSynth.releaseAll();
        padSynth.releaseAll();
        leadSynth.releaseAll();
        kick4_4.releaseAll();
        bassSamples.forEach(function (b) { b.stop(); });
        hihatSamples.forEach(function (hh) { hh.stop(); });
        drone.stop();
        perc.stop();
        kickOriginal.stop();
        isPlaying = false;
        audioButton.innerHTML = "▶ Reproducir";
        audioButton.style.opacity = "1";
      }
    });
  })();

  /* ===== 5. collage-home.js ======================================== */
  (function () {
    var elRoot = document.getElementById("home-collage-root");
    var elItems = document.getElementById("home-collage-items");
    var elCfg = document.getElementById("home-collage-config");
    if (!elRoot || !elItems) return;

    var cfg = {};
    if (elCfg && elCfg.textContent) {
      try { cfg = JSON.parse(elCfg.textContent); } catch (ignore) {}
    }
    var maxItems =
      typeof cfg.max_items === "number" && cfg.max_items > 0
        ? Math.floor(cfg.max_items)
        : 6;

    var pool;
    try { pool = JSON.parse(elItems.textContent); } catch (e) { return; }
    if (!Array.isArray(pool) || pool.length === 0) return;

    function shuffle(arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }

    function escapeHtml(s) {
      var d = document.createElement("div");
      d.textContent = s;
      return d.innerHTML;
    }

    var FOCAL_NUM = { "1": "nw", "2": "n", "3": "ne", "4": "w", "5": "c", "6": "e", "7": "sw", "8": "s", "9": "se" };
    var FOCAL_WORD = { nw: true, n: true, ne: true, w: true, c: true, e: true, sw: true, s: true, se: true };

    function canonicalSliderFocal(raw) {
      if (raw == null || raw === "") return "";
      var s = String(raw).trim().toLowerCase();
      if (!s) return "";
      if (FOCAL_NUM[s]) return FOCAL_NUM[s];
      if (FOCAL_WORD[s]) return s;
      return "";
    }

    function render() {
      var pick = shuffle(pool).slice(0, maxItems);
      var html = pick.map(function (it) {
        var title = it.title != null ? String(it.title) : "";
        var href = it.href != null ? String(it.href) : "#";
        var src = it.src != null ? String(it.src) : "";
        if (!src) return "";
        var focal = canonicalSliderFocal(it.focal);
        var dataFocal = focal ? ' data-focal="' + escapeHtml(focal) + '"' : "";
        return (
          '<figure class="image-effect"' + dataFocal + ">" +
          '<a class="collage-crop" href="' + escapeHtml(href) + '">' +
          '<span class="collage-crop__inner">' +
          '<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(title) +
          '" loading="lazy">' +
          "</span></a>" +
          "<figcaption>" + escapeHtml(title) + "</figcaption>" +
          "</figure>"
        );
      }).join("");
      elRoot.innerHTML = html;
    }
    render();
  })();

  /* ===== 6. home-collage-carousel.js =============================== */
  /* Scroll-snap CSS horizontal con loop infinito: cuando el usuario
     llega al primer/último slide, el scroll vuelve al inicio/final
     instantáneamente para que el collage se sienta circular. */
  (function () {
    var ROOT_ID = "home-collage-root";
    var EDGE_PX = 4;

    function setup(root) {
      if (!root || root.id !== ROOT_ID) return;
      if (!root.classList.contains("collage--home-mini")) return;
      if (root.dataset.loopReady === "1") return;
      root.dataset.loopReady = "1";

      function centerInitial() {
        var figures = root.querySelectorAll("figure");
        if (figures.length === 0) return;
        var mid = Math.floor((figures.length - 1) / 2);
        var target = figures[mid];
        if (!target || typeof target.scrollIntoView !== "function") return;
        var prevSnap = root.style.scrollSnapType;
        root.style.scrollSnapType = "none";
        target.scrollIntoView({ behavior: "auto", inline: "center", block: "nearest" });
        root.style.scrollSnapType = prevSnap || "";
      }

      function jumpToStart() {
        var prevSnap = root.style.scrollSnapType;
        root.style.scrollSnapType = "none";
        root.scrollLeft = 0;
        root.style.scrollSnapType = prevSnap || "";
      }

      function jumpToEnd() {
        var prevSnap = root.style.scrollSnapType;
        root.style.scrollSnapType = "none";
        root.scrollLeft = root.scrollWidth - root.clientWidth;
        root.style.scrollSnapType = prevSnap || "";
      }

      function onScroll() {
        var max = root.scrollWidth - root.clientWidth;
        if (max <= 0) return;
        if (root.scrollLeft <= EDGE_PX) {
          jumpToEnd();
        } else if (root.scrollLeft >= max - EDGE_PX) {
          jumpToStart();
        }
      }

      function run() {
        centerInitial();
        root.addEventListener("scroll", onScroll, { passive: true });
      }

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", run);
      } else {
        run();
      }
      window.addEventListener("load", centerInitial);
    }

    setup(document.getElementById(ROOT_ID));
  })();

  /* ===== 7. menu-char-glitch.js ===================================== */
  (function () {
    var root = document.querySelector(".nube-de-palabras");
    if (!root) return;
    var links = root.querySelectorAll("a");
    if (!links.length) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    var coarse = window.matchMedia("(pointer: coarse)");
    if (reduced.matches || coarse.matches) return;

    var GLYPHS = "▒▓█░▄▀■□◊◈◉○";
    var MAX_DUR = 600;
    var FRAME_INTERVAL = 70;
    var REPLACE_PROB = 0.22;
    var EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}]/u;

    function attach(el) {
      if (!el.dataset.originalText) el.dataset.originalText = el.textContent;
      var original = el.dataset.originalText;
      var rafId = 0;
      var startTime = 0;
      var lastFrameTime = 0;

      function stop() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
        el.textContent = original;
      }

      function tick(now) {
        if (now - startTime >= MAX_DUR) { stop(); return; }
        if (now - lastFrameTime < FRAME_INTERVAL) {
          rafId = requestAnimationFrame(tick);
          return;
        }
        lastFrameTime = now;
        var out = "";
        for (var i = 0; i < original.length; i++) {
          var ch = original[i];
          if (ch === " " || EMOJI_RE.test(ch)) {
            out += ch;
          } else if (Math.random() < REPLACE_PROB) {
            out += GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
          } else {
            out += ch;
          }
        }
        el.textContent = out;
        rafId = requestAnimationFrame(tick);
      }

      function start() {
        if (rafId) return;
        if (reduced.matches || coarse.matches) return;
        startTime = performance.now();
        lastFrameTime = startTime;
        rafId = requestAnimationFrame(tick);
      }

      el.addEventListener("mouseenter", start);
      el.addEventListener("mouseleave", stop);
      el.addEventListener("focus", start);
      el.addEventListener("blur", stop);
    }

    links.forEach(attach);
  })();

  /* ===== 8. title-decoder.js ======================================= */
  (function () {
    var h1 = document.getElementById("cenizas");
    if (!h1) return;
    var original = h1.textContent;
    h1.dataset.originalText = original;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    var POOL = "▒▓█░▄▀■□◊◈◉○ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var CYCLE_MS = 1500;
    var INTERVAL_MS = 5000;
    var SETTLE_MS = 500;

    var parts = [];
    for (var i = 0; i < original.length; i++) {
      var ch = original[i];
      parts.push({ fixed: ch === "." || ch === " ", ch: ch });
    }
    var letterCount = parts.length - parts.filter(function (p) { return p.fixed; }).length;

    function runCycle() {
      var start = performance.now();

      function tick(now) {
        var elapsed = now - start;
        if (elapsed >= CYCLE_MS) {
          h1.textContent = original;
          setTimeout(runCycle, INTERVAL_MS);
          return;
        }
        var settleProgress = Math.max(0, (elapsed - (CYCLE_MS - SETTLE_MS)) / SETTLE_MS);
        var settleCount = Math.floor(settleProgress * letterCount);
        var out = "";
        var letterIdx = 0;
        for (var j = 0; j < parts.length; j++) {
          if (parts[j].fixed) {
            out += parts[j].ch;
          } else if (letterIdx < settleCount) {
            out += parts[j].ch;
            letterIdx++;
          } else {
            out += POOL.charAt(Math.floor(Math.random() * POOL.length));
            letterIdx++;
          }
        }
        h1.textContent = out;
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    setTimeout(runCycle, INTERVAL_MS);
  })();
})();
