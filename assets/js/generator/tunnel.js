function startTunnel() {
  let angle = 0;
  new p5((sketch) => {
    sketch.setup = function() {
      sketch.createCanvas(window.innerWidth, window.innerHeight);
      sketch.stroke(255);
      sketch.noFill();
    };

    sketch.draw = function() {
      let ellipseCount = parseInt(document.getElementById('ellipseCount').value);
      let ellipseSpacing = parseFloat(document.getElementById('ellipseSpacing').value);
      let angleIncrement = parseFloat(document.getElementById('angleIncrement').value);
      let ellipseSizeFactor = parseFloat(document.getElementById('ellipseSizeFactor').value);

      sketch.background(0, 20);
      sketch.translate(sketch.width / 2, sketch.height / 2);
      for (let i = 0; i < ellipseCount; i++) {
        let r = i * ellipseSpacing;
        let a = angle + i * 0.1;
        let size = r * ellipseSizeFactor;
        sketch.ellipse(r * Math.cos(a), r * Math.sin(a), size, size);
      }
      angle += angleIncrement;
    };

    sketch.windowResized = function() {
      sketch.resizeCanvas(window.innerWidth, window.innerHeight);
    };
  });
}

startTunnel();

