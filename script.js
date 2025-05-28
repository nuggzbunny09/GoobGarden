// Get references to the canvas and its 2D drawing context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Define your grid properties
const gridSize = 100; // Your 100x100 logical grid
const cellSize = canvas.width / gridSize; // Calculate pixel size of each cell (1000 / 100 = 10 pixels)

// --- Goob Image Loading ---
const goobImage = new Image();
goobImage.src = 'Goob.png'; // Path to your Goob.png file

// It's crucial to draw the image *after* it has loaded
goobImage.onload = () => {
    console.log("Goob image loaded successfully!");

    // Clear the canvas first (removes the initial blue square if it's still there)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Drawing the Goob ---
    // Let's place one Goob at a specific grid position, for example, (5, 5)
    const goobGridX = 5; // Grid X-coordinate (0 to 99)
    const goobGridY = 5; // Grid Y-coordinate (0 to 99)

    // Calculate the pixel position on the canvas for the top-left corner of this grid cell
    const pixelX = goobGridX * cellSize; // 5 * 10 = 50 pixels
    const pixelY = goobGridY * cellSize; // 5 * 10 = 50 pixels

    // Draw the Goob image to fill a 10x10 pixel slot
    // ctx.drawImage(image, dx, dy, dWidth, dHeight);
    ctx.drawImage(goobImage, pixelX, pixelY, cellSize, cellSize); // Draw at (50, 50) with 10x10 size

    // Optional: Draw a grid for visualization (useful for development)
    // You can comment this out later
    ctx.strokeStyle = '#ccc'; // Light grey lines
    ctx.lineWidth = 0.5; // Thin lines
    for (let i = 0; i < gridSize; i++) {
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

// Initial check to see if the canvas was found (from previous step)
document.addEventListener('DOMContentLoaded', () => {
    if (canvas) {
        console.log("Canvas found! GoobGarden setup is progressing.");
        // The image drawing is now handled by goobImage.onload
    } else {
        console.error("Canvas element not found!");
    }
});
