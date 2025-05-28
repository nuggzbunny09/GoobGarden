const canvas = document.getElementById("gardenCanvas");
const ctx = canvas.getContext("2d");
const gridSize = 50;
const tileSize = canvas.width / gridSize;
let gameInterval = null;
let gameStartTime = null;

document.getElementById("newGardenBtn").addEventListener("click", () => {
    if (!confirm("Are you sure you would like to start a new GoobGarden?")) return;

    // Initialize goobs
    const goobs = [
        { id: "goob1", x: 5, y: 5, age: 0, hunger: 100, mood: "happy" },
        { id: "goob2", x: 43, y: 43, age: 0, hunger: 100, mood: "happy" }
    ];
    localStorage.setItem("goobs", JSON.stringify(goobs));

    // Reset timer
    gameStartTime = Date.now();
    localStorage.setItem("gameStartTime", gameStartTime);
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(updateGameTime, 1000);

    // Redraw everything
    drawGarden();
    drawGoobs();

    // Rename the button
    document.getElementById("newGardenBtn").textContent = "Reset Garden";
});

function updateGameTime() {
    const start = parseInt(localStorage.getItem("gameStartTime"), 10);
    const elapsed = Date.now() - start;

    const hours = String(Math.floor(elapsed / 3600000)).padStart(2, '0');
    const minutes = String(Math.floor((elapsed % 3600000) / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');

    document.getElementById("gameTime").textContent = `${hours}:${minutes}:${seconds}`;
}

function drawGarden() {
    ctx.fillStyle = "#e0ffe0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#ccc";
    for (let x = 0; x <= canvas.width; x += tileSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += tileSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawGoobs() {
    const goobs = JSON.parse(localStorage.getItem("goobs")) || [];
    const goobImg = new Image();
    goobImg.src = "Goob.png";
    goobImg.onload = () => {
        goobs.forEach(goob => {
            ctx.drawImage(goobImg, goob.x * tileSize, goob.y * tileSize, tileSize * 2, tileSize * 2);
        });
    };
}

// Auto-load if game already started
window.onload = () => {
    drawGarden();

    const savedTime = localStorage.getItem("gameStartTime");
    if (savedTime) {
        gameStartTime = parseInt(savedTime, 10);
        gameInterval = setInterval(updateGameTime, 1000);
        updateGameTime();
        drawGoobs();
        document.getElementById("newGardenBtn").textContent = "Reset Garden";
    }
};
