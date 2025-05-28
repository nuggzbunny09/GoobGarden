const canvas = document.getElementById('gardenCanvas');
const ctx = canvas.getContext('2d');
const cellSize = 20;
const gridSize = 50;
const goobImage = new Image();
goobImage.src = 'Goob.png';

let goobData = [];
let timerInterval;
let gameStartTime = null;
let gameRunning = false;

let selectedGoob = null;

const goobModal = document.getElementById('goobModal');
const editGoobName = document.getElementById('editGoobName');
const goobAge = document.getElementById('goobAge');
const goobHunger = document.getElementById('goobHunger');
const saveGoobBtn = document.getElementById('saveGoobBtn');
const closeModalBtn = document.querySelector('.close-btn');

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

function drawGoobs() {
  goobData.forEach(goob => {
    ctx.drawImage(goobImage, goob.position.x * cellSize, goob.position.y * cellSize, cellSize * 2, cellSize * 2);
  });
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
  goobData = [
    {
      name: "Goob1",
      position: { x: 5, y: 5 },
      age: 0,
      hunger: 100
    },
    {
      name: "Goob2",
      position: { x: 43, y: 43 },
      age: 0,
      hunger: 100
    }
  ];
  saveGoobsToLocalStorage();
}

function newGarden() {
  const confirmed = confirm("Are you sure you would like to start a new GoobGarden?");
  if (!confirmed) return;

  localStorage.clear();
  createInitialGoobs();
  startGameTimer();
  drawGrid();
  drawGoobs();

  const button = document.getElementById('newGardenBtn');
  button.textContent = 'Reset Garden';
}

function restoreStateFromLocalStorage() {
  const storedGoobs = localStorage.getItem('goobs');
  if (storedGoobs) {
    goobData = JSON.parse(storedGoobs);
    drawGrid();
    drawGoobs();
  }
  loadGameTimer();
  updateGameTimeDisplay();
}

document.getElementById('newGardenBtn').addEventListener('click', newGarden);

goobImage.onload = () => {
  drawGrid();
  restoreStateFromLocalStorage();
};

const tooltip = document.getElementById('goobTooltip');

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const gridX = Math.floor(mouseX / cellSize);
  const gridY = Math.floor(mouseY / cellSize);

  let found = false;

  for (const goob of goobData) {
    const { x, y } = goob.position;
    if (
      gridX >= x && gridX < x + 2 &&
      gridY >= y && gridY < y + 2
    ) {
      tooltip.style.display = 'block';
      tooltip.style.left = `${e.pageX + 10}px`;
      tooltip.style.top = `${e.pageY + 10}px`;
      tooltip.innerHTML = `
        <strong>${goob.name}</strong><br>
        Age: ${goob.age}<br>
        Hunger: ${goob.hunger}
      `;
      found = true;
      break;
    }
  }

  if (!found) {
    tooltip.style.display = 'none';
  }
});

canvas.addEventListener('mouseleave', () => {
  tooltip.style.display = 'none';
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const gridX = Math.floor(mouseX / cellSize);
  const gridY = Math.floor(mouseY / cellSize);

  for (const goob of goobData) {
    const { x, y } = goob.position;
    if (
      gridX >= x && gridX < x + 2 &&
      gridY >= y && gridY < y + 2
    ) {
      selectedGoob = goob;
      editGoobName.value = goob.name;
      goobAge.textContent = goob.age;
      goobHunger.textContent = goob.hunger;
      goobModal.style.display = 'block';
      break;
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

    // Show confirmation
    const confirmation = document.getElementById('saveConfirmation');
    confirmation.style.display = 'block';
    setTimeout(() => {
      confirmation.style.display = 'none';
    }, 2000); // hides after 2 seconds
  }
});


