const canvas = document.getElementById('gardenCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1000;
canvas.height = 1000;

const gridSize = 50;
const cellSize = canvas.width / gridSize;

let goobs = [];

class Goob {
    constructor(gridX, gridY) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.size = 2; // 2x2 cells
    }
}

const goobImg = new Image();
goobImg.src = 'Goob.png';

let gameTimeInSeconds = 0;
let gameTimerInterval = null;

const newResetButton = document.getElementById('newResetGarden');
const goobCountSpan = document.getElementById('goobCount');
const gameTimerSpan = document.getElementById('gameTimer');

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#e0ffe0'; // grid background
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
        ctx.drawImage(
            goobImg,
            goob.gridX * cellSize,
            goob.gridY * cellSize,
            goob.size * cellSize,
            goob.size * cellSize
        );
    });
}

function updateDisplay() {
    drawGrid();
    drawGoobs();
    goobCountSpan.textContent = goobs.length;

    const hrs = String(Math.floor(gameTimeInSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((gameTimeInSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(gameTimeInSeconds % 60).padStart(2, '0');
    gameTimerSpan.textContent = `${hrs}:${mins}:${secs}`;
}

function startTimer() {
    clearInterval(gameTimerInterval);
    gameTimerInterval = setInterval(() => {
        gameTimeInSeconds++;
        updateDisplay();
    }, 1000);
}

function newOrResetGarden() {
    const confirmReset = confirm("Are you sure you would like to start a new GoobGarden?");
    if (!confirmReset) return;

    goobs = [new Goob(5, 5), new Goob(43, 43)];
    gameTimeInSeconds = 0;
    updateDisplay();
    startTimer();

    newResetButton.textContent = 'Reset Garden';
}

newResetButton.addEventListener('click', newOrResetGarden);

// Wait until Goob.png is fully loaded before initial display
goobImg.onload = () => {
    updateDisplay();
};
