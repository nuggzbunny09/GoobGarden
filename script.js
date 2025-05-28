const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const tileSize = 20;
const gridWidth = 50;
const gridHeight = 50;
canvas.width = tileSize * gridWidth;
canvas.height = tileSize * gridHeight;

let goobs = [];

// === Persistent Game Clock ===
function getGameStartTime() {
  return parseInt(localStorage.getItem("gameStartTime"), 10);
}

function setGameStartTime(timestamp) {
  localStorage.setItem("gameStartTime", timestamp.toString());
}

function resetGameClock() {
  const now = Date.now();
  setGameStartTime(now);
}

function updateGameClock() {
  const gameTimeDisplay = document.getElementById("gameTime");
  const startTime = getGameStartTime();
  if (!startTime) return;

  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;
  gameTimeDisplay.textContent = `${hours}h ${minutes}m ${seconds}s`;
}

// === Goob Functions ===
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#ccc";
  for (let x = 0; x <= canvas.width; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawGoobs() {
  for (const goob of goobs) {
    ctx.fillStyle = "purple";
    ctx.beginPath();
    ctx.arc(
      goob.x * tileSize + tileSize / 2,
      goob.y * tileSize + tileSize / 2,
      tileSize / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

function updateGoobCount() {
  document.getElementById("goobCount").textContent = goobs.length;
}

function saveGoobs() {
  localStorage.setItem("goobs", JSON.stringify(goobs));
}

function loadGoobs() {
  const data = localStorage.getItem("goobs");
  return data ? JSON.parse(data) : [];
}

// === Reset Button ===
function resetGarden() {
  goobs = [
    { x: 5, y: 5 },
    { x: 43, y: 43 }
  ];
  saveGoobs();
  resetGameClock();
  updateGoobCount();
  render();
}

// === Full Render ===
function render() {
  drawGrid();
  drawGoobs();
}

// === Init ===
function startGame() {
  goobs = loadGoobs();
  if (!getGameStartTime()) {
    resetGarden(); // Sets initial time and goobs
  } else {
