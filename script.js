// --- 1. Canvas and Context Setup ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- 2. Game Grid Properties ---
const gridSize = 50; // Your 50x50 logical grid
const cellSize = canvas.width / gridSize; // Each cell is 20x20 pixels

// --- 3. Goob Definition (Initial State and Structure) ---
// Goob Class/Constructor (better for managing multiple Goobs)
class Goob {
    constructor(gridX, gridY) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.displaySizeCells = 2; // Each Goob occupies a 2x2 block of grid cells
        this.color = `hsl(${Math.random() * 360}, 70%, 50%)`; // A random color for differentiation
        // Add other Goob properties here (e.g., health, hunger, age, personality)
    }

    // Method to move the Goob in a random direction
    moveRandomly() {
        const directions = [
            { dx: 0, dy: -1 }, // Up
            { dx: 0, dy: 1 },  // Down
            { dx: -1, dy: 0 }, // Left
            { dx: 1, dy: 0 }   // Right
        ];
        const randomDir = directions[Math.floor(Math.random() * directions.length)];

        let newX = this.gridX + randomDir.dx;
        let newY = this.gridY + randomDir.dy;

        // Basic boundary checking: ensure Goob stays within the grid
        // Remember displaySizeCells means it occupies an area, so its max position is gridSize - displaySizeCells
        if (newX >= 0 && newX <= (gridSize - this.displaySizeCells) &&
            newY >= 0 && newY <= (gridSize - this.displaySizeCells)) {
            this.gridX = newX;
            this.gridY = newY;
        } else {
            // If it hits a boundary, try moving in the opposite direction or stay put
            // For now, let's make it stay put if it tries to move out of bounds
            // console.log(`Goob tried to move out of bounds at (${newX}, ${newY})`);
        }
    }

    // Method to draw the Goob
    draw(ctx, goobImage, cellSize) {
        const pixelX = this.gridX * cellSize;
        const pixelY = this.gridY * cellSize;
        const goobDisplayWidth = this.displaySizeCells * cellSize;
        const goobDisplayHeight = this.displaySizeCells * cellSize;

        // Draw the Goob image
        ctx.drawImage(goobImage, pixelX, pixelY, goobDisplayWidth, goobDisplayHeight);

        // Optional: Draw a unique color square behind or next to it for debugging multiple Goobs
        // ctx.fillStyle = this.color;
        // ctx.fillRect(pixelX, pixelY, 10, 10); // Small square to show individual goob color
    }
}

// Array to hold all your Goob instances
const goobs = [];

// --- 4. Game State Variables ---
let gameTimeInMinutes = 0; // Tracks game time in minutes
let lastGoobMoveTime = 0; // Timestamp of the last Goob movement (in game minutes)
const goobMoveIntervalMinutes = 5; // Goobs move every 5 game minutes

// --- 5. Goob Image Loading ---
const goobImage = new Image();
goobImage.src = 'Goob.png'; // Path to your Goob.png file

// --- 6. Game Initialization (once image is loaded) ---
goobImage.onload = () => {
    console.log("Goob image loaded. Initializing GoobGarden!");

    // Initialize Goobs if not loaded from saved state
    loadGameState(); // Attempt to load previous state
    if (goobs.length === 0) { // If no saved state, create new Goobs
        console.log("No saved state found, creating new Goobs.");
        // Goob 1: (5,5)
        goobs.push(new Goob(5, 5));
        // Goob 2: Equivalent bottom-right (gridSize - displaySizeCells - 5, gridSize - displaySizeCells - 5)
        // This places its top-left at (50 - 2 - 5, 50 - 2 - 5) = (43, 43)
        goobs.push(new Goob(gridSize - goobs[0].displaySizeCells - 5, gridSize - goobs[0].displaySizeCells - 5));
        saveGameState(); // Save initial state
    } else {
        console.log("Loaded game state with", goobs.length, "Goobs.");
    }


    startGameLoop(); // Start the game loop
};

goobImage.onerror = () => {
    console.error("Error loading Goob.png! Check the file path.");
};

