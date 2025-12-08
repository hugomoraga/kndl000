/**
 * App - Aplicación principal que usa Umbral Vision
 * Inicializa la UI y conecta el framework con los controles HTML
 */

import { 
  Effects, 
  startVisualizer, 
  changeEffect, 
  getAvailableEffects,
  initAudio, 
  stopAudio, 
  getAudioState,
  startAutoTransition, 
  stopAutoTransition,
  getInputValue
} from './index.js';

// Variables para gestión de UI
let autoTransitionEnabled = false;

// Lista de efectos disponibles
const effectNames = getAvailableEffects();

/**
 * Cambiar efecto visual
 */
function changeEffectHandler(effectName) {
  changeEffect(effectName);
  
  // Actualizar selector
  const effectSelect = document.getElementById('effectSelect');
  if (effectSelect) {
    effectSelect.value = effectName;
  }
  
  // Detener transiciones automáticas cuando se cambia manualmente
  if (autoTransitionEnabled) {
    const autoTransitionCheck = document.getElementById('autoTransition');
    if (autoTransitionCheck) {
      autoTransitionCheck.checked = false;
      autoTransitionEnabled = false;
      stopAutoTransition();
    }
  }
}

/**
 * Configurar selector de efectos
 */
function setupEffectSelector() {
  const effectSelect = document.getElementById('effectSelect');
  if (!effectSelect) return;

  effectSelect.addEventListener('change', (e) => {
    changeEffectHandler(e.target.value);
  });
}

/**
 * Configurar transiciones automáticas
 */
function setupAutoTransition() {
  const autoTransitionCheck = document.getElementById('autoTransition');
  if (!autoTransitionCheck) return;

  // Actualizar valor mostrado del intervalo
  const intervalInput = document.getElementById('transitionInterval');
  const intervalValue = document.getElementById('transitionIntervalValue');
  
  if (intervalInput && intervalValue) {
    intervalInput.addEventListener('input', (e) => {
      intervalValue.textContent = e.target.value + 's';
      if (autoTransitionEnabled) {
        const interval = parseInt(e.target.value) * 1000;
        startAutoTransition(interval, effectNames, changeEffectHandler);
      }
    });
  }

  autoTransitionCheck.addEventListener('change', (e) => {
    autoTransitionEnabled = e.target.checked;
    
    if (autoTransitionEnabled) {
      const interval = getInputValue('transitionInterval', 10, parseInt) * 1000;
      startAutoTransition(interval, effectNames, changeEffectHandler);
    } else {
      stopAutoTransition();
    }
  });
}

/**
 * Configurar botón de micrófono
 */
function setupMicrophone() {
  const micBtn = document.getElementById('micBtn');
  if (!micBtn) {
    setTimeout(() => {
      const retryBtn = document.getElementById('micBtn');
      if (retryBtn) {
        setupMicrophoneButton(retryBtn);
      }
    }, 500);
    return;
  }
  
  setupMicrophoneButton(micBtn);
}

function setupMicrophoneButton(micBtn) {
  if (micBtn.hasAttribute('data-listener-attached')) {
    return;
  }
  
  micBtn.setAttribute('data-listener-attached', 'true');
  micBtn.style.pointerEvents = 'auto';
  micBtn.style.cursor = 'pointer';
  micBtn.style.opacity = '1';
  micBtn.style.visibility = 'visible';
  micBtn.setAttribute('tabindex', '0');
  
  micBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      micBtn.click();
    }
  });
  
  const clickHandler = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { enabled: audioEnabled } = getAudioState();
    
    if (!audioEnabled) {
      try {
        await initAudio();
        const micBtn = document.getElementById('micBtn');
        if (micBtn) {
          micBtn.textContent = '🎤 Mic: ON';
          micBtn.style.background = 'rgba(0,255,0,0.2)';
        }
        
        const audioLevelIndicator = document.getElementById('audioLevel');
        if (audioLevelIndicator) {
          audioLevelIndicator.style.display = 'block';
        }
        
        // Actualizar barra de nivel de audio
        updateAudioLevelIndicator();
      } catch (error) {
        console.error('Error en initAudio:', error);
        const micBtn = document.getElementById('micBtn');
        if (micBtn) {
          let errorMsg = '🎤 Mic: Error';
          if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            errorMsg = '🎤 Mic: Permiso denegado';
          } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            errorMsg = '🎤 Mic: No encontrado';
          }
          micBtn.textContent = errorMsg;
          micBtn.style.background = 'rgba(255,0,0,0.2)';
        }
      }
    } else {
      stopAudio();
      const micBtn = document.getElementById('micBtn');
      if (micBtn) {
        micBtn.textContent = '🎤 Mic: OFF';
        micBtn.style.background = 'rgba(255,255,255,0.1)';
      }
      
      const audioLevelIndicator = document.getElementById('audioLevel');
      if (audioLevelIndicator) {
        audioLevelIndicator.style.display = 'none';
      }
    }
  };
  
  micBtn.addEventListener('click', clickHandler);
}

/**
 * Actualizar indicador de nivel de audio
 */
function updateAudioLevelIndicator() {
  const audioLevelBar = document.getElementById('audioLevelBar');
  if (!audioLevelBar) return;
  
  function update() {
    const { level: audioLevel } = getAudioState();
    if (audioLevelBar) {
      audioLevelBar.style.width = (audioLevel * 100) + '%';
    }
    requestAnimationFrame(update);
  }
  update();
}

/**
 * Funcionalidad de fullscreen
 */
function setupFullscreen() {
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  if (!fullscreenBtn) return;

  function enterFullscreen() {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }

  function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }

  function updateFullscreenButton() {
    const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
    fullscreenBtn.textContent = isFullscreen ? '⛶ Exit Fullscreen' : '⛶ Fullscreen';
  }

  fullscreenBtn.addEventListener('click', () => {
    const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  });

  document.addEventListener('fullscreenchange', updateFullscreenButton);
  document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
  document.addEventListener('msfullscreenchange', updateFullscreenButton);
}

/**
 * Inicializar aplicación
 */
function initialize() {
  console.log('Inicializando Umbral Vision...');
  
  startVisualizer('tunnel');
  setupFullscreen();
  setupMicrophone();
  setupEffectSelector();
  setupAutoTransition();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
  window.addEventListener('load', () => {
    const micBtn = document.getElementById('micBtn');
    if (micBtn && !micBtn.hasAttribute('data-listener-attached')) {
      micBtn.setAttribute('data-listener-attached', 'true');
      setupMicrophone();
    }
  });
} else {
  setTimeout(initialize, 100);
  window.addEventListener('load', () => {
    const micBtn = document.getElementById('micBtn');
    if (micBtn && !micBtn.hasAttribute('data-listener-attached')) {
      micBtn.setAttribute('data-listener-attached', 'true');
      setupMicrophone();
    }
  });
}
