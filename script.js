const canvas = document.getElementById('gardenCanvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 25;  // pixels per grid square
const GRID_COUNT = 40; // 40x40 grid

const GOOB_SIZE = 2; // goobs cover 2x2 grid squares

const goobImg = new Image();
goobImg.src = 'Goob.png';  // make sure this matches exactly (case sensitive!)

let goobs = [];
let timerInterval = null;
let stopwatchStart = null;  // timestamp when stopwatch started

const goobCountEl = document.getElementById('goobCount');
const gameTimeEl = document.getElementById('gameTime');
const clockEl = document.getElementById('clock');

const newGardenBtn = document.getElementById('newGardenBtn');
const resetGardenBtn = document.getElementById('resetGardenBtn');

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#ccc';
  for(let i = 0; i <= GRID_COUNT; i++) {
    // vertical lines
    ctx.beginPath();
    ctx.moveTo(i * GRID_SIZE, 0);
    ctx.lineTo(i * GRID_SIZE, GRID_COUNT * GRID_SIZE);
    ctx.stroke();

    // horizontal lines
    ctx.beginPath();
    ctx.moveTo(0, i * GRID_SIZE);
    ctx.lineTo(GRID_COUNT * GRID_SIZE, i * GRID_SIZE);
    ctx.stroke();
  }
}

function drawGoobs() {
  goobs.forEach(goob => {
    // Only draw after image loads
    if (goobImg.complete) {
      ctx.drawImage(
        goobImg,
        goob.x * GRID_SIZE,
        goob.y * GRID_SIZE,
        GOOB_SIZE * GRID_SIZE,
        GOOB_SIZE * GRID_SIZE
      );
    }
  });
}

function updateGoobCount() {
  goobCountEl.textContent = goobs.length;
}

function updateStopwatch() {
  if (!stopwatchStart) {
    gameTimeEl.textContent = '0m 0s';
    return;
  }
  const elapsedMs = Date.now() - stopwatchStart;
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  gameTimeEl.textContent = `${mins}m ${secs}s`;
}

function startStopwatch() {
  stopwatchStart = Date.now();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    updateStopwatch();
  }, 1000);
}

function spawnInitialGoobs() {
  goobs = [
    { x: 5, y: 5 },
    { x: 43, y: 43 }
  ];
  updateGoobCount();
}

function render() {
  drawGrid();
  drawGoobs();
}

function newGarden() {
  spawnInitialGoobs();
  startStopwatch();
  render();
}

newGardenBtn.addEventListener('click', newGarden);

resetGardenBtn.addEventListener('click', () => {
  alert('Reset Garden not implemented yet');
});

// On page load just draw grid and zero goobs and timer
drawGrid();
updateGoobCount();
updateStopwatch();
