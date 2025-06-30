import './components/control-panel.js';
import * as Tone from 'https://cdn.skypack.dev/tone';
import { setupAudio, stopAudio } from './audio.js';
import { initScene, createSphere, createWave } from './visualizer.js';

initScene();

const panel = document.querySelector('control-panel');

panel.addEventListener('start-audio', async () => {
  await Tone.start();
  const settings = panel.settings;  // ✅ acceso limpio
  setupAudio(settings, createWave);
});

panel.addEventListener('stop-audio', stopAudio);
