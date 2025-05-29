const canvas = document.getElementById('gardenCanvas');
const ctx = canvas.getContext('2d');
const cellSize = 20;
const goobImage = new Image();
goobImage.src = 'Goob.png';

const goobModal = document.getElementById('goobModal');
const editGoobName = document.getElementById('editGoobName');
const goobAge = document.getElementById('goobAge');
const goobHunger = document.getElementById('goobHunger');
const saveGoobBtn = document.getElementById('saveGoobBtn');
const closeModalBtn = document.querySelector('.close-btn');
const confirmation = document.getElementById('saveConfirmation');
const tooltip = document.getElementById('goobTooltip');

let goobData = [];
let lastAnimationTime = 0;
let selectedGoob = null;
let timerInterval;
let gameStartTime = null;

window.addEventListener("DOMContentLoaded", () => {
  const canvases = document.querySelectorAll(".goobCanvas");
  const img = new Image();
  img.src = "Goob.png";
  img.onload = () => {
    canvases.forEach(canvas => {
      const ctx = canvas.getContext("2d");
      canvas.width = 50;
      canvas.height = 50;

      const tintColor = canvas.dataset.color;
      // Draw original
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Set blending mode and overlay color
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = tintColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";
    });
  };
});


function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#e0ffe0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#ccc';
  for (let i = 0; i <= canvas.width; i += cellSize) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }

  for (let j = 0; j <= canvas.height; j += cellSize) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(canvas.width, j);
    ctx.stroke();
  }
}

function getRandomDirection() {
  const directions = [
    { dx: 0, dy: -1 }, // up
    { dx: 0, dy: 1 },  // down
    { dx: -1, dy: 0 }, // left
    { dx: 1, dy: 0 }   // right
  ];
  return directions[Math.floor(Math.random() * directions.length)];
}

function canMove(goob, dx, dy, allGoobs) {
  const newX = goob.position.x + dx;
  const newY = goob.position.y + dy;

  // Stay within grid bounds (check all 2x2 tiles)
  if (
  newX < 0 || newY < 0 ||
  newX + 1 >= canvas.width / cellSize ||
  newY + 1 >= canvas.height / cellSize
) {
  return false;
}

  // Check for collisions with other Goobs
  for (let other of allGoobs) {
    if (other === goob) continue;
    for (let ox = 0; ox < 2; ox++) {
      for (let oy = 0; oy < 2; oy++) {
        for (let gx = 0; gx < 2; gx++) {
          for (let gy = 0; gy < 2; gy++) {
            if (newX + gx === other.position.x + ox && newY + gy === other.position.y + oy) {
              return false;
            }
          }
        }
      }
    }
  }

  return true;
}

function moveGoobsRandomly() {
  for (let goob of goobData) {
    const { dx, dy } = getRandomDirection();
    if (canMove(goob, dx, dy, goobData)) {
      goob.startPosition = { ...goob.position };
      goob.targetPosition = {
        x: goob.position.x + dx,
        y: goob.position.y + dy
      };
      goob.startTime = performance.now();
    }
  }

  saveGoobsToLocalStorage();
}

function drawGoobs(timestamp) {
  for (let goob of goobData) {
    let { x, y } = goob.position;

    if (goob.targetPosition && goob.startTime !== undefined) {
      const progress = Math.min((timestamp - goob.startTime) / 500, 1); // 500ms animation
      x = goob.startPosition.x + (goob.targetPosition.x - goob.startPosition.x) * progress;
      y = goob.startPosition.y + (goob.targetPosition.y - goob.startPosition.y) * progress;

      if (progress >= 1) {
        goob.position = { ...goob.targetPosition };
        delete goob.startPosition;
        delete goob.targetPosition;
        delete goob.startTime;
      }
    }

    ctx.drawImage(
      goobImage,
      x * cellSize,
      y * cellSize,
      cellSize * 2,
      cellSize * 2
    );
  }
}

function updateGameTimeDisplay() {
  if (!gameStartTime) return;
  const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
  const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');
  document.getElementById('gameTime').textContent = `${hours}:${minutes}:${seconds}`;
}

function startGameTimer() {
  gameStartTime = Date.now();
  localStorage.setItem('goobStartTime', gameStartTime);
  clearInterval(timerInterval);
  timerInterval = setInterval(updateGameTimeDisplay, 1000);
}

function loadGameTimer() {
  const savedTime = localStorage.getItem('goobStartTime');
  if (savedTime) {
    gameStartTime = parseInt(savedTime);
    timerInterval = setInterval(updateGameTimeDisplay, 1000);
  }
}

