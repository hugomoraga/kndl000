import * as Tone from 'https://cdn.skypack.dev/tone';
import { buildScale } from './config.js';

let synth, fx, kick, synthLoop, kickLoop;

export function setupAudio({ root, mode, bpm }, triggerVisual) {
  const scale = buildScale(root, mode);
  synth = new Tone.Synth().toDestination();
  kick = new Tone.MembraneSynth().toDestination();

  synthLoop = new Tone.Loop(time => {
    const note = scale[Math.floor(Math.random() * scale.length)];
    synth.triggerAttackRelease(note, '8n', time);
    triggerVisual(Tone.Frequency(note).toFrequency(), 1.2);
  }, '8n');

  kickLoop = new Tone.Loop(time => {
    kick.triggerAttackRelease('C1', '8n', time);
    triggerVisual(50, 2.5);
  }, '4n');

  Tone.Transport.bpm.value = bpm;
  synthLoop.start(0);
  kickLoop.start(0);
  Tone.Transport.start();
}

export function stopAudio() {
  Tone.Transport.stop();
  Tone.Transport.cancel();
  synthLoop?.dispose();
  kickLoop?.dispose();
  synth?.dispose();
  kick?.dispose();
}
