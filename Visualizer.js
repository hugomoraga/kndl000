/**
 * Visualizer - Gestor principal del canvas y efectos visuales
 * KISS: Manejo centralizado de p5.js y efectos
 */

import { Effects } from './Effects.js';

let p5Instance = null;
let currentEffect = null;
let currentEffectName = null;

/**
 * Iniciar visualizador con un efecto específico
 */
export function startVisualizer(effectName = 'tunnel', container = null) {
  if (typeof p5 === 'undefined') {
    console.error('p5.js no está cargado');
    return;
  }

  if (!Effects[effectName]) {
    console.error('Efecto no encontrado:', effectName);
    return;
  }

  // Remover instancia anterior si existe
  if (p5Instance) {
    p5Instance.remove();
  }

  currentEffectName = effectName;

  p5Instance = new p5((sketch) => {
    sketch.setup = function() {
      const canvas = sketch.createCanvas(window.innerWidth, window.innerHeight);
      canvas.elt.style.width = '100%';
      canvas.elt.style.height = '100%';
      canvas.elt.style.maxWidth = '100%';
      sketch.colorMode(sketch.HSB, 360, 100, 100);
      sketch.stroke(255);
      sketch.noFill();
    };

    // Crear instancia del efecto
    currentEffect = Effects[effectName](sketch);

    sketch.draw = function() {
      if (currentEffect && currentEffect.draw) {
        currentEffect.draw();
      }
    };

    sketch.windowResized = function() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      sketch.resizeCanvas(width, height);
      const canvas = sketch.canvas;
      if (canvas && canvas.elt) {
        canvas.elt.style.width = '100%';
        canvas.elt.style.height = '100%';
        canvas.elt.style.maxWidth = '100%';
        canvas.elt.style.maxHeight = '100%';
      }
    };
  }, container);
}

/**
 * Cambiar efecto visual
 */
export function changeEffect(effectName) {
  console.log('Intentando cambiar a efecto:', effectName);
  console.log('Efectos disponibles:', Object.keys(Effects));
  console.log('Effects object:', Effects);
  
  if (!Effects[effectName]) {
    console.error('Efecto no encontrado:', effectName);
    console.log('Efectos disponibles:', Object.keys(Effects));
    return;
  }
  
  startVisualizer(effectName);
}

/**
 * Obtener efecto actual
 */
export function getCurrentEffect() {
  return currentEffectName;
}

/**
 * Obtener lista de efectos disponibles
 */
export function getAvailableEffects() {
  const effects = Object.keys(Effects);
  console.log('Efectos disponibles:', effects);
  return effects;
}

/**
 * Detener visualizador
 */
export function stopVisualizer() {
  if (p5Instance) {
    p5Instance.remove();
    p5Instance = null;
    currentEffect = null;
    currentEffectName = null;
  }
}

