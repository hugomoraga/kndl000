// Canvas animation para la página de inicio - efecto original de línea que vibra
const canvas = document.getElementById("art");

if (canvas) {
  const ctx = canvas.getContext("2d");
  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#999";
    ctx.beginPath();
    
    for (let x = 0; x < canvas.width; x += 10) {
      let y = canvas.height / 2 + Math.sin(x * 0.01 + t) * 20;
      ctx.lineTo(x, y);
    }
    
    ctx.stroke();
    t += 0.05;
    requestAnimationFrame(draw);
  }

  draw();
}

