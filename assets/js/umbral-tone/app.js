/**
 * Mixer App - Usa Umbral Tone para crear un mixer generativo
 * KISS: Configuración simple usando el framework modular
 */

import { Channel, Mixer, Transport, Effects, Generators, PresetLoader, PatternEditor } from './index.js';

  // === CONFIGURACIÓN ===
  // Usar ruta absoluta desde la raíz del sitio
  const SAMPLE_PATH = '/assets/media/audio/';
  
  const samples = {
    kick: 'kick.wav',
    drone: 'drone.wav',
    perc: 'perc.wav',
    bass: {
      A: 'bass-a.wav',
      B: 'bass-b.wav',
      'C#': 'bass-cs.wav',
      'D#': 'bass-ds.wav',
      F: 'bass-f.wav',
      G: 'bass-g.wav'
    },
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

  // === CREAR MIXER Y TRANSPORT ===
  const mixer = new Mixer({ masterVolume: -4 });
  const transport = new Transport({ bpm: 120 });

  // === CREAR CANALES ===
  
  // Kick 4/4
  const kickChannel = new Channel({
    name: 'Kick 4/4',
    volume: -4
  });
  kickChannel.source = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 10,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
  });
  kickChannel._rebuildChain();
  mixer.addChannel('kick', kickChannel);

  // Bass
  const bassChannel = new Channel({
    name: 'Bass',
    volume: -8
  });
  bassChannel.samples = Object.values(samples.bass).map(file => {
    const player = new Tone.Player(SAMPLE_PATH + file);
    player.chain(bassChannel.volume);
    return player;
  });
  mixer.addChannel('bass', bassChannel);

  // Hi-hat
  const hihatChannel = new Channel({
    name: 'Hi-Hat',
    volume: -10
  });
  const hihatEffects = Effects.ambient({
    delay: { delayTime: '8n', feedback: 0.35, wet: 0.3 },
    reverb: { roomSize: 0.8, dampening: 2000, wet: 0.4 }
  });
  // Añadir efectos al canal para que getDelay() y getReverb() funcionen
  hihatChannel.addEffects(hihatEffects);
  hihatChannel.samples = Object.values(samples.hihat).map(file => {
    const player = new Tone.Player(SAMPLE_PATH + file);
    // Conectar: player -> delay -> reverb -> volume
    player.chain(...hihatEffects, hihatChannel.volume);
    return player;
  });
  mixer.addChannel('hihat', hihatChannel);

  // Drone
  const droneChannel = new Channel({
    name: 'Drone',
    volume: -10
  });
  droneChannel.source = new Tone.Player(SAMPLE_PATH + samples.drone);
  droneChannel.addEffects(Effects.ambient({
    delay: { delayTime: '8n', feedback: 0.4, wet: 0.3 },
    reverb: { roomSize: 0.95, dampening: 4000, wet: 0.5 }
  }));
  droneChannel._rebuildChain();
  mixer.addChannel('drone', droneChannel);

  // Pad
  const padChannel = new Channel({
    name: 'Pad',
    volume: -14
  });
  padChannel.source = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 2, decay: 1, sustain: 0.8, release: 3 }
  });
  padChannel.addEffects(Effects.ambient({
    delay: { delayTime: '8n', feedback: 0.4, wet: 0.3 },
    reverb: { roomSize: 0.95, dampening: 4000, wet: 0.5 }
  }));
  padChannel._rebuildChain();
  mixer.addChannel('pad', padChannel);

  // Perc
  const percChannel = new Channel({
    name: 'Perc',
    volume: -8
  });
  percChannel.source = new Tone.Player(SAMPLE_PATH + samples.perc);
  percChannel._rebuildChain();
  mixer.addChannel('perc', percChannel);

  // Lead
  const leadChannel = new Channel({
    name: 'Lead',
    volume: -16
  });
  leadChannel.source = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.5 }
  });
  leadChannel.addEffects(Effects.ambient({
    delay: { delayTime: '8n', feedback: 0.3, wet: 0.2 },
    reverb: { roomSize: 0.9, dampening: 3000, wet: 0.4 }
  }));
  leadChannel._rebuildChain();
  mixer.addChannel('lead', leadChannel);

  // Los canales ya están conectados al mixer al añadirlos

  // === CREAR PATRONES EDITABLES ===
  const patternEditors = new Map();
  
  // Kick pattern
  const kickPattern = new PatternEditor(kickChannel, 16);
  kickPattern.setPattern([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]);
  patternEditors.set('kick', kickPattern);

  // Bass pattern
  const bassPattern = new PatternEditor(bassChannel, 16);
  bassPattern.setPattern([1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  patternEditors.set('bass', bassPattern);

  // Hi-hat pattern
  const hihatPattern = new PatternEditor(hihatChannel, 16);
  hihatPattern.setPattern([0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]);
  patternEditors.set('hihat', hihatPattern);

  // Perc pattern
  const percPattern = new PatternEditor(percChannel, 16);
  percPattern.setPattern([0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1]);
  patternEditors.set('perc', percPattern);

  // === CREAR LOOPS ===
  const scale = ['C2', 'Eb2', 'F2', 'G2', 'Bb2', 'C3', 'Eb3', 'F3', 'G3', 'Bb3'];
  let lastPadChord = 0;
  let padChordStep = 0;
  let hihatEnergyCycle = 0;
  const HIHAT_CYCLE_LENGTH = 128;

  // Kick 4/4
  kickChannel.setLoop((time, stepCount) => {
    const step = stepCount % 16;
    const pattern = kickPattern.getPattern();
    if (pattern[step]) {
      kickChannel.source.triggerAttackRelease('C1', '8n', time);
    }
  }, '16n', transport);

  // Bass
  bassChannel.setLoop((time, stepCount) => {
    const step = stepCount % 16;
    const pattern = bassPattern.getPattern();
    if (pattern[step]) {
      const bassIndex = Math.floor(Math.random() * bassChannel.samples.length);
      const selectedBass = bassChannel.samples[bassIndex];
      selectedBass.playbackRate = Generators.pitchVariation(1, 0.02);
      selectedBass.start(time);
    }
  }, '16n', transport);

  // Hi-hat con ciclo de energía
  hihatChannel.setLoop((time, stepCount) => {
    const step = stepCount % 16;
    hihatEnergyCycle = (hihatEnergyCycle + 1) % HIHAT_CYCLE_LENGTH;
    
    let energyLevel = 0;
    if (hihatEnergyCycle < 64) {
      energyLevel = 0;
    } else if (hihatEnergyCycle < 96) {
      energyLevel = (hihatEnergyCycle - 64) / 32;
    } else {
      energyLevel = 1;
    }
    
    const pattern = hihatPattern.getPattern();
    if (pattern[step] && energyLevel > 0.1) {
      const hhIndex = Math.floor(Math.random() * hihatChannel.samples.length);
      const selectedHH = hihatChannel.samples[hhIndex];
      const baseVolume = -15 + (energyLevel * 7);
      selectedHH.volume.value = baseVolume;
      selectedHH.playbackRate = Generators.pitchVariation(1, 0.05);
      selectedHH.start(time);
    }
  }, '16n', transport);

  // Drone
  droneChannel.setLoop((time) => {
    padChordStep++;
    if (padChordStep % 32 === 0) {
      droneChannel.source.playbackRate = Generators.pitchVariation(1, 0.1);
      droneChannel.source.start(time);
    }
  }, '4n');

  // Pad
  padChannel.setLoop((time) => {
    padChordStep++;
    if (padChordStep % 32 === 0) {
      lastPadChord = (lastPadChord + 1) % 4;
      const chords = [
        ['C3', 'Eb3', 'G3'],
        ['F3', 'Ab3', 'C4'],
        ['G3', 'Bb3', 'D4'],
        ['Eb3', 'G3', 'Bb3']
      ];
      padChannel.source.triggerAttackRelease(chords[lastPadChord], '2n', time);
    }
  }, '4n');

  // Perc
  percChannel.setLoop((time, stepCount) => {
    const step = stepCount % 16;
    const pattern = percPattern.getPattern();
    if (pattern[step]) {
      percChannel.source.playbackRate = Generators.pitchVariation(1, 0.05);
      percChannel.source.start(time);
    }
  }, '16n', transport);

  // Lead
  leadChannel.setLoop((time) => {
    if (Math.random() > 0.8) {
      const note = Generators.randomFrom(scale);
      const duration = Generators.randomFrom(['8n', '4n', '8n.']);
      leadChannel.source.triggerAttackRelease(note, duration, time);
    }
  }, '4n');

  // === UI ===
  function createChannelUI(channelKey, channel) {
    const container = document.getElementById('mixer-channels');
    const channelDiv = document.createElement('div');
    channelDiv.className = 'mixer-channel';
    channelDiv.id = `channel-${channelKey}`;

    const label = document.createElement('p');
    label.className = 'channel-label';
    label.textContent = channel.name;
    channelDiv.appendChild(label);

    const faderContainer = document.createElement('div');
    faderContainer.className = 'channel-fader-container';
    
    const fader = document.createElement('input');
    fader.type = 'range';
    fader.className = 'channel-fader';
    fader.min = '-20';
    fader.max = '0';
    fader.step = '0.5';
    fader.value = channel.getVolume();
    fader.id = `fader-${channelKey}`;
    faderContainer.appendChild(fader);
    channelDiv.appendChild(faderContainer);

    const valueDisplay = document.createElement('div');
    valueDisplay.className = 'channel-value';
    valueDisplay.id = `value-${channelKey}`;
    valueDisplay.textContent = `${channel.getVolume().toFixed(1)} dB`;
    channelDiv.appendChild(valueDisplay);

    const controls = document.createElement('div');
    controls.className = 'channel-controls';
    
    const muteBtn = document.createElement('button');
    muteBtn.className = 'channel-btn';
    muteBtn.id = `mute-${channelKey}`;
    muteBtn.textContent = 'M';
    controls.appendChild(muteBtn);
    
    const soloBtn = document.createElement('button');
    soloBtn.className = 'channel-btn';
    soloBtn.id = `solo-${channelKey}`;
    soloBtn.textContent = 'S';
    controls.appendChild(soloBtn);
    
    channelDiv.appendChild(controls);

    // Controles de efectos (Delay y Reverb)
    const delay = channel.getDelay();
    const reverb = channel.getReverb();

    if (delay || reverb) {
      const effectsContainer = document.createElement('div');
      effectsContainer.className = 'channel-effects';
      
      if (delay) {
        const delayContainer = document.createElement('div');
        delayContainer.className = 'effect-control';
        
        const delayLabel = document.createElement('label');
        delayLabel.className = 'effect-label';
        delayLabel.textContent = 'Dly';
        delayLabel.htmlFor = `delay-wet-${channelKey}`;
        delayContainer.appendChild(delayLabel);
        
        const delayWet = document.createElement('input');
        delayWet.type = 'range';
        delayWet.className = 'effect-slider';
        delayWet.min = '0';
        delayWet.max = '1';
        delayWet.step = '0.01';
        delayWet.value = delay.wet.value;
        delayWet.id = `delay-wet-${channelKey}`;
        delayWet.addEventListener('input', (e) => {
          delay.wet.value = parseFloat(e.target.value);
        });
        delayContainer.appendChild(delayWet);
        
        const delayValue = document.createElement('span');
        delayValue.className = 'effect-value';
        delayValue.textContent = (delay.wet.value * 100).toFixed(0) + '%';
        delayWet.addEventListener('input', (e) => {
          delayValue.textContent = (parseFloat(e.target.value) * 100).toFixed(0) + '%';
        });
        delayContainer.appendChild(delayValue);
        
        effectsContainer.appendChild(delayContainer);
      }

      if (reverb) {
        const reverbContainer = document.createElement('div');
        reverbContainer.className = 'effect-control';
        
        const reverbLabel = document.createElement('label');
        reverbLabel.className = 'effect-label';
        reverbLabel.textContent = 'Rev';
        reverbLabel.htmlFor = `reverb-wet-${channelKey}`;
        reverbContainer.appendChild(reverbLabel);
        
        const reverbWet = document.createElement('input');
        reverbWet.type = 'range';
        reverbWet.className = 'effect-slider';
        reverbWet.min = '0';
        reverbWet.max = '1';
        reverbWet.step = '0.01';
        reverbWet.value = reverb.wet.value;
        reverbWet.id = `reverb-wet-${channelKey}`;
        reverbWet.addEventListener('input', (e) => {
          reverb.wet.value = parseFloat(e.target.value);
        });
        reverbContainer.appendChild(reverbWet);
        
        const reverbValue = document.createElement('span');
        reverbValue.className = 'effect-value';
        reverbValue.textContent = (reverb.wet.value * 100).toFixed(0) + '%';
        reverbWet.addEventListener('input', (e) => {
          reverbValue.textContent = (parseFloat(e.target.value) * 100).toFixed(0) + '%';
        });
        reverbContainer.appendChild(reverbValue);
        
        effectsContainer.appendChild(reverbContainer);
      }
      
      channelDiv.appendChild(effectsContainer);
    }

    // Editor de patrones (solo para canales con patrones editables)
    const patternEditor = patternEditors.get(channelKey);
    if (patternEditor) {
      const patternContainer = document.createElement('div');
      patternContainer.id = `pattern-container-${channelKey}`;
      patternContainer.className = 'pattern-container';
      channelDiv.appendChild(patternContainer);
      // Crear UI pasando el elemento directamente
      patternEditor.createUI(patternContainer);
    }
    
    container.appendChild(channelDiv);

    // Event listeners
    fader.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      channel.setVolume(value);
      valueDisplay.textContent = `${value.toFixed(1)} dB`;
    });

    muteBtn.addEventListener('click', () => {
      channel.toggleMute();
      muteBtn.classList.toggle('muted', channel.muted);
      muteBtn.classList.toggle('active', channel.muted);
      mixer.updateChannelStates();
    });

    soloBtn.addEventListener('click', () => {
      channel.toggleSolo();
      soloBtn.classList.toggle('solo', channel.solo);
      soloBtn.classList.toggle('active', channel.solo);
      mixer.updateChannelStates();
    });
  }

  // === TRANSPORT ===
  function initTransport() {
    const playBtn = document.getElementById('transport-play');
    const bpmControl = document.getElementById('bpm-control');
    const bpmValue = document.getElementById('bpm-value');
    const masterVolumeControl = document.getElementById('master-volume');
    const masterVolumeValue = document.getElementById('master-volume-value');

    playBtn.addEventListener('click', async () => {
      if (!transport.isPlaying) {
        // Generar reverbs antes de empezar
        const reverbs = [];
        mixer.getChannels().forEach(ch => {
          ch.effects.forEach(effect => {
            if (effect instanceof Tone.Reverb) {
              reverbs.push(effect.generate());
            }
          });
        });
        await Promise.all(reverbs);
        
        await transport.start();
        mixer.startLoops();
        playBtn.textContent = '⏸ Pausar';
      } else {
        transport.stop();
        mixer.stopLoops();
        // Detener todos los sources
        mixer.getChannels().forEach(ch => {
          if (ch.source) {
            if (ch.source.releaseAll) ch.source.releaseAll();
            if (ch.source.stop) ch.source.stop();
          }
          if (ch.samples) {
            ch.samples.forEach(s => s.stop());
          }
        });
        playBtn.textContent = '▶ Reproducir';
      }
    });

    bpmControl.addEventListener('input', (e) => {
      const bpm = parseInt(e.target.value);
      transport.setBPM(bpm);
      bpmValue.textContent = bpm;
    });

    // Sincronizar visualización de patrones con el transport
    transport.onStep((time, stepCount) => {
      patternEditors.forEach((editor, key) => {
        const step = stepCount % 16;
        editor.setCurrentStep(step);
      });
    });

    masterVolumeControl.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      mixer.setMasterVolume(value);
      masterVolumeValue.textContent = `${value.toFixed(1)} dB`;
    });
  }

  // === PRESETS ===
  const presets = [
    { name: 'Techno Ambiental', file: '/assets/data/presets/default.json' },
    { name: 'Minimal', file: '/assets/data/presets/minimal.json' },
    { name: 'Ambient', file: '/assets/data/presets/ambient.json' }
  ];

  function initPresets() {
    const presetSelect = document.getElementById('preset-select');
    if (!presetSelect) return;

    // Llenar selector
    presets.forEach((preset, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = preset.name;
      presetSelect.appendChild(option);
    });

    // Cargar preset al cambiar
    presetSelect.addEventListener('change', async (e) => {
      const presetIndex = parseInt(e.target.value);
      if (presetIndex < 0) return;

      const preset = presets[presetIndex];
      try {
        const presetData = await PresetLoader.loadPreset(preset.file);
        PresetLoader.applyPreset(mixer, transport, presetData);
        
        // Actualizar UI
        updateUIFromPreset(presetData);
        
        // Actualizar BPM display
        const bpmValue = document.getElementById('bpm-value');
        const bpmControl = document.getElementById('bpm-control');
        if (bpmValue && bpmControl) {
          bpmValue.textContent = transport.getBPM();
          bpmControl.value = transport.getBPM();
        }
      } catch (error) {
        console.error('Error loading preset:', error);
        alert('Error al cargar el preset: ' + error.message);
      }
    });
  }

  function updateUIFromPreset(preset) {
    // Actualizar faders y valores
    mixer.getChannelKeys().forEach(key => {
      const channel = mixer.getChannel(key);
      const fader = document.getElementById(`fader-${key}`);
      const valueDisplay = document.getElementById(`value-${key}`);
      
      if (fader && valueDisplay) {
        fader.value = channel.getVolume();
        valueDisplay.textContent = `${channel.getVolume().toFixed(1)} dB`;
      }

      // Actualizar controles de efectos
      const delay = channel.getDelay();
      const reverb = channel.getReverb();
      
      if (delay) {
        const delayWet = document.getElementById(`delay-wet-${key}`);
        const delayValue = delayWet?.nextElementSibling;
        if (delayWet) {
          delayWet.value = delay.wet.value;
          if (delayValue) {
            delayValue.textContent = (delay.wet.value * 100).toFixed(0) + '%';
          }
        }
      }

      if (reverb) {
        const reverbWet = document.getElementById(`reverb-wet-${key}`);
        const reverbValue = reverbWet?.nextElementSibling;
        if (reverbWet) {
          reverbWet.value = reverb.wet.value;
          if (reverbValue) {
            reverbValue.textContent = (reverb.wet.value * 100).toFixed(0) + '%';
          }
        }
      }
    });

    // Actualizar master volume
    const masterVolumeControl = document.getElementById('master-volume');
    const masterVolumeValue = document.getElementById('master-volume-value');
    if (masterVolumeControl && masterVolumeValue) {
      masterVolumeControl.value = mixer.getMasterVolume();
      masterVolumeValue.textContent = `${mixer.getMasterVolume().toFixed(1)} dB`;
    }
  }

  // === INICIALIZACIÓN ===
  function init() {
    // Crear UI para cada canal
    mixer.getChannelKeys().forEach(key => {
      createChannelUI(key, mixer.getChannel(key));
    });
    
    initTransport();
    initPresets();
  }

  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
