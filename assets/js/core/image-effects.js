// Efectos dinámicos para imágenes del collage - Versión refactorizada y mantenible
(function() {
  'use strict';

  // ============================================================================
  // CONSTANTES Y CONFIGURACIÓN
  // ============================================================================

  const CONFIG = {
    // Velocidad unificada para todas las animaciones
    ANIMATION_SPEED: 0.8,
    
    // Seeds offsets para diferentes generadores aleatorios
    SEED_OFFSETS: {
      DIRECTION: 1000,
      RED_TYPE: 2000,
      BLUE_TYPE: 3000,
      FACTORS: 50000,
      STEPS: 60000,
      STEP_VALUES: 70000,
      BLUE_KEYFRAMES: 10000,
      MAIN_KEYFRAMES: 20000
    },
    
    // Offset multipliers por tipo de movimiento (usar las mismas claves que movementTypes)
    OFFSET_MULTIPLIERS: {
      'vertical': { x: 0, y: { min: 2.0, max: 3.0 } }, // Reducido para movimiento más suave
      'horizontal': { x: { min: 2.0, max: 3.0 }, y: 0 }, // Reducido para movimiento más suave
      'diagonal': { x: { min: 1.5, max: 2.2 }, y: { min: 1.5, max: 2.2 } },
      'mixed': { x: { min: 1.2, max: 1.8 }, y: { min: 1.2, max: 1.8 } }
    },
    
    // Parallax mouse following
    PARALLAX: {
      MAX_OFFSET: 8,
      MAX_INTENSITY: 1.5,
      SCALE: 1.02,
      RGB_SEPARATION: 0.5
    },
    
    // Mobile scroll
    MOBILE_SCROLL_TIMEOUT: 300,
    MOBILE_TOUCH_THRESHOLD: 5
  };

  // Presets de efectos base con más saturación y color
  const effectPresets = [
    { speed: CONFIG.ANIMATION_SPEED, intensity: 1.15, maxOffset: 3, opacity: 0.6, saturation: 2.5, redHue: 0, blueHue: 140 },
    { speed: CONFIG.ANIMATION_SPEED, intensity: 1.25, maxOffset: 6, opacity: 0.8, saturation: 3.0, redHue: -30, blueHue: 120 },
    { speed: CONFIG.ANIMATION_SPEED, intensity: 1.35, maxOffset: 10, opacity: 0.95, saturation: 3.5, redHue: -60, blueHue: 100 }
  ];

  // Tipos de movimiento
  const movementTypes = {
    VERTICAL: 'vertical',
    HORIZONTAL: 'horizontal',
    DIAGONAL: 'diagonal',
    MIXED: 'mixed'
  };

  // Configuración por tipo de movimiento
  const movementTypeConfig = {
    [movementTypes.VERTICAL]: {
      steps: [0, 20, 40, 50, 60, 80, 100],
      timingFunction: 'ease-in-out',
      useRGB: true, // Habilitar RGB para todos los tipos
      rgbOpacity: 0.5, // Opacidad más visible
      offsetMultiplier: 2.5,
      saturationMultiplier: 1.0, // Aumentar saturación
      intensityMultiplier: 0.9
    },
    [movementTypes.HORIZONTAL]: {
      steps: [0, 10, 25, 35, 50, 65, 85, 100],
      timingFunction: 'linear',
      useRGB: true,
      rgbOpacity: 0.6, // Aumentar opacidad RGB
      offsetMultiplier: 2.5,
      saturationMultiplier: 1.0, // Aumentar saturación
      intensityMultiplier: 0.9
    },
    [movementTypes.DIAGONAL]: {
      steps: [0, 12, 30, 45, 60, 75, 88, 100],
      timingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      useRGB: true,
      rgbOpacity: 0.7, // Aumentar opacidad RGB
      offsetMultiplier: 2.0,
      saturationMultiplier: 1.1, // Aumentar saturación
      intensityMultiplier: 1.0
    },
    [movementTypes.MIXED]: {
      steps: [0, 8, 18, 28, 42, 58, 72, 88, 100],
      timingFunction: 'steps(4, end)',
      useRGB: true,
      rgbOpacity: 0.65, // Aumentar opacidad RGB
      offsetMultiplier: 2.0,
      saturationMultiplier: 1.0, // Aumentar saturación
      intensityMultiplier: 0.9
    }
  };

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  const utils = {
    ready: (fn) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn);
      } else {
        fn();
      }
    },
    
    createSeededRandom: (seed) => {
      let currentSeed = seed;
      return () => {
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        return currentSeed / 233280;
      };
    },
    
    generateUniqueSeed: (imgSrc, index) => {
      const fileName = imgSrc.split('/').pop().split('?')[0];
      const imgHash = fileName.split('').reduce((acc, char, i) => acc + (char.charCodeAt(0) * (i + 1)), 0);
      return Math.abs((index * 7919) + (imgHash * 997) + (fileName.length * 3571));
    }
  };

  // ============================================================================
  // DETECCIÓN DE DISPOSITIVO
  // ============================================================================

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  // ============================================================================
  // GENERACIÓN DE TIPOS Y CONFIGURACIONES
  // ============================================================================

  function getMovementType(seed, index = 0) {
    const getRand = utils.createSeededRandom(seed);
    // Usar el índice de la imagen combinado con el seed para distribución más balanceada
    // Esto asegura que diferentes imágenes tengan diferentes tipos
    const rand = getRand();
    const indexFactor = (index % 4); // 0, 1, 2, 3
    
    // Distribución más balanceada usando el índice para alternar tipos
    // Esto garantiza que haya variedad visual
    const typePattern = [
      movementTypes.VERTICAL,    // índice 0, 4, 8...
      movementTypes.HORIZONTAL,  // índice 1, 5, 9...
      movementTypes.DIAGONAL,    // índice 2, 6, 10...
      movementTypes.MIXED        // índice 3, 7, 11...
    ];
    
    // Usar el patrón base pero con variación aleatoria basada en seed
    const baseType = typePattern[indexFactor];
    const variation = Math.floor(rand * 4);
    
    // 70% del tiempo usar el patrón base, 30% variar
    if (rand < 0.7) {
      return baseType;
    } else {
      return typePattern[variation];
    }
  }

  function getTimingFunction(movementType) {
    return movementTypeConfig[movementType]?.timingFunction || 'linear';
  }

  function getStepsForMovementType(movementType) {
    return movementTypeConfig[movementType]?.steps || [0, 25, 50, 75, 100];
  }

  function calculateOffsetRanges(movementType, baseOffset, getRand) {
    // Asegurar que siempre haya un multiplier válido
    const multipliers = CONFIG.OFFSET_MULTIPLIERS[movementType] || CONFIG.OFFSET_MULTIPLIERS[movementTypes.MIXED];
    
    if (!multipliers) {
      // Fallback por si acaso
      return { x: baseOffset, y: baseOffset };
    }
    
    const getRange = (multiplier) => {
      if (multiplier === undefined || multiplier === null) return baseOffset;
      if (typeof multiplier === 'number') return multiplier === 0 ? 0 : baseOffset * multiplier;
      if (typeof multiplier === 'object' && multiplier.min !== undefined && multiplier.max !== undefined) {
        return baseOffset * (multiplier.min + getRand() * (multiplier.max - multiplier.min));
      }
      return baseOffset;
    };
    
    return {
      x: getRange(multipliers.x),
      y: getRange(multipliers.y)
    };
  }

  // ============================================================================
  // GENERACIÓN DE TRANSFORMS POR TIPO
  // ============================================================================

  function generateTransformForType(movementType, stepIndex, offsetRanges, direction, getStepRand) {
    const stepValue = getStepRand();
    const stepValue2 = getStepRand();
    
    switch (movementType) {
      case movementTypes.VERTICAL: {
        // Movimiento vertical más suave y fluido
        const verticalWave = Math.sin(stepIndex * 1.2) * 0.7 + Math.cos(stepIndex * 0.6) * 0.3;
        const offsetY = verticalWave * offsetRanges.y * direction;
        // Asegurar que SOLO hay movimiento vertical, sin X
        return `translate(0px, ${offsetY.toFixed(2)}px)`;
      }
      
      case movementTypes.HORIZONTAL: {
        // Movimiento horizontal más suave y fluido
        const horizontalWave = Math.sin(stepIndex * 1.0) * 0.7 + Math.cos(stepIndex * 0.5) * 0.3;
        const offsetX = horizontalWave * offsetRanges.x * direction;
        // Asegurar que SOLO hay movimiento horizontal, sin Y
        return `translate(${offsetX.toFixed(2)}px, 0px)`;
      }
      
      case movementTypes.DIAGONAL: {
        // Movimiento diagonal más suave
        const diagonalPhase = stepIndex * 0.9;
        const diagX = Math.sin(diagonalPhase) * offsetRanges.x * 0.6 * direction;
        const diagY = Math.cos(diagonalPhase) * offsetRanges.y * 0.6 * direction;
        return `translate(${diagX.toFixed(2)}px, ${diagY.toFixed(2)}px)`;
      }
      
      case movementTypes.MIXED:
      default: {
        // Movimiento mixto más suave
        const mixedPhase = stepIndex * 0.6;
        const mixX = (Math.sin(mixedPhase) * 0.5 + (stepValue * 2 - 1) * 0.3) * offsetRanges.x * 0.6 * direction;
        const mixY = (Math.cos(mixedPhase * 1.0) * 0.5 + (stepValue2 * 2 - 1) * 0.3) * offsetRanges.y * 0.6 * direction;
        const scale = 1 + Math.sin(stepIndex * 0.4) * 0.04; // Reducido el scale para menos brusquedad
        return `translate(${mixX.toFixed(2)}px, ${mixY.toFixed(2)}px) scale(${scale.toFixed(3)})`;
      }
    }
  }

  // ============================================================================
  // GENERACIÓN DE KEYFRAMES
  // ============================================================================

  function generateKeyframes(preset, direction, seed, movementType) {
    const getRand = utils.createSeededRandom(seed);
    const steps = getStepsForMovementType(movementType);
    const keyframes = [];
    
    const offsetRanges = calculateOffsetRanges(movementType, preset.maxOffset, getRand);
    const stepSeed = seed + CONFIG.SEED_OFFSETS.STEP_VALUES;
    const getStepRand = utils.createSeededRandom(stepSeed);
    
    // Debug: verificar offset ranges calculados solo para vertical y horizontal
    if (movementType === movementTypes.VERTICAL) {
      console.log(`  ⬆️ VERTICAL - OffsetX: ${offsetRanges.x}, OffsetY: ${offsetRanges.y.toFixed(2)}, BaseOffset: ${preset.maxOffset}`);
    } else if (movementType === movementTypes.HORIZONTAL) {
      console.log(`  ➡️ HORIZONTAL - OffsetX: ${offsetRanges.x.toFixed(2)}, OffsetY: ${offsetRanges.y}, BaseOffset: ${preset.maxOffset}`);
    }

    const createFilterString = (stepIndex = 0, step = 0) => {
      // Variación dinámica de color basada en el step
      const hueVariation = Math.sin(stepIndex * 0.8) * 30; // Variación de ±30 grados
      const saturationVariation = 1 + Math.sin(stepIndex * 0.6) * 0.3; // Variación de saturación
      const brightnessVariation = 1 + Math.cos(stepIndex * 0.7) * 0.15; // Variación de brillo
      
      const dynamicHue = preset.redHue + hueVariation;
      const dynamicSaturation = preset.saturation * saturationVariation;
      const dynamicBrightness = preset.intensity * brightnessVariation;
      
      return `brightness(${dynamicBrightness.toFixed(2)}) contrast(${preset.intensity}) saturate(${dynamicSaturation.toFixed(2)}) hue-rotate(${dynamicHue.toFixed(1)}deg)`;
    };

    steps.forEach((step, stepIndex) => {
      if (step === 0 || step === 100) {
        keyframes.push({
          step,
          transform: 'translate(0)',
          clipPath: 'none',
          filter: createFilterString(stepIndex, step)
        });
      } else {
        const transformValue = generateTransformForType(movementType, stepIndex, offsetRanges, direction, getStepRand);
        
        keyframes.push({
          step,
          transform: transformValue,
          clipPath: 'none',
          filter: createFilterString(stepIndex, step) // Pasar stepIndex para variación de color
        });
      }
    });

    return keyframes;
  }

  // ============================================================================
  // INYECCIÓN DE ESTILOS CSS
  // ============================================================================

  const STYLE_VERSION = Date.now().toString(36);
  
  function getStyleSheet() {
    let styleSheet = document.getElementById('dynamic-glitch-styles');
    if (!styleSheet) {
      styleSheet = document.createElement('style');
      styleSheet.id = 'dynamic-glitch-styles';
      styleSheet.dataset.version = STYLE_VERSION;
      document.head.appendChild(styleSheet);
    }
    return styleSheet;
  }

  function injectKeyframes(name, keyframes, movementType) {
    const styleSheet = getStyleSheet();
    const timingFunction = getTimingFunction(movementType);
    
    let keyframeText = `@keyframes ${name} {\n`;
    keyframes.forEach(kf => {
      keyframeText += `  ${kf.step}% {\n`;
      keyframeText += `    transform: ${kf.transform};\n`;
      keyframeText += `    clip-path: ${kf.clipPath};\n`;
      if (kf.filter) {
        keyframeText += `    filter: ${kf.filter};\n`;
      }
      keyframeText += `  }\n`;
    });
    keyframeText += `}\n`;

    styleSheet.textContent += keyframeText;
  }

  // ============================================================================
  // CREACIÓN DE CAPAS RGB
  // ============================================================================

  function createRGBLayer(imgSrc, className, preset, hueShift) {
    const layer = document.createElement('div');
    layer.className = `glitch-rgb-layer ${className}`;
    layer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url(${imgSrc});
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      opacity: 0;
      pointer-events: none;
      z-index: 2;
      mix-blend-mode: screen;
      filter: brightness(${(preset.intensity * 1.1).toFixed(2)}) contrast(${(preset.intensity * 1.1).toFixed(2)}) saturate(${(preset.saturation * 1.3).toFixed(2)}) hue-rotate(${hueShift}deg);
      transition: opacity 0.3s;
    `;
    return layer;
  }

  // ============================================================================
  // CONTROL DE ANIMACIONES GLITCH
  // ============================================================================

  function activateGlitch(redLayer, blueLayer, img, animationId, preset, movementType, useRGB = true) {
    const timingFunction = getTimingFunction(movementType);
    
    // Limpiar cualquier transform inline que pueda interferir con la animación
    if (img) img.style.transform = '';
    
    if (useRGB && redLayer && redLayer.style.display !== 'none') {
      if (redLayer) {
        redLayer.style.opacity = preset.opacity || 0;
        redLayer.style.transform = '';
        redLayer.style.animation = `${animationId}-red ${preset.speed}s ${timingFunction} infinite`;
      }
      if (blueLayer) {
        blueLayer.style.opacity = preset.opacity || 0;
        blueLayer.style.transform = '';
        blueLayer.style.animation = `${animationId}-blue ${preset.speed}s ${timingFunction} infinite`;
      }
    } else {
      if (redLayer) {
        redLayer.style.opacity = '0';
        redLayer.style.animation = 'none';
      }
      if (blueLayer) {
        blueLayer.style.opacity = '0';
        blueLayer.style.animation = 'none';
      }
    }
    
    if (img) {
      img.style.animation = `${animationId}-main ${preset.speed}s ${timingFunction} infinite`;
    }
  }

  function deactivateGlitch(redLayer, blueLayer, img) {
    redLayer.style.opacity = '0';
    blueLayer.style.opacity = '0';
    redLayer.style.animation = 'none';
    blueLayer.style.animation = 'none';
    img.style.animation = 'none';
  }

  // ============================================================================
  // CONFIGURACIÓN DE PRESETS POR TIPO
  // ============================================================================

  function createPresetsForMovementType(mainMovementType, basePreset, direction) {
    const config = movementTypeConfig[mainMovementType];
    const useRGB = config.useRGB;
    
    let redMovementType, blueMovementType;
    
    if (mainMovementType === movementTypes.MIXED) {
      // Mixed usa tipos diferentes para las capas RGB
      redMovementType = movementTypes.HORIZONTAL;
      blueMovementType = movementTypes.VERTICAL;
    } else {
      redMovementType = mainMovementType;
      blueMovementType = mainMovementType;
    }
    
    const createPreset = (overrides = {}) => ({
      ...basePreset,
      speed: basePreset.speed,
      saturation: basePreset.saturation * config.saturationMultiplier,
      intensity: basePreset.intensity * config.intensityMultiplier,
      maxOffset: basePreset.maxOffset * config.offsetMultiplier,
      ...overrides
    });
    
    const redPreset = useRGB 
      ? createPreset({ opacity: basePreset.opacity * config.rgbOpacity })
      : createPreset({ opacity: 0 });
    
    const bluePreset = useRGB
      ? createPreset({ redHue: basePreset.blueHue - 180, opacity: basePreset.opacity * config.rgbOpacity })
      : createPreset({ redHue: basePreset.blueHue - 180, opacity: 0 });
    
    const mainPreset = createPreset();
    
    return {
      redMovementType,
      blueMovementType,
      mainMovementType,
      redPreset,
      bluePreset,
      mainPreset,
      useRGB,
      redDirection: direction,
      blueDirection: mainMovementType === movementTypes.DIAGONAL || mainMovementType === movementTypes.MIXED ? -direction : direction,
      mainDirection: direction
    };
  }

  // ============================================================================
  // CONFIGURACIÓN DE FIGURAS
  // ============================================================================

  const figureConfigs = new Map();

  function setupRGBLayers(figure, img, index) {
    const imgSrc = img.src || img.getAttribute('src');
    if (!imgSrc) return;

    const seed = utils.generateUniqueSeed(imgSrc, index);
    const getRandPreset = utils.createSeededRandom(seed);
    const getRandDirection = utils.createSeededRandom(seed + CONFIG.SEED_OFFSETS.DIRECTION);
    
    const preset = effectPresets[Math.floor(getRandPreset() * effectPresets.length)];
    const direction = getRandDirection() > 0.5 ? 1 : -1;
    const animationId = `glitch-${index}-${seed.toString(36)}`;
    const mainMovementType = getMovementType(seed, index); // Pasar el índice para distribución balanceada
    
    // Debug: verificar tipos asignados
    console.log(`[${index}] ${imgSrc.split('/').pop()} - Tipo: ${mainMovementType}, Seed: ${seed}`);
    
    const {
      redMovementType,
      blueMovementType,
      mainMovementType: mainMovementTypeFinal,
      redPreset,
      bluePreset,
      mainPreset,
      useRGB,
      redDirection,
      blueDirection,
      mainDirection
    } = createPresetsForMovementType(mainMovementType, preset, direction);

    // Generar keyframes
    const redKeyframes = generateKeyframes(redPreset, redDirection, seed, redMovementType);
    const blueKeyframes = generateKeyframes(bluePreset, blueDirection, seed + CONFIG.SEED_OFFSETS.BLUE_KEYFRAMES, blueMovementType);
    const mainKeyframes = generateKeyframes(mainPreset, mainDirection, seed + CONFIG.SEED_OFFSETS.MAIN_KEYFRAMES, mainMovementTypeFinal);
    
    // Debug adicional para verificar tipos verticales
    if (mainMovementTypeFinal === movementTypes.VERTICAL) {
      console.log(`  ✓ VERTICAL confirmado - Main: ${mainMovementTypeFinal}, Red: ${redMovementType}, Blue: ${blueMovementType}`);
    }

    // Inyectar animaciones
    injectKeyframes(`${animationId}-red`, redKeyframes, redMovementType);
    injectKeyframes(`${animationId}-blue`, blueKeyframes, blueMovementType);
    injectKeyframes(`${animationId}-main`, mainKeyframes, mainMovementTypeFinal);

    // Crear capas RGB
    const redLayer = createRGBLayer(imgSrc, 'glitch-red', redPreset, redPreset.redHue);
    const blueLayer = createRGBLayer(imgSrc, 'glitch-blue', bluePreset, bluePreset.blueHue);
    
    // Siempre agregar las capas al DOM para que los estilos funcionen correctamente
    figure.appendChild(redLayer);
    figure.appendChild(blueLayer);
    
    if (!useRGB) {
      redLayer.style.display = 'none';
      blueLayer.style.display = 'none';
    }

    // Guardar configuración para uso en parallax y móviles
    figureConfigs.set(figure, {
      redLayer,
      blueLayer,
      img,
      animationId,
      preset: mainPreset,
      movementType: mainMovementTypeFinal,
      useRGB
    });

    // Event listeners para desktop
    if (!isMobile) {
      figure.addEventListener('mouseenter', () => {
        // Resetear parallax antes de activar glitch
        img.style.transform = '';
        if (redLayer) redLayer.style.transform = '';
        if (blueLayer) blueLayer.style.transform = '';
        // Activar glitch
        activateGlitch(redLayer, blueLayer, img, animationId, mainPreset, mainMovementTypeFinal, useRGB);
      });

      figure.addEventListener('mouseleave', () => {
        deactivateGlitch(redLayer, blueLayer, img);
        // Asegurar que el transform se resetee
        img.style.transform = '';
        if (redLayer) redLayer.style.transform = '';
        if (blueLayer) blueLayer.style.transform = '';
      });
    }
  }

  // ============================================================================
  // EFECTO PARALLAX (SEGUIMIENTO DEL MOUSE)
  // ============================================================================

  function setupParallax() {
    if (isMobile) return;

    // Esperar a que todas las figuras estén configuradas antes de crear el Map
    setTimeout(() => {
      const figureGlitchConfigs = new Map();
      document.querySelectorAll('.collage figure').forEach(figure => {
        const config = figureConfigs.get(figure);
        if (config) {
          figureGlitchConfigs.set(figure, config);
        }
      });

      function calculateMouseOffset(e, figure) {
        const rect = figure.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const dirX = (x - centerX) / centerX;
        const dirY = (y - centerY) / centerY;
        const distance = Math.sqrt(dirX * dirX + dirY * dirY);
        const intensity = Math.min(distance * CONFIG.PARALLAX.MAX_INTENSITY, CONFIG.PARALLAX.MAX_INTENSITY);
        
        return {
          x: dirX * CONFIG.PARALLAX.MAX_OFFSET * intensity,
          y: dirY * CONFIG.PARALLAX.MAX_OFFSET * intensity
        };
      }

      function applyParallaxTransform(figure, offset) {
        const img = figure.querySelector('img');
        const config = figureGlitchConfigs.get(figure);
        
        // Solo aplicar parallax si NO hay animación activa (el glitch tiene prioridad)
        const hasGlitchAnimation = img && img.style.animation && img.style.animation !== 'none';
        if (hasGlitchAnimation) return; // No aplicar parallax si hay glitch activo
        
        if (img) {
          img.style.transform = `translate(${offset.x.toFixed(2)}px, ${offset.y.toFixed(2)}px) scale(${CONFIG.PARALLAX.SCALE})`;
        }
        
        if (config) {
          const { redLayer, blueLayer } = config;
          
          if (redLayer && redLayer.style.display !== 'none' && (!redLayer.style.animation || redLayer.style.animation === 'none')) {
            redLayer.style.transform = `translate(${(offset.x * -CONFIG.PARALLAX.RGB_SEPARATION).toFixed(2)}px, ${offset.y.toFixed(2)}px)`;
          }
          
          if (blueLayer && blueLayer.style.display !== 'none' && (!blueLayer.style.animation || blueLayer.style.animation === 'none')) {
            blueLayer.style.transform = `translate(${offset.x.toFixed(2)}px, ${(offset.y * -CONFIG.PARALLAX.RGB_SEPARATION).toFixed(2)}px)`;
          }
        }
      }

      function resetTransforms(figure) {
        const img = figure.querySelector('img');
        const config = figureGlitchConfigs.get(figure);
        
        // Solo resetear si no hay animación activa
        if (img && (!img.style.animation || img.style.animation === 'none')) {
          img.style.transform = '';
        }
        if (config) {
          if (config.redLayer && (!config.redLayer.style.animation || config.redLayer.style.animation === 'none')) {
            config.redLayer.style.transform = '';
          }
          if (config.blueLayer && (!config.blueLayer.style.animation || config.blueLayer.style.animation === 'none')) {
            config.blueLayer.style.transform = '';
          }
        }
      }

      document.addEventListener('mousemove', (e) => {
        document.querySelectorAll('.collage figure:hover').forEach(figure => {
          const offset = calculateMouseOffset(e, figure);
          applyParallaxTransform(figure, offset);
        });
      });

      document.querySelectorAll('.collage figure').forEach(figure => {
        figure.addEventListener('mouseleave', () => resetTransforms(figure));
      });
    }, 100);
  }

  // ============================================================================
  // GLITCH EN MÓVILES (SCROLL/TOUCH)
  // ============================================================================

  function setupMobileGlitch() {
    if (!isMobile) return;

    let scrollTimeout;
    const activeFigures = new Set();

    function handleScroll() {
      figureConfigs.forEach((config, figure) => {
        const rect = figure.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible && !activeFigures.has(figure)) {
          activeFigures.add(figure);
          const movementType = config.movementType || movementTypes.HORIZONTAL;
          const useRGB = config.useRGB !== undefined ? config.useRGB : true;
          activateGlitch(config.redLayer, config.blueLayer, config.img, config.animationId, config.preset, movementType, useRGB);
        }
      });
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        activeFigures.forEach(figure => {
          const config = figureConfigs.get(figure);
          if (config) {
            deactivateGlitch(config.redLayer, config.blueLayer, config.img);
          }
        });
        activeFigures.clear();
      }, CONFIG.MOBILE_SCROLL_TIMEOUT);
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    let touchStartY = 0;
    let isTouching = false;
    
    document.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
      isTouching = true;
      handleScroll();
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!isTouching) return;
      const touchY = e.touches[0].clientY;
      const deltaY = Math.abs(touchY - touchStartY);
      if (deltaY > CONFIG.MOBILE_TOUCH_THRESHOLD) {
        handleScroll();
      }
    }, { passive: true });

    document.addEventListener('touchend', () => {
      isTouching = false;
    }, { passive: true });
  }

  // ============================================================================
  // INICIALIZACIÓN
  // ============================================================================

  function init() {
    const figures = document.querySelectorAll('.collage figure');
    if (figures.length === 0) return;

    figures.forEach((figure, index) => {
      const img = figure.querySelector('img');
      if (!img) return;

      setupRGBLayers(figure, img, index);

      img.addEventListener('load', () => {
        img.style.opacity = '0';
        setTimeout(() => {
          img.style.transition = 'opacity 0.6s ease';
          img.style.opacity = '1';
        }, index * 100);
      });
    });

    setupParallax();
    
    if (isMobile) {
      setupMobileGlitch();
    }
  }

  utils.ready(init);
})();
