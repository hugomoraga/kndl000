import * as Tone from 'https://cdn.skypack.dev/tone';

export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
};

export const noteToMidi = { C: 60, D: 62, E: 64 };

export function buildScale(root, mode) {
  const base = noteToMidi[root];
  return SCALES[mode].map(i => Tone.Frequency(base + i, 'midi').toNote());
}

