// This is where your GoobGarden JavaScript logic will go!
// For now, let's just make sure it's linked correctly.

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Initial check to see if the canvas was found
    if (canvas) {
        console.log("Canvas found! GoobGarden is ready to grow!");
        
    } else {
        console.error("Canvas element not found!");
    }

    // You'll start adding your game logic here soon!
    // Like:
    // - Grid setup
    // - Goob class/objects
    // - Game loop (movement, changes, drawing)
    // - Event listeners for user interaction
});
