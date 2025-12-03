// Efectos dinámicos para imágenes del collage - Versión simplificada y mantenible
(function() {
  'use strict';

  // Utilidades
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
      const imgHash = imgSrc.split('').reduce((acc, char, i) => acc + (char.charCodeAt(0) * (i + 1)), 0);
      return Math.abs((index * 7919) + (imgHash * 997));
    }
  };

  // Configuraciones de efectos predefinidas (más simple que calcular todo dinámicamente)
  const effectPresets = [
    { speed: 1.0, intensity: 1.8, maxOffset: 3, opacity: 0.5, saturation: 3.5, redHue: 0, blueHue: 140 },
    { speed: 0.6, intensity: 2.5, maxOffset: 6, opacity: 0.75, saturation: 5.5, redHue: -30, blueHue: 120 },
    { speed: 0.4, intensity: 3.5, maxOffset: 10, opacity: 0.9, saturation: 8, redHue: -60, blueHue: 100 }
  ];

  // Generador de keyframes simplificado
  function generateKeyframes(preset, direction, seed) {
    const getRand = utils.createSeededRandom(seed);
    const steps = [0, 15, 30, 45, 60, 75, 90, 100];
    const keyframes = [];

    steps.forEach((step) => {
      if (step === 0 || step === 100) {
        keyframes.push({
          step,
          transform: 'translate(0)',
          clipPath: 'inset(0 0 0 0)',
          filter: `brightness(${preset.intensity}) contrast(${preset.intensity}) saturate(${preset.saturation}) hue-rotate(${preset.redHue}deg)`
        });
      } else {
        const offsetX = (getRand() * preset.maxOffset * 2 - preset.maxOffset) * direction;
        const offsetY = (getRand() * preset.maxOffset * 2 - preset.maxOffset) * direction;
        const clipTop = getRand() * 15;
        const clipBottom = 100 - clipTop - (getRand() * 15);
        
        keyframes.push({
          step,
          transform: `translate(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px)`,
          clipPath: `inset(${clipTop.toFixed(1)}% 0 ${clipBottom.toFixed(1)}% 0)`,
          filter: `brightness(${preset.intensity}) contrast(${preset.intensity}) saturate(${preset.saturation}) hue-rotate(${preset.redHue}deg)`
        });
      }
    });

    return keyframes;
  }

  // Inyectar keyframes CSS
  function injectKeyframes(name, keyframes) {
    let styleSheet = document.getElementById('dynamic-glitch-styles');
    if (!styleSheet) {
      styleSheet = document.createElement('style');
      styleSheet.id = 'dynamic-glitch-styles';
      document.head.appendChild(styleSheet);
    }

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

  // Crear capa RGB
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
      filter: brightness(${preset.intensity}) contrast(${preset.intensity}) saturate(${preset.saturation}) hue-rotate(${hueShift}deg);
      transition: opacity 0.3s;
    `;
    return layer;
  }

  // Detectar si es dispositivo móvil/touch
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  // Funciones para activar/desactivar glitch
  function activateGlitch(redLayer, blueLayer, img, animationId, preset) {
    redLayer.style.opacity = preset.opacity;
    blueLayer.style.opacity = preset.opacity;
    redLayer.style.animation = `${animationId}-red ${preset.speed}s infinite`;
    blueLayer.style.animation = `${animationId}-blue ${preset.speed}s infinite`;
    img.style.animation = `${animationId}-main ${preset.speed}s infinite`;
  }

  function deactivateGlitch(redLayer, blueLayer, img) {
    redLayer.style.opacity = '0';
    blueLayer.style.opacity = '0';
    redLayer.style.animation = 'none';
    blueLayer.style.animation = 'none';
    img.style.animation = 'none';
  }

  // Almacenar configuraciones de figuras para uso en móviles
  const figureConfigs = new Map();

  // Configurar efectos RGB para una figura
  function setupRGBLayers(figure, img, index) {
    const imgSrc = img.src || img.getAttribute('src');
    if (!imgSrc) return;

    const seed = utils.generateUniqueSeed(imgSrc, index);
    const getRand = utils.createSeededRandom(seed);
    const preset = effectPresets[Math.floor(getRand() * effectPresets.length)];
    const direction = getRand() > 0.5 ? 1 : -1;
    const animationId = `glitch-${index}-${seed.toString(36)}`;

    // Generar keyframes
    const redKeyframes = generateKeyframes(preset, direction, seed);
    const blueKeyframes = generateKeyframes(
      { ...preset, redHue: preset.blueHue - 180 },
      -direction,
      seed + 10000
    );
    const mainKeyframes = generateKeyframes(
      { ...preset, maxOffset: preset.maxOffset * 0.5 },
      direction,
      seed + 20000
    );

    // Inyectar animaciones
    injectKeyframes(`${animationId}-red`, redKeyframes);
    injectKeyframes(`${animationId}-blue`, blueKeyframes);
    injectKeyframes(`${animationId}-main`, mainKeyframes);

    // Crear capas
    const redLayer = createRGBLayer(imgSrc, 'glitch-red', preset, preset.redHue);
    const blueLayer = createRGBLayer(imgSrc, 'glitch-blue', preset, preset.blueHue);
    
    figure.appendChild(redLayer);
    figure.appendChild(blueLayer);

    // Guardar configuración para uso en móviles
    if (isMobile) {
      figureConfigs.set(figure, {
        redLayer,
        blueLayer,
        img,
        animationId,
        preset
      });
    }

    // Event listeners para desktop (hover)
    if (!isMobile) {
      figure.addEventListener('mouseenter', () => {
        activateGlitch(redLayer, blueLayer, img, animationId, preset);
      });

      figure.addEventListener('mouseleave', () => {
        deactivateGlitch(redLayer, blueLayer, img);
      });
    }
  }

  // Efecto de parallax sutil (solo desktop)
  function setupParallax() {
    if (isMobile) return;

    document.addEventListener('mousemove', (e) => {
      const figures = document.querySelectorAll('.collage figure:hover');
      figures.forEach(figure => {
        const rect = figure.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const moveX = (x - centerX) / 20;
        const moveY = (y - centerY) / 20;

        const img = figure.querySelector('img');
        if (img) {
          img.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.02)`;
        }
      });
    });

    document.querySelectorAll('.collage figure').forEach(figure => {
      figure.addEventListener('mouseleave', () => {
        const img = figure.querySelector('img');
        if (img) {
          img.style.transform = '';
        }
      });
    });
  }

  // Activar glitch en móviles durante scroll/touch
  function setupMobileGlitch() {
    if (!isMobile) return;

    let scrollTimeout;
    let isScrolling = false;
    const activeFigures = new Set();

    function handleScroll() {
      isScrolling = true;
      
      // Activar glitch en figuras visibles durante scroll
      figureConfigs.forEach((config, figure) => {
        const rect = figure.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible && !activeFigures.has(figure)) {
          activeFigures.add(figure);
          activateGlitch(config.redLayer, config.blueLayer, config.img, config.animationId, config.preset);
        }
      });
      
      // Desactivar después de un tiempo sin scroll
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        activeFigures.forEach(figure => {
          const config = figureConfigs.get(figure);
          if (config) {
            deactivateGlitch(config.redLayer, config.blueLayer, config.img);
          }
        });
        activeFigures.clear();
        isScrolling = false;
      }, 300);
    }

    // Detectar scroll
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

    // También activar en touchstart/touchmove
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
      
      if (deltaY > 5) { // Solo si hay movimiento significativo
        handleScroll();
      }
    }, { passive: true });

    document.addEventListener('touchend', () => {
      isTouching = false;
    }, { passive: true });
  }

  // Inicialización
  function init() {
    const figures = document.querySelectorAll('.collage figure');
    if (figures.length === 0) return;

    figures.forEach((figure, index) => {
      const img = figure.querySelector('img');
      if (!img) return;

      setupRGBLayers(figure, img, index);

      // Fade in al cargar
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
