const canvas = document.getElementById('gardenCanvas');
const ctx = canvas.getContext('2d');

const gridCount = 50;
const cellSize = canvas.width / gridCount; // 20px

const newGardenBtn = document.getElementById('newGardenBtn');
const gameTimeSpan = document.getElementById('gameTime');

const goobImage = new Image();
goobImage.src = 'Goob.png';

let goobs = [];
let timerInterval = null;
let startTime = null;

class Goob {
  constructor(gridX, gridY) {
    this.gridX = gridX;
    this.gridY = gridY;
  }
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= gridCount; i++) {
    let pos = i * cellSize;
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height);
    ctx.moveTo(0, pos);
    ctx.lineTo(canvas.width, pos);
  }
  ctx.stroke();
}

function drawGoobs() {
  goobs.forEach(goob => {
    ctx.drawImage(goobImage, goob.gridX * cellSize, goob.gridY * cellSize, cellSize * 2, cellSize * 2);
  });
}

function formatTime(ms) {
  let totalSeconds = Math.floor(ms / 1000);
  let hours = Math.floor(totalSeconds / 3600);
  let minutes = Math.floor((totalSeconds % 3600) / 60);
  let seconds = totalSeconds % 60;
  return (
    String(hours).padStart(2, '0') + ':' +
    String(minutes).padStart(2, '0') + ':' +
    String(seconds).padStart(2, '0')
  );
}

function updateTimer() {
  let elapsed = Date.now() - startTime;
  gameTimeSpan.textContent = formatTime(elapsed);
}

function startTimer() {
  startTime = Date.now();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);
}

function newGarden() {
  goobs = [];
  goobs.push(new Goob(5,5));
  goobs.push(new Goob(43,43));
  drawGrid();
  drawGoobs();
  startTimer();
}

// Draw initial empty grid on load
goobImage.onload = () => {
  drawGrid();
};

newGardenBtn.addEventListener('click', () => {
  newGarden();
});
