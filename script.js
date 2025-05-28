const canvas = document.getElementById('gardenCanvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 25;  // pixels per grid square
const GRID_COUNT = 40; // 40x40 grid

const GOOB_SIZE = 2; // goobs cover 2x2 grid squares

const goobImg = new Image();
goobImg.src = 'goob.png';

let goobs = [];
let timerInterval = null;
let clockInterval = null;
let startTime = null;

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
    ctx.drawImage(
      goobImg,
      goob.x * GRID_SIZE,
      goob.y * GRID_SIZE,
      GOOB_SIZE * GRID_SIZE,
      GOOB_SIZE * GRID_SIZE
    );
  });
}

function updateGoobCount() {
  goobCountEl.textContent = goobs.length;
}

function updateGameTime() {
  if (!startTime) {
    gameTimeEl.textContent = '0m';
    return;
  }
  const elapsedMs = Date.now() - startTime;
  const elapsedMins = Math.floor(elapsedMs / 60000);
  gameTimeEl.textContent = `${elapsedMins}m`;
}

function updateClock() {
  const now = new Date();
  // Format as HH:MM:SS
  const hh = now.getHours().toString().padStart(2,'0');
  const mm = now.getMinutes().toString().padStart(2,'0');
  const ss = now.getSeconds().toString().padStart(2,'0');
  clockEl.textContent = `${hh}:${mm}:${ss}`;
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  startTime = Date.now();

  timerInterval = setInterval(() => {
    updateGameTime();
  }, 1000);
}

function startClock() {
  updateClock();
  if (clockInterval) clearInterval(clockInterval);
  clockInterval = setInterval(updateClock, 1000);
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
  startTimer();
  render();
}

newGardenBtn.addEventListener('click', newGarden);

// For now reset button does nothing
resetGardenBtn.addEventListener('click', () => {
  // You can add reset logic here later
  alert('Reset Garden not implemented yet');
});

// Start clock on page load (persistent)
startClock();

// Initially draw grid with no goobs
drawGrid();
updateGoobCount();
updateGameTime();
