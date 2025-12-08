/**
 * Utils - Utilidades y funciones helper para Umbral Vision
 * KISS: Funciones simples y reutilizables
 */

/**
 * Obtiene el valor de un input de forma segura
 */
export function getInputValue(id, defaultValue, parser = parseFloat) {
  const element = document.getElementById(id);
  if (!element) return defaultValue;
  const value = parser(element.value);
  return isNaN(value) ? defaultValue : value;
}

/**
 * Normaliza un valor entre min y max
 */
export function normalize(value, min, max) {
  return (value - min) / (max - min);
}

/**
 * Mapea un valor de un rango a otro
 */
export function map(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**
 * Limita un valor entre min y max
 */
export function constrain(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Interpola entre dos valores
 */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * Genera ruido de glitch (valores aleatorios que cambian)
 */
export function glitchNoise(time, frequency = 0.1) {
  return Math.random() < frequency ? (Math.random() - 0.5) * 2 : 0;
}

/**
 * Onda de distorsión que se propaga
 */
export function distortionWave(x, y, time, speed = 0.1, amplitude = 10) {
  const wave = Math.sin((x + y) * 0.1 + time * speed);
  return wave * amplitude;
}

/**
 * Efecto de derretimiento (warp vertical)
 */
export function meltEffect(y, time, intensity = 1) {
  return Math.sin(y * 0.05 + time * 0.1) * intensity * 20;
}

/**
 * Desorden fractal (perturbación basada en ruido)
 */
export function fractalNoise(x, y, time, scale = 0.01) {
  const n1 = Math.sin(x * scale + time) * 0.5;
  const n2 = Math.cos(y * scale + time * 0.7) * 0.5;
  return (n1 + n2) * 50;
}

