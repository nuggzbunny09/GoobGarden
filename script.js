const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const cellSize = 20;
const gridSize = 50;
canvas.width = cellSize * gridSize;
canvas.height = cellSize * gridSize;

let goobs = [];
let startTime = Date.now();

const goobImage = new Image();
goobImage.src = 'goob.png';

// Goob class
class Goob {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(ctx, image, size) {
        ctx.drawImage(image, this.x * size, this.y * size, size, size);
    }
}

// Add a goob only if there's no goob at the position
function addGoob(x, y) {
    const exists = goobs.some(goob => goob.x === x && goob.y === y);
    if (!exists) {
        goobs.push(new Goob(x, y));
    }
}

// Reset the garden to initial state
function resetGarden() {
    goobs = [];
    addGoob(5, 5);
    addGoob(43, 43);
    startTime = Date.now(); // Reset timer
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
    }

    // Draw goobs
    goobs.forEach(goob => goob.draw(ctx, goobImage, cellSize));

    // Time elapsed
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    document.getElementById('gameTime').textContent =
        `${hours}h ${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;

    // Update Goob count
    document.getElementById('goobCount').textContent = goobs.length;
}

// Main loop
function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}

// Init
window.onload = () => {
    document.getElementById('resetBtn').addEventListener('click', resetGarden);
    resetGarden(); // Start with 2 Goobs
    gameLoop();
};

