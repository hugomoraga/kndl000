/**
 * Audio Framework - Mini framework modular para generación de música
 * KISS: Separación de responsabilidades, fácil de extender
 * 
 * Punto de entrada centralizado - importa y exporta todos los módulos
 */

import { Effects } from './Effects.js';
import { Generators } from './Generators.js';
import { Channel } from './Channel.js';
import { Mixer } from './Mixer.js';
import { Transport } from './Transport.js';
import { PresetLoader } from './PresetLoader.js';
import { PatternEditor } from './PatternEditor.js';

// Exportar todo como un objeto namespace
export {
  Channel,
  Mixer,
  Transport,
  Effects,
  Generators,
  PresetLoader,
  PatternEditor
};

// También exportar como objeto para compatibilidad
export default {
  Channel,
  Mixer,
  Transport,
  Effects,
  Generators,
  PresetLoader,
  PatternEditor
};
