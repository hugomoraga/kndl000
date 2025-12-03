// Audio generativo hipnótico para la página de inicio - estilo techno sci-fi ambiental
(function() {
  'use strict';

  // Esperar a que Tone.js esté disponible
  if (typeof Tone === 'undefined') {
    console.warn('Tone.js no está cargado');
    return;
  }

  const audioButton = document.getElementById('audio-control');
  if (!audioButton) return;

  let isPlaying = false;
  let masterVolume = new Tone.Volume(-4).toDestination(); // 80% del máximo (-4dB ≈ 80%)

  // === CONFIGURACIÓN DE SAMPLES (nombres normalizados) ===
  // Usar ruta absoluta desde la raíz del sitio
  const SAMPLE_PATH = '/assets/media/audio/';
  
  const samples = {
    // Samples originales
    kick: 'kick.wav',
    drone: 'drone.wav',
    perc: 'perc.wav',
    
    // Bass samples
    bass: {
      A: 'bass-a.wav',
      B: 'bass-b.wav',
      'C#': 'bass-cs.wav',
      'D#': 'bass-ds.wav',
      F: 'bass-f.wav',
      G: 'bass-g.wav'
    },
    
    // Hi-hat samples
    hihat: {
      '01': 'hihat-01.wav',
      '02': 'hihat-02.wav',
      '03': 'hihat-03.wav',
      '04': 'hihat-04.wav',
      '05': 'hihat-05.wav',
      '06': 'hihat-06.wav',
      '07': 'hihat-07.wav',
      '08': 'hihat-08.wav'
    }
  };

  // === SAMPLES ORIGINALES ===
  const kickOriginal = new Tone.Player(SAMPLE_PATH + samples.kick).toDestination(); // Para otro uso
  const drone = new Tone.Player(SAMPLE_PATH + samples.drone).toDestination();
  const perc = new Tone.Player(SAMPLE_PATH + samples.perc).toDestination();

  // === KICK PARA 4/4 (sintético potente) ===
  const kick4_4 = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 10,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
  });

  // === BASS SAMPLES ===
  const bassSamples = Object.values(samples.bass).map(file => 
    new Tone.Player(SAMPLE_PATH + file)
  );

  // === HI-HAT SAMPLES ===
  const hihatSamples = Object.values(samples.hihat).map(file => 
    new Tone.Player(SAMPLE_PATH + file)
  );

  // === SYNTHESIZERS GENERATIVOS ===
  
  // Bass sintético complementario (opcional, para texturas)
  const bassSynth = new Tone.MonoSynth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.5 },
    filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.3, baseFrequency: 200, octaves: 2 }
  });

  // Pad ambiental con oscilador múltiple
  const padSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 2, decay: 1, sustain: 0.8, release: 3 }
  });

  // Lead sintético para texturas sci-fi
  const leadSynth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.5 }
  });

  // === EFECTOS AMBIENTALES ===
  
  // Reverb espacioso (se generará al iniciar) - más ambiente
  const reverb = new Tone.Reverb({
    roomSize: 0.95,
    dampening: 4000
  });
  reverb.wet.value = 0.5;

  // Delay con feedback para profundidad (más ambiente)
  const delay = new Tone.FeedbackDelay({
    delayTime: '8n',
    feedback: 0.4,
    wet: 0.3
  });
  
  // Delay largo para espacio ambiental
  const longDelay = new Tone.FeedbackDelay({
    delayTime: '2n',
    feedback: 0.2,
    wet: 0.15
  });

  // Filtro dinámico con LFO para movimiento
  const filter = new Tone.Filter({
    type: 'lowpass',
    frequency: 800,
    Q: 1
  });

  const filterLFO = new Tone.LFO({
    frequency: 0.05, // Muy lento, hipnótico
    min: 400,
    max: 2000
  });

  // Chorus sutil para textura
  const chorus = new Tone.Chorus({
    frequency: 1.5,
    delayTime: 2.5,
    depth: 0.3,
    wet: 0.2
  });

  // Compresor para hacer el sonido más duro y cohesivo
  const compressor = new Tone.Compressor({
    threshold: -24,
    ratio: 12,
    attack: 0.003,
    release: 0.1
  });

  // === CADENA DE EFECTOS ===
  // Drone con efectos ambientales (más espacio)
  drone.chain(reverb, delay, longDelay, masterVolume);
  
  // Synths con efectos (más ambiente)
  padSynth.chain(chorus, delay, longDelay, reverb, filter, masterVolume);
  leadSynth.chain(delay, longDelay, reverb, masterVolume);
  bassSynth.chain(filter, masterVolume);
  
  // Kick 4/4 con compresor para más punch
  kick4_4.chain(compressor, masterVolume);
  
  // Bass samples con filtro y compresor
  bassSamples.forEach(bass => {
    bass.chain(filter, compressor, masterVolume);
  });
  
  // Hi-hats con delay y reverb para mucho espacio y ambiente
  const hihatDelay = new Tone.FeedbackDelay({
    delayTime: '8n',
    feedback: 0.35,
    wet: 0.3
  });
  
  const hihatReverb = new Tone.Reverb({
    roomSize: 0.8,
    dampening: 2000
  });
  hihatReverb.wet.value = 0.4;
  
  // Canal de volumen para control dinámico de hi-hats
  const hihatVolume = new Tone.Volume(0);
  
  hihatSamples.forEach(hh => {
    hh.chain(hihatDelay, hihatReverb, hihatVolume, compressor, masterVolume);
  });
  
  // Perc y kick original con compresor
  perc.chain(compressor, masterVolume);
  kickOriginal.chain(compressor, masterVolume);

  filterLFO.connect(filter.frequency);
  filterLFO.start();

  // === LOOPS GENERATIVOS ===
  
  // Escala menor pentatónica para sonido hipnótico
  const scale = ['C2', 'Eb2', 'F2', 'G2', 'Bb2', 'C3', 'Eb3', 'F3', 'G3', 'Bb3'];
  
  let stepCount = 0;
  let lastBassNote = 0;
  let lastPadChord = 0;
  let padChordStep = 0;
  
  // Control de energía de hi-hats (ciclos de respiración)
  let hihatEnergyCycle = 0; // 0-127 para ciclo completo
  let hihatEnergyPhase = 0; // 0 = calma, 1 = energía, 2 = transición
  const HIHAT_CYCLE_LENGTH = 128; // Pasos para un ciclo completo

  // Kick 4/4 (en cada tiempo fuerte)
  const kickLoop = new Tone.Loop((time) => {
    stepCount++;
    const step = stepCount % 16;
    
    // Kick en 1, 5, 9, 13 (4/4)
    if (step === 0 || step === 4 || step === 8 || step === 12) {
      kick4_4.triggerAttackRelease('C1', '8n', time);
    }
  }, '16n');

  // Bass pattern generativo con samples ADRKT (más respiración)
  const bassLoop = new Tone.Loop((time) => {
    const step = stepCount % 16;
    
    // Patrón más espaciado para respirar
    const bassPattern = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    
    if (bassPattern[step]) {
      // Seleccionar sample de bass aleatoriamente
      const bassIndex = Math.floor(Math.random() * bassSamples.length);
      const selectedBass = bassSamples[bassIndex];
      
      // Variación sutil de playback rate
      selectedBass.playbackRate = 0.98 + Math.random() * 0.04;
      selectedBass.start(time);
    }
  }, '16n');
  
  // Hi-hats generativos con ciclos de energía/calma (respiración)
  const hihatLoop = new Tone.Loop((time) => {
    const step = stepCount % 16;
    hihatEnergyCycle = (hihatEnergyCycle + 1) % HIHAT_CYCLE_LENGTH;
    
    // Determinar fase del ciclo (0-63: calma, 64-95: transición arriba, 96-127: energía)
    let energyLevel = 0;
    if (hihatEnergyCycle < 64) {
      // Calma - hi-hats muy suaves o ausentes
      energyLevel = 0;
    } else if (hihatEnergyCycle < 96) {
      // Transición hacia arriba - gradual
      energyLevel = (hihatEnergyCycle - 64) / 32; // 0 a 1
    } else {
      // Energía - hi-hats presentes
      energyLevel = 1;
    }
    
    // Patrón base de hi-hats (solo cuando hay energía)
    const hhPattern = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
    
    // Solo tocar hi-hats si hay suficiente energía
    if (hhPattern[step] && energyLevel > 0.1) {
      // Seleccionar hi-hat aleatorio
      const hhIndex = Math.floor(Math.random() * hihatSamples.length);
      const selectedHH = hihatSamples[hhIndex];
      
      // Volumen basado en nivel de energía (gradual)
      const baseVolume = -15 + (energyLevel * 7); // -15 (calma) a -8 (energía)
      selectedHH.volume.value = baseVolume;
      
      // Variación sutil de playback rate
      selectedHH.playbackRate = 0.95 + Math.random() * 0.1;
      selectedHH.start(time);
    }
    
    // Controlar volumen general del canal de hi-hats (fade in/out gradual)
    // Convertir de 0-1 a dB: 0 = -Inf, 1 = 0dB, usar aproximación
    const fadeVolumeDb = energyLevel > 0 ? (energyLevel * 6 - 12) : -Infinity; // -12 a -6 dB
    hihatVolume.volume.rampTo(fadeVolumeDb, 0.1);
  }, '16n');

  // Pad ambiental con acordes que cambian lentamente + Drone sample
  const padLoop = new Tone.Loop((time) => {
    padChordStep++;
    // Cambiar acorde cada 32 pasos (muy lento, hipnótico)
    if (padChordStep % 32 === 0) {
      lastPadChord = (lastPadChord + 1) % 4;
      
      // Acordes simples y ambientales
      const chords = [
        ['C3', 'Eb3', 'G3'],
        ['F3', 'Ab3', 'C4'],
        ['G3', 'Bb3', 'D4'],
        ['Eb3', 'G3', 'Bb3']
      ];
      
      padSynth.triggerAttackRelease(chords[lastPadChord], '2n', time);
      
      // Drone sample con variación de playback rate
      drone.playbackRate = 0.9 + Math.random() * 0.2; // Variación sutil
      drone.start(time);
    }
  }, '4n');
  
  // Loop de percusión generativo (más espacios para respirar)
  const percLoop = new Tone.Loop((time) => {
    // Patrón más espaciado para dar respiración
    const percPattern = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1];
    const step = stepCount % 16;
    
    if (percPattern[step]) {
      // Variación ocasional de playback rate para más variación
      perc.playbackRate = 0.95 + Math.random() * 0.1;
      perc.start(time);
    }
  }, '16n');

  // Lead generativo con notas aleatorias (sci-fi)
  const leadLoop = new Tone.Loop((time) => {
    // Aparece ocasionalmente (20% de probabilidad)
    if (Math.random() > 0.8) {
      const note = scale[Math.floor(Math.random() * scale.length)];
      const duration = ['8n', '4n', '8n.'][Math.floor(Math.random() * 3)];
      leadSynth.triggerAttackRelease(note, duration, time);
    }
  }, '4n');

  // === CONTROL DE VOLÚMENES (80% máximo, más duro) ===
  kick4_4.volume.value = -4;        // Kick 4/4 presente
  bassSamples.forEach(bass => bass.volume.value = -8);  // Bass samples
  hihatSamples.forEach(hh => hh.volume.value = -10);    // Hi-hats base
  drone.volume.value = -10;         // Drone de fondo
  perc.volume.value = -8;            // Percusión presente
  kickOriginal.volume.value = -12;  // Kick original para efectos
  bassSynth.volume.value = -12;     // Bass synth complementario (opcional)
  padSynth.volume.value = -14;      // Pad más suave
  leadSynth.volume.value = -16;     // Lead muy sutil

  // === CONTROL DE BOTÓN ===
  audioButton.addEventListener('click', async () => {
    if (!isPlaying) {
      // Iniciar
      await Tone.start();
      
      // Generar reverbs (async)
      await reverb.generate();
      await hihatReverb.generate();
      
      // Fade in suave
      Tone.Transport.bpm.value = 120;
      
      // Reset contadores
      stepCount = 0;
      padChordStep = 0;
      hihatEnergyCycle = 0;
      
      // Iniciar loops
      kickLoop.start(0);
      bassLoop.start(0);
      hihatLoop.start(0);
      padLoop.start(0);
      leadLoop.start(0);
      percLoop.start(0);
      Tone.Transport.start();
      
      isPlaying = true;
      audioButton.innerHTML = '⏸ Pausar';
      audioButton.style.opacity = '0.9';
    } else {
      // Pausar
      Tone.Transport.stop();
      kickLoop.stop();
      bassLoop.stop();
      hihatLoop.stop();
      padLoop.stop();
      leadLoop.stop();
      percLoop.stop();
      
      // Detener notas activas y samples
      bassSynth.releaseAll();
      padSynth.releaseAll();
      leadSynth.releaseAll();
      kick4_4.releaseAll();
      bassSamples.forEach(bass => bass.stop());
      hihatSamples.forEach(hh => hh.stop());
      drone.stop();
      perc.stop();
      kickOriginal.stop();
      
      isPlaying = false;
      audioButton.innerHTML = '▶ Reproducir';
      audioButton.style.opacity = '1';
    }
  });
})();

