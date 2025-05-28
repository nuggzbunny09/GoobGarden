const canvas = document.getElementById('gardenCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1000;
canvas.height = 1000;

const gridSize = 50; // 50x50 grid
const cellSize = canvas.width / gridSize; // 20 pixels per cell

let goobs = [];

class Goob {
    constructor(gridX, gridY) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.size = 2; // Goobs take 4 grid spaces (2x2)
    }
}

const goobImg = new Image();
goobImg.src = 'Goob.png';

let gameTimeInSeconds = 0;
let gameLoopStarted = false;
let gameTimerInterval = null;

const newResetButton = document.getElementById('newResetGarden');
const goobCountSpan = document.getElementById('goobCount');
const gameTimerSpan = document.getElementById('gameTimer');

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#e0ffe0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
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

function drawGoobs() {
    goobs.forEach(goob => {
        // Draw the Goob.png scaled to 2x2 grid cells (cellSize * 2)
        ctx.drawImage(goobImg, goob.gridX * cellSize, goob.gridY * cellSize, cellSize * goob.size, cellSize * goob.size);
    });
}

function draw() {
    drawGrid();
    drawGoobs();
    goobCountSpan.textContent = goobs.length;
    updateGameTimerDisplay();
}

function updateGameTimerDisplay() {
    const hours = Math.floor(gameTimeInSeconds / 3600);
    const minutes = Math.floor((gameTimeInSeconds % 3600) / 60);
    const seconds = gameTimeInSeconds % 60;

    gameTimerSpan.textContent =
        `${hours.toString().padStart(2, '0')}:` +
        `${minutes.toString().padStart(2, '0')}:` +
        `${seconds.toString().padStart(2, '0')}`;
}

function startGameLoop() {
    if (gameTimerInterval) clearInterval(gameTimerInterval);
    gameTimerInterval = setInterval(() => {
        gameTimeInSeconds++;
        draw();
    }, 1000);
}

function saveGameState() {
    // If you want to save game state later
}

function startOrResetGarden() {
    const confirmStart = confirm("Are you sure you would like to start a new GoobGarden?");
    if (!confirmStart) return;

    goobs.length = 0;

    goobs.push(new Goob(5, 5));
    goobs.push(new Goob(43, 43));

    gameTimeInSeconds = 0;

    if (newResetButton.textContent === 'New Garden') {
        newResetButton.textContent = 'Reset Garden';
    }

    saveGameState();
    draw();

    if (!gameLoopStarted) {
        startGameLoop();
        gameLoopStarted = true;
    }
}

newResetButton.addEventListener('click', startOrResetGarden);

// Initial draw with empty garden and timer at 00:00:00
draw();
updateGameTimerDisplay();

