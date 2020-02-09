var canvas = document.getElementById('visual');
var ctx = canvas.getContext('2d');
var numOfDots = 60;
var frameStep = 0.25;

checkBorders();
let dots = [];

for (var i = 0; i < numOfDots; i++) {
  var dot = {
    x: Math.floor(Math.random() * canvas.width),
    y: Math.floor(Math.random() * canvas.height),
    radius: 2.5,
    xMove: (Math.random() > 0.5 ? "+" : "-"),
    yMove: (Math.random() > 0.5 ? "+" : "-")
  };

  dots.push(dot);
  drawDot(dot.x, dot.y, dot.radius);
}

animate();

function animate() {
  checkBorders();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawLines();

  for (var i = 0; i < numOfDots; i++) {

    if(dots[i].xMove === "+") {
      dots[i].x += frameStep;
    } else {
      dots[i].x -= frameStep;
    }

    if(dots[i].yMove === "+") {
      dots[i].y += frameStep;
    } else {
      dots[i].y -= frameStep;
    }

    drawDot(dots[i].x, dots[i].y, dots[i].radius);

    if((dots[i].x + dots[i].radius) >= canvas.width) {
      dots[i].xMove = "-";
    }

    if((dots[i].x - dots[i].radius) <= 0) {
      dots[i].xMove = "+";
    }

    if((dots[i].y + dots[i].radius) >= canvas.height) {
      dots[i].yMove = "-";
    }

    if((dots[i].y - dots[i].radius) <= 0) {
      dots[i].yMove = "+";
    }
  }

  window.requestAnimationFrame(animate);
}

function drawLines() {
  ctx.lineWidth = 0.25;

  for (var i = 0; i < numOfDots; i++) {
    for (var j = i + 1; j < numOfDots; j++) {

      var dot1 = dots[i];
      var dot2 = dots[j];
      var distance = Math.hypot(Math.abs(dot1.x - dot2.x),
        Math.abs(dot1.y - dot2.y));

      if (distance <= 200) {

        var saturation = 1 - distance / 200;
        saturation = Math.floor(saturation * 100) / 100;
        ctx.strokeStyle = `rgba(255, 255, 255, ${saturation})`;

        ctx.beginPath();
        ctx.moveTo(dot1.x, dot1.y);
        ctx.lineTo(dot2.x, dot2.y);
        ctx.stroke();
      }
    }
  }
}

function checkBorders() {
  var width = canvas.clientWidth;
  var height = canvas.clientHeight;

  if (width !== canvas.width) {
    canvas.width = width;
  }

  if (height !== canvas.height) {
    canvas.height = height;
  }
}

function drawDot(x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = "white";
  ctx.fill();
}
