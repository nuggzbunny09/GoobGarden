const canvas = document.getElementById('gardenCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 50;
const cellSize = canvas.width / gridSize; // 1000 / 50 = 20px

const goobSize = 2; // Goob takes up 2x2 grid cells
const goobs = [];

let gameStartTime = null;
let timerInterval = null;

const newGardenBtn = document.getElementById('newGardenBtn');
const gameTimeDisplay = document.getElementById('gameTime');

const goobImage = new Image();
goobImage.src = 'Goob.png';

// Draw the grid
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#ccc';

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

// Draw all Goobs
function drawGoobs() {
  for (const goob of goobs) {
    ctx.drawImage(
      goobImage,
      goob.x * cellSize,
      goob.y * cellSize,
      goobSize * cellSize,
      goobSize * cellSize
    );
  }
}

// Start the game timer
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  gameStartTime = Date.now();

  timerInterval = setInterval(() => {
    const elapsed = Date.now() - gameStartTime;
    const hours = String(Math.floor(elapsed / 3600000)).padStart(2, '0');
    const minutes = String(Math.floor((elapsed % 3600000) / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');
    gameTimeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
  }, 1000);
}

// Reset the garden
function newGarden() {
  if (!confirm('Are you sure you would like to start a new GoobGarden?')) return;

  goobs.length = 0; // Clear any existing goobs

  // Place two Goobs
  goobs.push({ x: 5, y: 5 });
  goobs.push({ x: 43, y: 43 });

  startTimer();
  drawGrid();
  drawGoobs();

  // Update button text
  newGardenBtn.textContent = 'Reset Garden';
}

goobImage.onload = () => {
  drawGrid(); // Initial grid display
};

newGardenBtn.addEventListener('click', newGarden);
