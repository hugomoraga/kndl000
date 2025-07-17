function startTunnel({
  ellipseCount = 100,
  ellipseSpacing = 10,
  angleIncrement = 0.15,
  ellipseSizeFactor = 1,
  strokeColor = [255],
  backgroundColor = [0, 100],
} = {}) {
  let angle = 0;
  new p5((sketch) => {
    sketch.setup = function() {
      sketch.createCanvas(window.innerWidth, window.innerHeight);
      sketch.stroke(...strokeColor);
      sketch.noFill();
    };
    sketch.draw = function() {
      sketch.background(...backgroundColor);
      sketch.translate(sketch.width / 2, sketch.height / 2);
      for (let i = 0; i < ellipseCount; i++) {
        let r = i * ellipseSpacing;
        let a = angle + i * 0.1;
        let size = r * ellipseSizeFactor;
        sketch.ellipse(r * Math.cos(a), r * Math.sin(a), size, size);
      }
      angle += angleIncrement;
    };
  });
}

// Llamas directamente (¡sin exportar!)
startTunnel();