function saveGoobsToLocalStorage() {
  localStorage.setItem('goobs', JSON.stringify(goobData));
}

function createInitialGoobs() {
  const now = Date.now();
  goobData = [
    {
      name: "Goob1",
      position: { x: 5, y: 5 },
      hunger: 100,
      createdAt: now
    },
    {
      name: "Goob2",
      position: { x: 43, y: 43 },
      hunger: 100,
      createdAt: now
    }
  ];
  saveGoobsToLocalStorage();
}

function newGarden() {
  if (!confirm("Are you sure you want to start a new Goob Garden?")) return;
  localStorage.clear();
  createInitialGoobs();
  startGameTimer();
  drawGrid();
  drawGoobs();
  document.getElementById('newGardenBtn').textContent = 'Reset Garden';
}

function restoreStateFromLocalStorage() {
  const storedGoobs = localStorage.getItem('goobs');
  if (storedGoobs) goobData = JSON.parse(storedGoobs);
  drawGrid();
  drawGoobs();
  loadGameTimer();
  updateGameTimeDisplay();
}

goobImage.onload = () => {
  drawGrid();
  restoreStateFromLocalStorage();
  const button = document.getElementById('newGardenBtn');
  const storedGoobs = localStorage.getItem('goobs');
  button.textContent = storedGoobs && JSON.parse(storedGoobs).length > 0 ? 'Reset Garden' : 'New Garden';
  requestAnimationFrame(animateGarden);
};

document.getElementById('newGardenBtn').addEventListener('click', newGarden);

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const gridX = Math.floor((e.clientX - rect.left) / cellSize);
  const gridY = Math.floor((e.clientY - rect.top) / cellSize);

  for (const goob of goobData) {
    const { x, y } = goob.position;
    if (gridX >= x && gridX < x + 2 && gridY >= y && gridY < y + 2) {
      const ageMs = Date.now() - goob.createdAt;
      const ageMin = Math.floor(ageMs / 60000);
      const days = Math.floor(ageMin / 1440);
      const hours = Math.floor((ageMin % 1440) / 60);
      const minutes = ageMin % 60;

      tooltip.style.display = 'block';
      tooltip.style.left = `${e.pageX + 10}px`;
      tooltip.style.top = `${e.pageY + 10}px`;
      tooltip.innerHTML = `
        <strong>${goob.name}</strong><br>
        Age: ${days}d ${hours}h ${minutes}m<br>
        Hunger: ${goob.hunger}
      `;
      return;
    }
  }
  tooltip.style.display = 'none';
});

canvas.addEventListener('mouseleave', () => {
  tooltip.style.display = 'none';
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const gridX = Math.floor((e.clientX - rect.left) / cellSize);
  const gridY = Math.floor((e.clientY - rect.top) / cellSize);

  for (const goob of goobData) {
    const { x, y } = goob.position;
    if (gridX >= x && gridX < x + 2 && gridY >= y && gridY < y + 2) {
      selectedGoob = goob;
      editGoobName.value = goob.name;

      const ageMs = Date.now() - goob.createdAt;
      const ageMin = Math.floor(ageMs / 60000);
      const days = Math.floor(ageMin / 1440);
      const hours = Math.floor((ageMin % 1440) / 60);
      const minutes = ageMin % 60;

      goobAge.textContent = `${days}d ${hours}h ${minutes}m`;
      goobHunger.textContent = goob.hunger;
      goobModal.style.display = 'block';
      return;
    }
  }
});

closeModalBtn.addEventListener('click', () => {
  goobModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === goobModal) {
    goobModal.style.display = 'none';
  }
});

saveGoobBtn.addEventListener('click', () => {
  if (selectedGoob) {
    selectedGoob.name = editGoobName.value;
    saveGoobsToLocalStorage();
    goobModal.style.display = 'none';
    showConfirmation("Goob Saved!");
  }
});

function showConfirmation(message) {
  confirmation.textContent = message;
  confirmation.classList.add('show');

  setTimeout(() => {
    confirmation.classList.remove('show');
  }, 2000);
}

function animateGarden(timestamp) {
  if (!lastAnimationTime || timestamp - lastAnimationTime > 16) {
    drawGrid();
    drawGoobs(timestamp);
    lastAnimationTime = timestamp;
  }
  requestAnimationFrame(animateGarden);
}


setInterval(moveGoobsRandomly, 10000); // every 10 seconds

