---
layout: default
title: Inicio
nav: true
nav_order: 1
---

# C . E . N . I . Z . A . S

> “Oculto y no tanto”

<div class="nube-de-palabras">
  <a href="{{ site.baseurl }}/diario/">✶ Diario</a>
  <a href="{{ site.baseurl }}/fragmentos/">☍ Fragmentos</a>
  <a href="{{ site.baseurl }}/poemas/">ↂ Poemas</a>
  <a href="{{ site.baseurl }}/musica/">𝄞 Música</a>
  <a href="{{ site.baseurl }}/visual/">◉ Visual</a>
  <a href="{{ site.baseurl }}/melange">🜏 Melange </a>  
  <a href="{{ site.baseurl }}/visual/generator">꩜</a>

</div>

      {% include assemblage.html %}



<canvas id="art" width="800" height="600" style="width: 100%; height: 300px;"></canvas>
<script>
const canvas = document.getElementById("art");
const ctx = canvas.getContext("2d");
let t = 0;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#999";
  ctx.beginPath();
  for (let x = 0; x < canvas.width; x += 10) {
    let y = canvas.height / 2 + Math.sin(x * 0.01 + t) * 20;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  t += 0.05;
  requestAnimationFrame(draw);
}
draw();
</script>


<iframe width="100%" height="400px" src="https://www.youtube.com/embed/QNS9RGB1GWg?si=1kdQaWa02BWeQJiI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>




<script>
  // Cargar samples
  const kick = new Tone.Player("assets/samples/kick.wav").toDestination();
  const pad = new Tone.Player("assets/samples/drone.wav").toDestination();
  const reverb = new Tone.Reverb(4).toDestination();
  const perc = new Tone.Player("assets/samples/perc.wav").toDestination();
  // Conexión del pad al efecto
  pad.connect(reverb);

  // Filtro con LFO para movimiento
  const padFilter = new Tone.Filter(400, "lowpass").toDestination();
  reverb.connect(padFilter);

  const lfo = new Tone.LFO("0.1hz", 200, 1000);
  lfo.connect(padFilter.frequency).start();

  // Contador para el kick
  let kickCount = 0;

  // Loop de kick
  const kickLoop = new Tone.Loop((time) => {
    kickCount++;
    if (kickCount % 16 === 0) {

    } else {
      kick.start(time);
    }
  }, "4n");

  // loop Percucion
  const percLoop = new Tone.Loop((time) => {
    perc.start(time);
  }, "16m");

  // Loop ambiental del pad
  const padLoop = new Tone.Loop((time) => {
    pad.playbackRate = Math.random() * 0.3 + 0.9; // variación sutil
    pad.start(time);
  }, "4m");

  // Botón para iniciar
  document.getElementById("start").addEventListener("click", async () => {
    await Tone.start();
    kick.volume.value = -8;
    pad.volume.value = -12;
    perc.volume.value = -12

    pad.volume.rampTo(0, 8);
    kick.volume.rampTo(0, 3);
    perc.volume.rampTo(0, 6);

    kickLoop.start(0);
    padLoop.start(0);
    percLoop.start(0);
    Tone.Transport.start();

    document.getElementById("start").style.display = "none";
  });
</script>
