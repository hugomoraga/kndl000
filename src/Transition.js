/**
 * Transition - Manejo de transiciones automáticas entre efectos
 * KISS: Sistema simple de transiciones
 */

let autoTransitionInterval = null;
let autoTransitionEnabled = false;
let transitionCallback = null;

/**
 * Iniciar transiciones automáticas
 */
export function startAutoTransition(interval, effectNames, onTransition) {
  stopAutoTransition();
  
  if (!effectNames || effectNames.length === 0) {
    console.warn('No hay efectos disponibles para transición');
    return;
  }
  
  transitionCallback = onTransition;
  autoTransitionEnabled = true;
  let currentIndex = 0;
  
  autoTransitionInterval = setInterval(() => {
    if (transitionCallback) {
      currentIndex = (currentIndex + 1) % effectNames.length;
      transitionCallback(effectNames[currentIndex]);
    }
  }, interval);
}

/**
 * Detener transiciones automáticas
 */
export function stopAutoTransition() {
  if (autoTransitionInterval) {
    clearInterval(autoTransitionInterval);
    autoTransitionInterval = null;
  }
  autoTransitionEnabled = false;
  transitionCallback = null;
}

/**
 * Verificar si las transiciones están activas
 */
export function isAutoTransitionEnabled() {
  return autoTransitionEnabled;
}

