// Get references to the canvas and its 2D drawing context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Define your grid properties
const gridSize = 50; // *** CHANGED: Your new 50x50 logical grid ***
// Calculate pixel size of each cell: 1000 pixels / 50 grid cells = 20 pixels
const cellSize = canvas.width / gridSize; // *** CHANGED: This will now be 20 ***

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
    const goobGridX = 5; // Grid X-coordinate (0 to 49)
    const goobGridY = 5; // Grid Y-coordinate (0 to 49)

    // Calculate the pixel position on the canvas for the top-left corner of this grid cell
    const pixelX = goobGridX * cellSize; // 5 * 20 = 100 pixels
    const pixelY = goobGridY * cellSize; // 5 * 20 = 100 pixels

    // Draw the Goob image to fill the 20x20 pixel slot
    // ctx.drawImage(image, dx, dy, dWidth, dHeight);
    ctx.drawImage(goobImage, pixelX, pixelY, cellSize, cellSize); // Draw at (100, 100) with 20x20 size

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
