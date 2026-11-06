// Cámara de niebla — canvas generativo de la portada.
// Las trazas se condensan alrededor de la línea umbral y se disipan solas.
// Respeta prefers-reduced-motion dibujando una exposición fija.
(function () {
  "use strict";

  var canvas = document.getElementById("art");
  var hero = document.getElementById("umbral");
  var line = document.querySelector(".umbral__threshold");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var W = 0;
  var H = 0;
  var dpr = 1;
  var threshold = 0.58;
  var tracks = [];
  var raf = 0;
  var lastTime = 0;
  var lastSpawn = 0;
  var lastBurst = 0;
  var lastPointerSpawn = 0;
  var t = 0;
  var pointer = { x: 0, y: 0, active: false };

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function colorFor() {
    var r = Math.random();
    if (r < 0.1) return { r: 142, g: 196, b: 200, a: 0.72 };
    if (r < 0.18) return { r: 199, g: 164, b: 102, a: 0.66 };
    return { r: 202, g: 214, b: 214, a: 0.56 };
  }

  function makeTrack(x, y, angle) {
    return {
      x: x,
      y: y,
      px: x,
      py: y,
      angle: angle,
      speed: rand(0.4, 1.05),
      curve: rand(-0.0028, 0.0028),
      width: rand(0.35, 0.8),
      color: colorFor(),
      life: 0,
      maxLife: rand(150, 360),
      wobble: rand(0, 6.283),
      branch: Math.random() < 0.16
    };
  }

  function spawn(x, y) {
    if (tracks.length > 120) return;
    if (typeof x !== "number") x = rand(0, W);
    if (typeof y !== "number") y = threshold * H + rand(-18, 18);
    var angle = rand(-Math.PI * 0.94, -Math.PI * 0.06);
    if (Math.random() < 0.44) angle = rand(Math.PI * 0.06, Math.PI * 0.94);
    tracks.push(makeTrack(x, y, angle));
    if (Math.random() < 0.18) {
      tracks.push(makeTrack(x, y, angle + rand(-0.55, 0.55)));
    }
  }

  function burst() {
    if (tracks.length > 108) return;
    var x = rand(W * 0.12, W * 0.88);
    var y = threshold * H + rand(-22, 22);
    var base = rand(-Math.PI * 0.88, -Math.PI * 0.12);
    var count = 6 + Math.floor(Math.random() * 6);
    for (var i = 0; i < count; i++) {
      tracks.push(makeTrack(x, y, base + rand(-0.85, 0.85)));
    }
  }

  function stepTrack(tr, withFade) {
    tr.px = tr.x;
    tr.py = tr.y;
    var curl =
      Math.sin(tr.x * 0.004 + tr.y * 0.0025 + t * 0.45 + tr.wobble) * 0.0022;
    tr.angle += tr.curve + curl;
    tr.x += Math.cos(tr.angle) * tr.speed;
    tr.y += Math.sin(tr.angle) * tr.speed;
    tr.life += 1;

    var lifeN = tr.life / tr.maxLife;
    var alpha =
      tr.color.a *
      (1 - lifeN) *
      (0.62 + 0.38 * Math.sin(tr.life * 0.14 + tr.wobble));
    if (alpha < 0) alpha = 0;

    if (withFade && tr.life > 3) {
      ctx.strokeStyle =
        "rgba(" +
        tr.color.r +
        "," +
        tr.color.g +
        "," +
        tr.color.b +
        "," +
        alpha +
        ")";
      ctx.lineWidth = tr.width;
      ctx.beginPath();
      ctx.moveTo(tr.px, tr.py);
      ctx.lineTo(tr.x, tr.y);
      ctx.stroke();
    }

    if (withFade && tr.life % 11 === 0) {
      ctx.fillStyle =
        "rgba(" +
        tr.color.r +
        "," +
        tr.color.g +
        "," +
        tr.color.b +
        "," +
        alpha * 0.55 +
        ")";
      ctx.beginPath();
      ctx.arc(tr.x, tr.y, tr.width * 1.15, 0, Math.PI * 2);
      ctx.fill();
    }

    if (withFade && tr.branch && tr.life === Math.floor(tr.maxLife * 0.32)) {
      tracks.push(makeTrack(tr.x, tr.y, tr.angle + rand(-0.7, 0.7)));
      tr.branch = false;
    }

    return (
      tr.life > tr.maxLife ||
      tr.x < -50 ||
      tr.x > W + 50 ||
      tr.y < -50 ||
      tr.y > H + 50
    );
  }

  function advance() {
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.004)";
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    for (var i = tracks.length - 1; i >= 0; i--) {
      if (stepTrack(tracks[i], true)) tracks.splice(i, 1);
    }

    t += 0.016;
  }

  function drawStatic() {
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    for (var i = 0; i < 54; i++) {
      var x = rand(0, W);
      var y = threshold * H + rand(-H * 0.16, H * 0.16);
      var tr = makeTrack(x, y, rand(-Math.PI, Math.PI));
      tr.speed = rand(0.7, 1.7);
      tr.maxLife = rand(50, 130);
      var fade = tr.color.a * 0.8;
      var trColor =
        "rgba(" + tr.color.r + "," + tr.color.g + "," + tr.color.b + ",";
      for (var s = 0; s < tr.maxLife; s++) {
        tr.px = tr.x;
        tr.py = tr.y;
        tr.angle += tr.curve;
        tr.x += Math.cos(tr.angle) * tr.speed;
        tr.y += Math.sin(tr.angle) * tr.speed;
        tr.life += 1;
        var a = fade * (1 - tr.life / tr.maxLife);
        if (a <= 0) break;
        ctx.strokeStyle = trColor + a + ")";
        ctx.lineWidth = tr.width;
        ctx.beginPath();
        ctx.moveTo(tr.px, tr.py);
        ctx.lineTo(tr.x, tr.y);
        ctx.stroke();
      }
    }

    ctx.globalCompositeOperation = "source-over";
  }

  function frame(now) {
    if (!lastTime) lastTime = now;
    lastTime = now;

    advance();

    if (now - lastSpawn > 150) {
      spawn();
      lastSpawn = now;
    }

    if (now - lastBurst > 3600) {
      burst();
      lastBurst = now;
    }

    if (pointer.active && now - lastPointerSpawn > 130) {
      spawn(pointer.x, pointer.y);
      lastPointerSpawn = now;
    }

    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (raf) return;
    if (reduce.matches) {
      drawStatic();
      return;
    }
    lastTime = 0;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function measureThreshold(canvasRect) {
    if (!line) return 0.58;
    var lineRect = line.getBoundingClientRect();
    if (!canvasRect.height) return 0.58;
    var y = (lineRect.top - canvasRect.top + lineRect.height / 2) / canvasRect.height;
    return Math.min(0.9, Math.max(0.1, y));
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    W = Math.max(1, rect.width);
    H = Math.max(1, rect.height);
    threshold = measureThreshold(rect);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    tracks.length = 0;

    if (reduce.matches) {
      drawStatic();
      return;
    }

    for (var i = 0; i < 18; i++) spawn();
    burst();
    burst();
    if (!raf) start();
  }

  function onPointerMove(e) {
    if (e.pointerType && e.pointerType !== "mouse") return;
    if (reduce.matches || !hero) return;
    var rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.active =
      pointer.x > -20 &&
      pointer.x < W + 20 &&
      pointer.y > -20 &&
      pointer.y < H + 20;
  }

  function onPointerLeave() {
    pointer.active = false;
  }

  if (hero) {
    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    hero.addEventListener("pointerleave", onPointerLeave, { passive: true });
  }

  window.addEventListener("resize", resize, { passive: true });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  if (reduce.addEventListener) {
    reduce.addEventListener("change", function () {
      stop();
      if (reduce.matches) drawStatic();
      else start();
    });
  }

  resize();
  start();

  // La serif cambia de métricas al cargar: volver a medir la línea umbral.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      resize();
    });
  }

  window.addEventListener("load", resize, { passive: true });
})();
