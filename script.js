const canvas = document.getElementById("garden");
const ctx = canvas.getContext("2d");

const gridSize = 50;
const cellSize = 20;

let goobs = [];
let startTime = performance.now();
let lastFrameTime = performance.now();
let gameTime = 0;
const gameTimeFactor = 0.001; // 1 second real = 1 game second

class Goob {
  constructor(x, y) {
    this.gridX = x;
    this.gridY = y;
  }

  update(deltaTime) {
    if (Math.random() < 0.01) {
      const dir = Math.floor(Math.random() * 4);
      let dx = 0, dy = 0;
      if (dir === 0) dx = 1;
      else if (dir === 1) dx = -1;
      else if (dir === 2) dy = 1;
      else dy = -1;

      const newX = this.gridX + dx;
      const newY = this.gridY + dy;

      // Stay within bounds and 2x2 area
      if (newX >= 0 && newX <= gridSize - 2 && newY >= 0 && newY <= gridSize - 2) {
        this.gridX = newX;
        this.gridY = newY;
      }
    }
  }

  draw() {
    ctx.fillStyle = "purple";
    ctx.fillRect(this.gridX * cellSize, this.gridY * cellSize, cellSize * 2, cellSize * 2);
  }
}

// Load/save
function saveGameState() {
  const goobData = goobs.map(g => ({ x: g.gridX, y: g.gridY }));
  localStorage.setItem("goobs", JSON.stringify(goobData));
}

function loadGameState() {
  const data = localStorage.getItem("goobs");
  if (data) {
    const goobData = JSON.parse(data);
    goobs = goobData.map(pos => new Goob(pos.x, pos.y));
  }
}

// Drawing
function drawGrid() {
  ctx.strokeStyle = "#ccc";
  for (let x = 0; x <= canvas.width; x += cellSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += cellSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  goobs.forEach(goob => goob.draw());
}

// Main loop
function gameLoop(timestamp) {
  const deltaTime = timestamp - lastFrameTime;
  lastFrameTime = timestamp;

  gameTime += deltaTime * gameTimeFactor;

  goobs.forEach(goob => goob.update(deltaTime));
  draw();

  // Update status UI
  document.getElementById("goobCount").textContent = goobs.length;
  document.getElementById("gameTime").textContent = gameTime.toFixed(1);

  saveGameState();
  requestAnimationFrame(gameLoop);
}

// Add Goob on click
canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / cellSize);
  const y = Math.floor((e.clientY - rect.top) / cellSize);

  if (x <= gridSize - 2 && y <= gridSize - 2) {
    goobs.push(new Goob(x, y));
    saveGameState();
  }
});

// Start the game
loadGameState();
requestAnimationFrame(gameLoop);

