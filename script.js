// --- 1. Canvas and Context Setup ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- 2. Game Grid Properties ---
const gridSize = 50; // Your 50x50 logical grid
const cellSize = canvas.width / gridSize; // Each cell is 20x20 pixels

// --- 3. Goob Definition (Initial State) ---
// We'll define a Goob as an object with its properties
const goob = {
    gridX: 5, // Goob's current grid X position (top-left corner of its 2x2 area)
    gridY: 5, // Goob's current grid Y position
    displaySizeCells: 2, // How many grid cells it occupies (e.g., 2 for a 2x2 block)
    // Add other properties later, like health, hunger, etc.
};

// Calculate Goob's pixel display size
const goobDisplayWidth = goob.displaySizeCells * cellSize; // 2 * 20 = 40 pixels
const goobDisplayHeight = goob.displaySizeCells * cellSize; // 2 * 20 = 40 pixels

// --- 4. Goob Image Loading ---
const goobImage = new Image();
goobImage.src = 'Goob.png'; // Path to your Goob.png file

// --- 5. Game Loop Initialization (once image is loaded) ---
goobImage.onload = () => {
    console.log("Goob image loaded. Starting GoobGarden!");
    // Start the game loop only after all assets are loaded
    startGameLoop();
};

goobImage.onerror = () => {
    console.error("Error loading Goob.png! Check the file path.");
};

// Ensure canvas is found before starting
document.addEventListener('DOMContentLoaded', () => {
    if (!canvas) {
        console.error("Canvas element not found!");
    }
});

// --- 6. The Game Loop Functions ---

// Main update function: Handles all game logic
function update() {
    // --- Goob Movement Logic (Example: Move Goob randomly or based on input) ---
    // For now, let's just make it move one step to the right every second for demonstration
    // In a real game, you'd integrate user input, AI, pathfinding, etc.

    // Simple example: move one grid cell to the right if not at the edge
    // if (goob.gridX < gridSize - goob.displaySizeCells) {
    //     goob.gridX += 1;
    // } else {
    //     goob.gridX = 0; // Wrap around
    // }

    // More realistic: Only update position on a timer or input
    // We'll refine movement in future steps.
}

// Main draw function: Renders everything on the canvas
function draw() {
    // 1. Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Draw the grid (Optional: can be optimized to only draw once or only on empty cells)
    ctx.strokeStyle = '#ccc'; // Light grey lines
    ctx.lineWidth = 0.5; // Thin lines
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

    // 3. Draw the Goob(s)
    // Calculate Goob's current pixel position based on its grid position
    const pixelX = goob.gridX * cellSize;
    const pixelY = goob.gridY * cellSize;

    // Draw the Goob image
    ctx.drawImage(goobImage, pixelX, pixelY, goobDisplayWidth, goobDisplayHeight);
}

// The core game loop function using requestAnimationFrame for smooth animation
let lastTime = 0;
const frameRate = 1000 / 60; // Aim for 60 frames per second (ms per frame)
let accumulatedTime = 0;

function gameLoop(currentTime) {
    if (!lastTime) lastTime = currentTime; // Initialize lastTime on first call
    const deltaTime = currentTime - lastTime; // Time elapsed since last frame
    lastTime = currentTime;

    accumulatedTime += deltaTime;

    // We can run 'update' less frequently than 'draw' for game logic if needed
    // For now, we'll keep it simple
    update(); // Update game state

    draw(); // Redraw everything

    // Request the next frame. This is crucial for the loop!
    requestAnimationFrame(gameLoop);
}

// Function to start the game loop
function startGameLoop() {
    requestAnimationFrame(gameLoop);
}

// --- 7. Event Listeners for User Input (Future Step) ---
// You'll add these later to control Goob movement
// Example:
// document.addEventListener('keydown', (event) => {
//     switch (event.key) {
//         case 'ArrowUp':
//             // goob.gridY--; // Move Goob up
//             break;
//         case 'ArrowDown':
//             // goob.gridY++; // Move Goob down
//             break;
//         // etc.
//     }
// });