document.addEventListener('DOMContentLoaded', () => {
    if (!canvas) {
        console.error("Canvas element not found!");
    }
});

// --- 7. Game State Management (Saving and Loading) ---
function saveGameState() {
    const gameState = {
        goobs: goobs.map(goob => ({ gridX: goob.gridX, gridY: goob.gridY, color: goob.color })),
        gameTimeInMinutes: gameTimeInMinutes,
        lastGoobMoveTime: lastGoobMoveTime
        // Add any other game state variables here
    };
    try {
        localStorage.setItem('goobGardenState', JSON.stringify(gameState));
        console.log("Game state saved.");
    } catch (e) {
        console.error("Failed to save game state to localStorage:", e);
    }
}

function loadGameState() {
    try {
        const savedState = localStorage.getItem('goobGardenState');
        if (savedState) {
            const gameState = JSON.parse(savedState);
            // Recreate Goob objects from saved data
            goobs.length = 0; // Clear existing goobs
            gameState.goobs.forEach(g => {
                const newGoob = new Goob(g.gridX, g.gridY);
                newGoob.color = g.color; // Restore color
                goobs.push(newGoob);
            });
            gameTimeInMinutes = gameState.gameTimeInMinutes || 0;
            lastGoobMoveTime = gameState.lastGoobMoveTime || 0;
            console.log("Game state loaded.");
            return true;
        }
    } catch (e) {
        console.error("Failed to load game state from localStorage:", e);
    }
    return false;
}


// --- 8. The Game Loop Functions ---
let lastFrameTime = 0;
let lastGameTimeUpdate = 0; // Timestamp for the last game time update
const gameTimeFactor = 1000 * 60; // 1 second real-time = 1 game minute (adjust for faster testing)
                                  // For real 5 minute interval, this means 5 real minutes = 5 game minutes
                                  // If you want 5 real seconds = 5 game minutes for quick testing, set to 1000
const saveIntervalSeconds = 10; // Save game state every 10 real seconds for robustness
let lastSaveTime = 0;

function update(deltaTime) {
    // Advance game time
    gameTimeInMinutes += deltaTime / gameTimeFactor;

    // Check for Goob movement time
    if (gameTimeInMinutes - lastGoobMoveTime >= goobMoveIntervalMinutes) {
        console.log(`It's been ${goobMoveIntervalMinutes} game minutes! Goobs are moving.`);
        goobs.forEach(goob => goob.moveRandomly());
        lastGoobMoveTime = gameTimeInMinutes; // Update the last move time
        saveGameState(); // Save state after movement
    }

    // Auto-save game state periodically (e.g., every 10 real seconds)
    const currentRealTimeSeconds = performance.now() / 1000;
    if (currentRealTimeSeconds - lastSaveTime >= saveIntervalSeconds) {
        saveGameState();
        lastSaveTime = currentRealTimeSeconds;
    }

    // Add other game logic here (e.g., Goob interactions, environmental changes)
}

function draw() {
    // 1. Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Draw the grid
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

    // 3. Draw all Goobs
    goobs.forEach(goob => goob.draw(ctx, goobImage, cellSize));

    // 4. Display game time on the UI (optional, but good for feedback)
    document.getElementById('goobCount').textContent = goobs.length;
    document.getElementById('gameTime').textContent = `${Math.floor(gameTimeInMinutes)}m`;
}

function gameLoop(currentTime) {
    if (!lastFrameTime) lastFrameTime = currentTime;
    const deltaTime = currentTime - lastFrameTime; // Time in milliseconds since last frame
    lastFrameTime = currentTime;

    update(deltaTime); // Update game state based on time
    draw();            // Redraw the scene

    requestAnimationFrame(gameLoop); // Request the next frame
}

function startGameLoop() {
    requestAnimationFrame(gameLoop);
}

// --- 9. Initial UI Update (just in case) ---
// This ensures the counts are correct even before the first full game loop
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('goobCount').textContent = goobs.length; // Will be 0 initially or loaded
    document.getElementById('gameTime').textContent = `${Math.floor(gameTimeInMinutes)}m`;
});
