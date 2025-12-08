/**
 * AudioReactive - Manejo de reactividad al audio para efectos visuales
 * KISS: Gestión centralizada del análisis de audio
 */

let audioContext = null;
let analyser = null;
let microphone = null;
let audioStream = null;
let dataArray = null;
let audioLevel = 0;
let audioEnabled = false;
let audioUpdateActive = false;

/**
 * Inicializar análisis de audio del micrófono
 */
export async function initAudio() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('getUserMedia no está disponible en este navegador');
    }

    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      } 
    });
    
    audioStream = stream;
    
    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    
    microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);
    
    audioEnabled = true;
    audioUpdateActive = true;
    
    updateAudioLevel();
    
    return true;
  } catch (err) {
    console.error('Error al acceder al micrófono:', err);
    audioEnabled = false;
    audioUpdateActive = false;
    throw err;
  }
}

/**
 * Actualizar nivel de audio
 */
function updateAudioLevel() {
  if (!audioUpdateActive) return;
  
  if (audioEnabled && analyser && dataArray) {
    try {
      analyser.getByteFrequencyData(dataArray);
      
      let sum = 0;
      let count = 0;
      const focusRange = Math.min(64, dataArray.length);
      for (let i = 0; i < focusRange; i++) {
        sum += dataArray[i];
        count++;
      }
      audioLevel = (sum / count / 255) * 2;
      audioLevel = Math.min(1, audioLevel);
      
      if (audioLevel < 0.05) {
        audioLevel = 0;
      }
    } catch (err) {
      console.error('Error al leer datos de audio:', err);
      audioLevel = 0;
    }
  } else {
    audioLevel = 0;
  }
  
  if (audioUpdateActive) {
    requestAnimationFrame(updateAudioLevel);
  }
}

/**
 * Detener análisis de audio
 */
export function stopAudio() {
  audioUpdateActive = false;
  audioEnabled = false;
  audioLevel = 0;
  
  if (microphone) {
    try {
      microphone.disconnect();
    } catch (e) {
      console.warn('Error al desconectar micrófono:', e);
    }
    microphone = null;
  }
  
  if (audioStream) {
    try {
      audioStream.getTracks().forEach(track => track.stop());
    } catch (e) {
      console.warn('Error al detener stream:', e);
    }
    audioStream = null;
  }
  
  analyser = null;
  dataArray = null;
}

/**
 * Obtener estado del audio
 */
export function getAudioState() {
  return {
    enabled: audioEnabled,
    level: audioLevel
  };
}

/**
 * Obtener datos de frecuencia (para análisis avanzado)
 */
export function getFrequencyData() {
  if (!audioEnabled || !analyser || !dataArray) {
    return null;
  }
  
  analyser.getByteFrequencyData(dataArray);
  return Array.from(dataArray);
}

