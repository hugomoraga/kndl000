// Efectos dinámicos para imágenes del collage
(function() {
  'use strict';

  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const figures = document.querySelectorAll('.collage figure');
    
    if (figures.length === 0) return;

    // Función para crear capas RGB reales con aleatoriedad
    function setupRealRGBLayers(figure, img, index) {
      const imgSrc = img.src || img.getAttribute('src');
      if (!imgSrc) return;

      // Generar valores COMPLETAMENTE únicos para cada imagen
      // Usar hash de la URL completa + índice + posición + timestamp único
      const imgHash = imgSrc.split('').reduce((acc, char, i) => acc + (char.charCodeAt(0) * (i + 1)), 0);
      const position = figure.getBoundingClientRect();
      const uniqueSeed = Math.abs(
        (index * 7919) + // Número primo grande
        (Math.floor(position.top) * 3571) + 
        (Math.floor(position.left) * 2017) + 
        (imgHash * 997) +
        (Date.now() % 1000000) * index
      );
      const randomId = `glitch-${index}-${uniqueSeed.toString(36)}`;
      
      // Función helper para generar números pseudoaleatorios del seed
      function seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      }
      
      // Generar TODOS los valores usando el seed único
      let currentSeed = uniqueSeed;
      const getRand = () => {
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        return currentSeed / 233280;
      };
      
      // Tipo de efecto - distribuir mejor
      const effectType = getRand();
      let speed, intensity, hueShift, maxOffset, opacity, direction, saturation, redHue, blueHue;
      
      // Valores COMPLETAMENTE diferentes para cada imagen
      if (effectType < 0.33) {
        // Efecto sutil
        speed = 0.9 + getRand() * 0.5; // 0.9-1.4s
        intensity = 1.4 + getRand() * 0.6; // 1.4-2.0
        maxOffset = 1.5 + getRand() * 3.5; // 1.5-5px
        opacity = 0.35 + getRand() * 0.3; // 0.35-0.65
        saturation = 2.5 + getRand() * 3; // 2.5-5.5
        redHue = (getRand() * 60) - 30; // -30 a 30
        blueHue = 140 + (getRand() * 50) - 25; // 115-165
      } else if (effectType < 0.66) {
        // Efecto medio
        speed = 0.4 + getRand() * 0.5; // 0.4-0.9s
        intensity = 2.2 + getRand() * 1.2; // 2.2-3.4
        maxOffset = 4 + getRand() * 6; // 4-10px
        opacity = 0.7 + getRand() * 0.2; // 0.7-0.9
        saturation = 4.5 + getRand() * 4; // 4.5-8.5
        redHue = (getRand() * 120) - 60; // -60 a 60
        blueHue = 110 + (getRand() * 80) - 40; // 70-150
      } else {
        // Efecto intenso
        speed = 0.25 + getRand() * 0.35; // 0.25-0.6s
        intensity = 3.0 + getRand() * 1.5; // 3.0-4.5
        maxOffset = 7 + getRand() * 8; // 7-15px
        opacity = 0.85 + getRand() * 0.1; // 0.85-0.95
        saturation = 6 + getRand() * 6; // 6-12
        redHue = (getRand() * 180) - 90; // -90 a 90
        blueHue = 80 + (getRand() * 120) - 60; // 20-140
      }
      
      hueShift = redHue;
      direction = getRand() > 0.5 ? 1 : -1;
      
      // Tipo de movimiento y clip-path - más variado
      const movementType = getRand();
      let horizontalBias, verticalBias, clipPathType;
      
      if (movementType < 0.25) {
        // Horizontal dominante
        horizontalBias = 2.5;
        verticalBias = 0.4;
        clipPathType = 'horizontal';
      } else if (movementType < 0.5) {
        // Vertical dominante
        horizontalBias = 0.4;
        verticalBias = 2.5;
        clipPathType = 'vertical';
      } else if (movementType < 0.75) {
        // Diagonal
        horizontalBias = 1.2;
        verticalBias = 1.2;
        clipPathType = 'diagonal';
      } else {
        // Balanceado
        horizontalBias = 1.0;
        verticalBias = 1.0;
        clipPathType = 'mixed';
      }

      // Crear animaciones CSS dinámicas únicas
      const redAnimationName = `glitch-red-${randomId}`;
      const blueAnimationName = `glitch-blue-${randomId}`;
      const mainAnimationName = `glitch-main-${randomId}`;

      // Generar keyframes aleatorios con variaciones específicas
      const redKeyframes = generateRandomGlitchKeyframes(
        maxOffset, 
        direction, 
        intensity, 
        saturation, 
        redHue,
        horizontalBias,
        verticalBias,
        clipPathType,
        uniqueSeed
      );
      const blueKeyframes = generateRandomGlitchKeyframes(
        maxOffset, 
        -direction, 
        intensity, 
        saturation, 
        blueHue - 180,
        horizontalBias,
        verticalBias,
        clipPathType,
        uniqueSeed + 10000
      );
      const mainKeyframes = generateMainGlitchKeyframes(
        maxOffset * 0.5, 
        direction,
        horizontalBias,
        verticalBias,
        uniqueSeed + 20000
      );

      // Inyectar animaciones en el documento
      injectKeyframes(redAnimationName, redKeyframes);
      injectKeyframes(blueAnimationName, blueKeyframes);
      injectKeyframes(mainAnimationName, mainKeyframes);

      // Crear capa roja con valores aleatorios únicos
      const redLayer = document.createElement('div');
      redLayer.className = 'glitch-rgb-layer glitch-red';
      redLayer.style.cssText = `
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
        filter: brightness(${intensity.toFixed(2)}) contrast(${intensity.toFixed(2)}) saturate(${saturation.toFixed(2)}) hue-rotate(${redHue.toFixed(1)}deg);
        transition: opacity 0.3s;
      `;
      figure.appendChild(redLayer);

      // Crear capa azul/cyan con valores aleatorios únicos
      const blueLayer = document.createElement('div');
      blueLayer.className = 'glitch-rgb-layer glitch-blue';
      blueLayer.style.cssText = `
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
        filter: brightness(${intensity.toFixed(2)}) contrast(${intensity.toFixed(2)}) saturate(${saturation.toFixed(2)}) hue-rotate(${blueHue.toFixed(1)}deg);
        transition: opacity 0.3s;
      `;
      figure.appendChild(blueLayer);

      // Activar capas en hover con animaciones únicas
      // Agregar delay aleatorio para que no todas empiecen igual
      const delay = Math.random() * 0.3;
      
      figure.addEventListener('mouseenter', () => {
        redLayer.style.opacity = opacity;
        blueLayer.style.opacity = opacity;
        redLayer.style.animation = `${redAnimationName} ${speed}s infinite`;
        redLayer.style.animationDelay = `${delay}s`;
        blueLayer.style.animation = `${blueAnimationName} ${speed}s infinite`;
        blueLayer.style.animationDelay = `${delay + Math.random() * 0.2}s`;
        img.style.animation = `${mainAnimationName} ${speed}s infinite`;
        img.style.animationDelay = `${delay * 0.5}s`;
      });

      figure.addEventListener('mouseleave', () => {
        redLayer.style.opacity = '0';
        blueLayer.style.opacity = '0';
        redLayer.style.animation = 'none';
        redLayer.style.animationDelay = '0s';
        blueLayer.style.animation = 'none';
        blueLayer.style.animationDelay = '0s';
        img.style.animation = 'none';
        img.style.animationDelay = '0s';
      });
    }

    // Función para generar keyframes aleatorios con sesgos de movimiento
    function generateRandomGlitchKeyframes(maxOffset, direction, intensity, saturation, hueShift, horizontalBias, verticalBias, clipPathType, baseSeed) {
      // Usar el seed base pasado como parámetro
      let stepSeed = baseSeed;
      
      // Función para generar números aleatorios del seed
      const getRand = () => {
        stepSeed = (stepSeed * 9301 + 49297) % 233280;
        return stepSeed / 233280;
      };
      
      // Número variable de pasos
      const numSteps = 7 + Math.floor(getRand() * 5); // 7-11 pasos
      const steps = [];
      for (let i = 0; i <= numSteps; i++) {
        steps.push(Math.round((i / numSteps) * 100));
      }
      
      const keyframes = [];
      let previousOffsetX = 0;
      let previousOffsetY = 0;

      // Función para generar clip-path según el tipo
      const generateClipPath = (rand1, rand2, rand3) => {
        switch(clipPathType) {
          case 'horizontal':
            // Líneas horizontales
            const hTop = rand1 * 35;
            const hBottom = 100 - hTop - (rand2 * 30);
            return `inset(${hTop.toFixed(1)}% 0 ${hBottom.toFixed(1)}% 0)`;
          case 'vertical':
            // Líneas verticales
            const vLeft = rand1 * 35;
            const vRight = 100 - vLeft - (rand2 * 30);
            return `inset(0 ${vLeft.toFixed(1)}% 0 ${vRight.toFixed(1)}%)`;
          case 'diagonal':
            // Líneas diagonales
            const dTop = rand1 * 25;
            const dRight = rand2 * 25;
            return `inset(${dTop.toFixed(1)}% ${dRight.toFixed(1)}% ${(100-dTop-rand3*15).toFixed(1)}% ${(100-dRight-rand3*15).toFixed(1)}%)`;
          default: // mixed
            // Mezcla de horizontal y vertical
            if (rand3 > 0.5) {
              const mTop = rand1 * 30;
              const mBottom = 100 - mTop - (rand2 * 25);
              return `inset(${mTop.toFixed(1)}% 0 ${mBottom.toFixed(1)}% 0)`;
            } else {
              const mLeft = rand1 * 30;
              const mRight = 100 - mLeft - (rand2 * 25);
              return `inset(0 ${mLeft.toFixed(1)}% 0 ${mRight.toFixed(1)}%)`;
            }
        }
      };

      steps.forEach((step, index) => {
        if (step === 0 || step === 100) {
          keyframes.push({
            step: step,
            transform: 'translate(0)',
            clipPath: 'inset(0 0 0 0)',
            filter: `brightness(${intensity.toFixed(2)}) contrast(${intensity.toFixed(2)}) saturate(${saturation.toFixed(2)}) hue-rotate(${hueShift.toFixed(1)}deg)`
          });
        } else {
          const rand1 = getRand();
          const rand2 = getRand();
          const rand3 = getRand();
          
          // Movimiento con sesgos direccionales
          const offsetX = previousOffsetX + (rand1 * maxOffset * 2 - maxOffset) * direction * horizontalBias;
          const offsetY = previousOffsetY + (rand2 * maxOffset * 2 - maxOffset) * direction * verticalBias;
          previousOffsetX = offsetX;
          previousOffsetY = offsetY;
          
          // Clip path según el tipo
          const clipPath = generateClipPath(rand1, rand2, rand3);
          
          // Variaciones en filtros
          const brightnessVar = intensity + (rand2 * 1.5 - 0.75);
          const contrastVar = intensity + (rand3 * 1.5 - 0.75);
          const satVar = saturation + (rand1 * 3 - 1.5);
          const hueVar = hueShift + (rand2 * 30 - 15);

          keyframes.push({
            step: step,
            transform: `translate(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px)`,
            clipPath: clipPath,
            filter: `brightness(${brightnessVar.toFixed(2)}) contrast(${contrastVar.toFixed(2)}) saturate(${satVar.toFixed(2)}) hue-rotate(${hueVar.toFixed(1)}deg)`
          });
        }
      });

      return keyframes;
    }

    // Función para generar keyframes de la imagen principal con sesgos
    function generateMainGlitchKeyframes(maxOffset, direction, horizontalBias, verticalBias, baseSeed) {
      let stepSeed = baseSeed;
      
      // Función para generar números aleatorios
      const getRand = () => {
        stepSeed = (stepSeed * 9301 + 49297) % 233280;
        return stepSeed / 233280;
      };
      
      // Número variable de pasos
      const numSteps = 5 + Math.floor(getRand() * 4); // 5-8 pasos
      const steps = [];
      for (let i = 0; i <= numSteps; i++) {
        steps.push(Math.round((i / numSteps) * 100));
      }
      
      const keyframes = [];
      let previousOffsetX = 0;
      let previousOffsetY = 0;

      steps.forEach((step) => {
        if (step === 0 || step === 100) {
          keyframes.push({
            step: step,
            transform: 'translate(0)',
            clipPath: 'inset(0 0 0 0)',
            filter: 'contrast(1.08) brightness(1.03)'
          });
        } else {
          const rand1 = getRand();
          const rand2 = getRand();
          const rand3 = getRand();
          
          // Movimiento con sesgos
          const offsetX = previousOffsetX + (rand1 * maxOffset * 2 - maxOffset) * direction * horizontalBias;
          const offsetY = previousOffsetY + (rand2 * maxOffset * 2 - maxOffset) * direction * verticalBias;
          previousOffsetX = offsetX;
          previousOffsetY = offsetY;
          
          // Clip paths variados (horizontal y vertical)
          let clipPath;
          if (rand3 > 0.5) {
            const clipTop = rand1 * 12;
            const clipBottom = 100 - clipTop - (rand2 * 12);
            clipPath = `inset(${clipTop.toFixed(1)}% 0 ${clipBottom.toFixed(1)}% 0)`;
          } else {
            const clipLeft = rand1 * 12;
            const clipRight = 100 - clipLeft - (rand2 * 12);
            clipPath = `inset(0 ${clipLeft.toFixed(1)}% 0 ${clipRight.toFixed(1)}%)`;
          }
          
          const contrast = 1.05 + rand2 * 0.15;
          const brightness = 1.02 + rand3 * 0.1;

          keyframes.push({
            step: step,
            transform: `translate(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px)`,
            clipPath: clipPath,
            filter: `contrast(${contrast.toFixed(2)}) brightness(${brightness.toFixed(2)})`
          });
        }
      });

      return keyframes;
    }

    // Función para inyectar keyframes en el documento
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

    // Agregar efectos aleatorios a cada imagen
    figures.forEach((figure, index) => {
      const img = figure.querySelector('img');
      if (!img) return;

      // Configurar las capas RGB reales para mejor control
      // Pasar el índice para asegurar unicidad
      setupRealRGBLayers(figure, img, index);

      // Efecto glitch aleatorio periódico
      setInterval(() => {
        if (Math.random() > 0.7) {
          triggerRandomGlitch(figure);
        }
      }, 3000 + Math.random() * 2000);

      // Efecto de derretido al hover
      figure.addEventListener('mouseenter', () => {
        applyMeltEffect(figure);
      });

      figure.addEventListener('mouseleave', () => {
        removeMeltEffect(figure);
      });

      // Efecto de transición suave al cargar
      img.addEventListener('load', () => {
        img.style.opacity = '0';
        setTimeout(() => {
          img.style.transition = 'opacity 0.6s ease';
          img.style.opacity = '1';
        }, index * 100);
      });

      // Efecto de distorsión RGB aleatoria
      figure.addEventListener('mouseenter', () => {
        applyRGBShift(figure);
      });

      figure.addEventListener('mouseleave', () => {
        removeRGBShift(figure);
      });
    });
  }

  function triggerRandomGlitch(figure) {
    const img = figure.querySelector('img');
    if (!img) return;

    figure.classList.add('glitch-active');
    
    // Crear capas RGB para efecto glitch
    const glitchLayers = createGlitchLayers(img);
    figure.appendChild(glitchLayers);

    setTimeout(() => {
      figure.classList.remove('glitch-active');
      if (glitchLayers.parentNode) {
        glitchLayers.remove();
      }
    }, 200);
  }

  function createGlitchLayers(img) {
    const container = document.createElement('div');
    container.className = 'glitch-layers';
    container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2;
      overflow: hidden;
    `;

    // Capa roja
    const redLayer = document.createElement('div');
    redLayer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url(${img.src});
      background-size: cover;
      background-position: center;
      mix-blend-mode: screen;
      opacity: 0.8;
      filter: hue-rotate(0deg) saturate(2);
      transform: translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px);
      clip-path: inset(${Math.random() * 20}% 0 ${100 - Math.random() * 20}% 0);
    `;
    container.appendChild(redLayer);

    // Capa azul
    const blueLayer = document.createElement('div');
    blueLayer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url(${img.src});
      background-size: cover;
      background-position: center;
      mix-blend-mode: screen;
      opacity: 0.8;
      filter: hue-rotate(240deg) saturate(2);
      transform: translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px);
      clip-path: inset(${Math.random() * 20}% 0 ${100 - Math.random() * 20}% 0);
    `;
    container.appendChild(blueLayer);

    return container;
  }

  function applyMeltEffect(figure) {
    const img = figure.querySelector('img');
    if (!img) return;

    // Agregar efecto de derretido con clip-path
    const meltOverlay = document.createElement('div');
    meltOverlay.className = 'melt-overlay';
    meltOverlay.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 20%;
      background: linear-gradient(to top, 
        rgba(0, 0, 0, 0.4) 0%,
        rgba(0, 0, 0, 0.2) 50%,
        transparent 100%);
      clip-path: polygon(
        0% 100%,
        5% 95%,
        10% 98%,
        15% 92%,
        20% 96%,
        25% 90%,
        30% 94%,
        35% 88%,
        40% 92%,
        45% 86%,
        50% 90%,
        55% 84%,
        60% 88%,
        65% 82%,
        70% 86%,
        75% 80%,
        80% 84%,
        85% 78%,
        90% 82%,
        95% 76%,
        100% 80%,
        100% 100%
      );
      transition: clip-path 0.6s ease;
      z-index: 1;
      pointer-events: none;
    `;
    figure.appendChild(meltOverlay);

    // Animar el derretido
    setTimeout(() => {
      meltOverlay.style.clipPath = `
        polygon(
          0% 100%,
          3% 85%,
          7% 90%,
          12% 80%,
          18% 85%,
          23% 75%,
          28% 80%,
          33% 70%,
          38% 75%,
          43% 65%,
          48% 70%,
          53% 60%,
          58% 65%,
          63% 55%,
          68% 60%,
          73% 50%,
          78% 55%,
          83% 45%,
          88% 50%,
          93% 40%,
          98% 45%,
          100% 35%,
          100% 100%
        )
      `;
    }, 50);
  }

  function removeMeltEffect(figure) {
    const meltOverlay = figure.querySelector('.melt-overlay');
    if (meltOverlay) {
      meltOverlay.style.transition = 'opacity 0.3s ease';
      meltOverlay.style.opacity = '0';
      setTimeout(() => {
        if (meltOverlay.parentNode) {
          meltOverlay.remove();
        }
      }, 300);
    }
  }

  function applyRGBShift(figure) {
    const img = figure.querySelector('img');
    if (!img) return;

    figure.style.setProperty('--rgb-shift', '2px');
    img.style.filter = 'contrast(1.1) brightness(1.05)';
  }

  function removeRGBShift(figure) {
    const img = figure.querySelector('img');
    if (!img) return;

    figure.style.setProperty('--rgb-shift', '0px');
    img.style.filter = '';
  }

  // Efecto de parallax sutil al mover el mouse
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

  // Resetear transformaciones cuando el mouse sale
  document.querySelectorAll('.collage figure').forEach(figure => {
    figure.addEventListener('mouseleave', () => {
      const img = figure.querySelector('img');
      if (img) {
        img.style.transform = '';
      }
    });
  });
})();

