const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 50;
const cellSize = canvas.width / gridSize;

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

    draw(ctx, goobImage) {
        const pixelX = this.gridX * cellSize;
        const pixelY = this.gridY * cellSize;
        ctx.drawImage(goobImage, pixelX, pixelY, cellSize * 2, cellSize * 2);
    }
}

const goobs = [];
let gameTimeInMinutes = 0;
let lastGoobMoveTime = 0;
const goobMoveIntervalMinutes = 5;

const goobImage = new Image();
goobImage.src = 'Goob.png';

goobImage.onload = () => {
    loadGameState();
    if (goobs.length === 0) {
        goobs.push(new Goob(5, 5));
        goobs.push(new Goob(43, 43));
        saveGameState();
    }
    startGameLoop();
};

function saveGameState() {
    const gameState = {
        goobs: goobs.map(g => ({ gridX: g.gridX, gridY: g.gridY, color: g.color })),
        startTimestamp: startTimestamp,
        gameTimeInMinutes: gameTimeInMinutes,
        lastGoobMoveTime: lastGoobMoveTime
    };
    localStorage.setItem('goobGardenState', JSON.stringify(gameState));
}

function loadGameState() {
    const saved = localStorage.getItem('goobGardenState');
    if (saved) {
        const data = JSON.parse(saved);
        goobs.length = 0;
        data.goobs.forEach(g => {
            const newGoob = new Goob(g.gridX, g.gr
