// --- 1. Canvas and Context Setup ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- 2. Game Grid Properties ---
const gridSize = 50;
const cellSize = canvas.width / gridSize;

// --- 3. Goob Definition ---
class Goob {
    constructor(gridX, gridY) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.displaySizeCells = 2;
        this.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    }

    moveRandomly() {
        const directions = [
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 }
        ];
        const randomDir = directions[Math.floor(Math.random() * directions.length)];

        let newX = this.gridX + randomDir.dx;
        let newY = this.gridY + randomDir.dy;

        if (newX >= 0 && newX <= (gridSize - this.displaySizeCells) &&
            newY >= 0 && newY <= (gridSize - this.displaySizeCells)) {
            this.gridX = newX;
            this.gridY = newY;
        }
    }

    draw(ctx, goobImage, cellSize) {
        const pixelX = this.gridX * cellSize;
        const pixelY = this.gridY * cellSize;
        const goobDisplayWidth = this.displaySizeCells * cellSize;
        const goobDisplayHeight = this.displaySizeCells * cellSize;

        ctx.drawImage(goobImage, pixelX, pixelY, goobDisplayWidth, goobDisplayHeight);
    }
}

const goobs = [];

// --- 4. Game State Variables ---
let gameTimeInMinutes = 0;
let lastGoobMoveTime = 0;
const goobMoveIntervalMinutes = 5;

// --- 5. Goob Image Loading ---
const goobImage = new Image();
goobImage.src = 'Goob.png';

goobImage.onload = () => {
    console.log("Goob image loaded. Initializing GoobGarden!");

    loadGameState();
    if (goobs.length === 0) {
        console.log("No saved state found, creating new Goobs.");
        goobs.push(new Goob(5, 5));
        goobs.push(new Goob(gridSize - 2 - 5, gridSize - 2 - 5)); // (43, 43)
        saveGameState();
    } else {
        console.log("Loaded game state with", goobs.length, "Goobs.");
    }

    startGameLoop();
};

goobImage.onerror = () => {
    console.error("Error loading Goob.png! Check the file path.");
};

document.addEventListener('DOMContentLoaded', () => {
    if (!canvas) {
        console.error("Canvas element not found!");
    }

    document.getElementById('goobCount').textContent = goobs.length;
    document.getElementById('gameTime').textContent = `${Math.floor(gameTimeInMinutes)}m`;
});

// --- 7. Game State Management ---
function saveGameState() {
    const gameState = {
        goobs: goobs.map(goob => ({ gridX: goob.gridX, gridY: goob.gridY, color: goob.color })),
        gameTimeInMinutes,
        lastGoobMoveTime
    };
    try {
        localStorage.setItem('goobGardenState', JSON.stringify(gameState));
        console.log("Game state saved.");
    } catch (e) {
        console.error("Failed to save game state:", e);
    }
}

function loadGameState() {
    try {
        const savedState = localStorage.getItem('goobGardenState');
        if (savedState) {
            const gameState = JSON.parse(savedState);
            goobs.length = 0;
            gameState.goobs.forEach(g => {
                const newGoob = new Goob(g.gridX, g.gridY);
                newGoob.color = g.color;
                goobs.push(newGoob);
            });
            gameTimeInMinutes = gameState.gameTimeInMinutes || 0;
            lastGoobMoveTime = gameState.lastGoobMoveTime || 0;
            console.log("Game state loaded.");
            return true;
        }
    } catch (e) {
        console.error("Failed to load game state:", e);
    }
    return false;
}

// --- 8. Game Loop ---
let lastFrameTime = 0;
let lastSaveTime = 0;
const gameTimeFactor = 1000 * 60; // 1 sec real-time = 1 game min
const saveIntervalSeconds = 10;

function update(deltaTime) {
    gameTimeInMinutes += deltaTime / gameTimeFactor;

    if (gameTimeInMinutes - lastGoobMoveTime >= goobMoveIntervalMinutes) {
        console.log(`It's been ${goobMoveIntervalMinutes} game minutes! Goobs are moving.`);
        goobs.forEach(goob => goob.moveRandomly());
        lastGoobMoveTime = gameTimeInMinutes;
        saveGameState();
    }

    const currentRealTimeSeconds = performance.now() / 1000;
    if (currentRealTimeSeconds - lastSaveTime >= saveIntervalSeconds) {
        saveGameState();
        lastSaveTime = currentRealTimeSeconds;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    goobs.forEach(goob => goob.draw(ctx, goobImage, cellSize));

    document.getElementById('goobCount').textContent = goobs.length;
    document.getElementById('gameTime').textContent = `${Math.floor(gameTimeInMinutes)}m`;
}

function gameLoop(currentTime) {
    if (lastFrameTime === 0) {
        lastFrameTime = currentTime;
        lastSaveTime = performance.now() / 1000;
    }

    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;

    update(deltaTime);
    draw();

    requestAnimationFrame(gameLoop);
}

function startGameLoop() {
    requestAnimationFrame(gameLoop);
}

