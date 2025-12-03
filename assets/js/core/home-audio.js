// Audio setup para la página de inicio - extraído de index.md
(function() {
  'use strict';

  // Esperar a que Tone.js esté disponible
  if (typeof Tone === 'undefined') {
    console.warn('Tone.js no está cargado');
    return;
  }

  const startButton = document.getElementById('start');
  if (!startButton) return;

  // Cargar samples
  const kick = new Tone.Player('assets/media/audio/kick.wav').toDestination();
  const pad = new Tone.Player('assets/media/audio/drone.wav').toDestination();
  const reverb = new Tone.Reverb(4).toDestination();
  const perc = new Tone.Player('assets/media/audio/perc.wav').toDestination();

  // Conexión del pad al efecto
  pad.connect(reverb);

  // Filtro con LFO para movimiento
  const padFilter = new Tone.Filter(400, 'lowpass').toDestination();
  reverb.connect(padFilter);

  const lfo = new Tone.LFO('0.1hz', 200, 1000);
  lfo.connect(padFilter.frequency).start();

  // Contador para el kick
  let kickCount = 0;

  // Loop de kick
  const kickLoop = new Tone.Loop((time) => {
    kickCount++;
    if (kickCount % 16 !== 0) {
      kick.start(time);
    }
  }, '4n');

  // Loop de percusión
  const percLoop = new Tone.Loop((time) => {
    perc.start(time);
  }, '16m');

  // Loop ambiental del pad
  const padLoop = new Tone.Loop((time) => {
    pad.playbackRate = Math.random() * 0.3 + 0.9; // variación sutil
    pad.start(time);
  }, '4m');

  // Botón para iniciar
  startButton.addEventListener('click', async () => {
    await Tone.start();
    
    // Configurar volúmenes
    kick.volume.value = -8;
    pad.volume.value = -12;
    perc.volume.value = -12;

    // Fade in
    pad.volume.rampTo(0, 8);
    kick.volume.rampTo(0, 3);
    perc.volume.rampTo(0, 6);

    // Iniciar loops
    kickLoop.start(0);
    padLoop.start(0);
    percLoop.start(0);
    Tone.Transport.start();

    // Ocultar botón
    startButton.style.display = 'none';
  });
})();

