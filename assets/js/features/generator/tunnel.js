// Función helper para obtener valores de inputs de forma segura
function getInputValue(id, defaultValue, parser = parseFloat) {
  const element = document.getElementById(id);
  if (!element) return defaultValue;
  const value = parser(element.value);
  return isNaN(value) ? defaultValue : value;
}

function startTunnel() {
  if (typeof p5 === 'undefined') {
    console.error('p5.js no está cargado');
    return;
  }

  let angle = 0;
  new p5((sketch) => {
    sketch.setup = function() {
      const canvas = sketch.createCanvas(window.innerWidth, window.innerHeight);
      canvas.elt.style.width = '100%';
      canvas.elt.style.height = '100%';
      canvas.elt.style.maxWidth = '100%';
      sketch.stroke(255);
      sketch.noFill();
    };

    sketch.draw = function() {
      const ellipseCount = getInputValue('ellipseCount', 100, parseInt);
      const ellipseSpacing = getInputValue('ellipseSpacing', 10);
      const angleIncrement = getInputValue('angleIncrement', 0.05);
      const ellipseSizeFactor = getInputValue('ellipseSizeFactor', 1);

      sketch.background(0, 20);
      sketch.translate(sketch.width / 2, sketch.height / 2);
      
      for (let i = 0; i < ellipseCount; i++) {
        const r = i * ellipseSpacing;
        const a = angle + i * 0.1;
        const size = r * ellipseSizeFactor;
        sketch.ellipse(r * Math.cos(a), r * Math.sin(a), size, size);
      }
      angle += angleIncrement;
    };

    sketch.windowResized = function() {
      sketch.resizeCanvas(window.innerWidth, window.innerHeight);
      const canvas = sketch.canvas;
      if (canvas) {
        canvas.elt.style.width = '100%';
        canvas.elt.style.height = '100%';
        canvas.elt.style.maxWidth = '100%';
      }
    };
  });
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startTunnel);
} else {
  startTunnel();
}

