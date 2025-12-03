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

    // Event listeners
    const delay = getRand() * 0.3;
    figure.addEventListener('mouseenter', () => {
      redLayer.style.opacity = preset.opacity;
      blueLayer.style.opacity = preset.opacity;
      redLayer.style.animation = `${animationId}-red ${preset.speed}s infinite`;
      blueLayer.style.animation = `${animationId}-blue ${preset.speed}s infinite`;
      img.style.animation = `${animationId}-main ${preset.speed}s infinite`;
    });

    figure.addEventListener('mouseleave', () => {
      redLayer.style.opacity = '0';
      blueLayer.style.opacity = '0';
      redLayer.style.animation = 'none';
      blueLayer.style.animation = 'none';
      img.style.animation = 'none';
    });
  }

  // Efecto de parallax sutil
  function setupParallax() {
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
  }

  utils.ready(init);
})();
