// Get references to the canvas and its 2D drawing context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Define your grid properties
const gridSize = 50; // Your 50x50 logical grid
const cellSize = canvas.width / gridSize; // Calculate pixel size of each cell (1000 / 50 = 20 pixels)

// --- Goob Image Loading ---
const goobImage = new Image();
goobImage.src = 'Goob.png'; // Path to your Goob.png file (still in root)

// It's crucial to draw the image *after* it has loaded
goobImage.onload = () => {
    console.log("Goob image loaded successfully!");

    // Clear the canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Drawing the Goob ---
    // Let's place one Goob at a specific grid position, for example, (5, 5) on the 50x50 grid
    // IMPORTANT: This (goobGridX, goobGridY) will be the TOP-LEFT cell of your 2x2 Goob
    const goobGridX = 5; // Grid X-coordinate (0 to 49)
    const goobGridY = 5; // Grid Y-coordinate (0 to 49)

    // Calculate the pixel position on the canvas for the top-left corner of this Goob
    const pixelX = goobGridX * cellSize; // 5 * 20 = 100 pixels
    const pixelY = goobGridY * cellSize; // 5 * 20 = 100 pixels

    // Define the Goob's display size (2x2 grid cells)
    const goobDisplayWidth = 2 * cellSize;  // 2 * 20 = 40 pixels
    const goobDisplayHeight = 2 * cellSize; // 2 * 20 = 40 pixels

    // Draw the Goob image to fill the 2x2 grid slot (40x40 pixels)
    // ctx.drawImage(image, dx, dy, dWidth, dHeight);
    ctx.drawImage(goobImage, pixelX, pixelY, goobDisplayWidth, goobDisplayHeight);

    // Optional: Draw a grid for visualization (useful for development)
    ctx.strokeStyle = '#ccc'; // Light grey lines
    ctx.lineWidth = 0.5; // Thin lines
    for (let i = 0; i < gridSize; i++) { // Loop up to 50 for the 50x50 grid
        // Draw vertical lines
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();

        // Draw horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
    }
};

// Handle potential errors if the image doesn't load
goobImage.onerror = () => {
    console.error("Error loading Goob.png! Make sure the file path is correct.");
};

// Initial check to see if the canvas was found
document.addEventListener('DOMContentLoaded', () => {
    if (canvas) {
        console.log("Canvas found! GoobGarden setup is progressing.");
    } else {
        console.error("Canvas element not found!");
    }
});
