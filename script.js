const canvas = document.getElementById('gardenCanvas');
const ctx = canvas.getContext('2d');
const cellSize = 20;
const goobImage = new Image();
goobImage.src = 'Goob.png';

const goobWaterImage = new Image();
goobWaterImage.src = 'images/goobwater.png'; // adjust path if needed

const goobModal = document.getElementById('goobModal');
const editGoobName = document.getElementById('editGoobName');
const goobAge = document.getElementById('goobAge');
const goobHunger = document.getElementById('goobHunger');
const saveGoobBtn = document.getElementById('saveGoobBtn');
editGoobName.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    saveGoobBtn.click(); // Same as clicking the "Save" button
  }
});
const closeModalBtn = document.querySelector('.close-btn');
const confirmation = document.getElementById('saveConfirmation');
const tooltip = document.getElementById('goobTooltip');
const itemImages = {}; // cache for item images

let goobData = [];
let lastAnimationTime = 0;
let selectedGoob = null;
let timerInterval;
let gameStartTime = null;
let draggingItem= null;
let draggingInventoryItem = null;   // from inventory
let draggingPlacedItem = null;      // from existing grid
let dragImage = null;               // visual cursor icon
let isDragging = false;
let wasDragging = false;
let tempDragX = null;
let tempDragY = null;
let placingRequired = false;
let initialClickTile = null;
placingRequired = localStorage.getItem('placingRequired') === 'true';
let requiredPlacement = {
  tree: 10,
  water: 10
};
let placedCounts = {
  tree: 0,
  water: 0
};


window.addEventListener("DOMContentLoaded", () => {
  const canvases = document.querySelectorAll(".goobCanvas");
  const img = new Image();
  img.src = "Goob.png";
  img.onload = () => {
    canvases.forEach(canvas => {
      const ctx = canvas.getContext("2d");
      canvas.width = 50;
      canvas.height = 50;

      const tintColor = canvas.dataset.color;
      // Draw original
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Set blending mode and overlay color
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = tintColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";
    });
  };
});

function preloadAllItemImages() {
  const types = ['tree', 'water', 'goobwater', 'redberry'];
  for (const type of types) {
    const img = new Image();
    img.src = `images/${type}.png`;
    itemImages[type] = img;
  }
}

function drawGrid() {
  const user = getCurrentUser();
  const userPlacedItems = user?.placedItems || [];

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#e0ffe0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#ccc';
  for (let i = 0; i <= canvas.width; i += cellSize) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }
  for (let j = 0; j <= canvas.height; j += cellSize) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(canvas.width, j);
    ctx.stroke();
  }

  for (const item of userPlacedItems) {
    const img = itemImages[item.type];
    if (!img || !img.complete) continue;

    let drawX = item.x;
    let drawY = item.y;

    // 👇 Override position if currently dragging this item
    if (item === draggingPlacedItem && tempDragX !== null && tempDragY !== null) {
      drawX = tempDragX;
      drawY = tempDragY;
    }

    ctx.drawImage(img, drawX * cellSize, drawY * cellSize, cellSize * 2, cellSize * 2);
  }
}

function getRandomDirection() {
  const directions = [
    { dx: 0, dy: -1 }, // up
    { dx: 0, dy: 1 },  // down
    { dx: -1, dy: 0 }, // left
    { dx: 1, dy: 0 }   // right
  ];
  return directions[Math.floor(Math.random() * directions.length)];
}

function isGoobInWater(goob) {
  const user = getCurrentUser();
  const placedItems = user?.placedItems || [];

  for (const item of placedItems) {
    if (item.type !== 'water') continue;

    for (let gx = 0; gx < 2; gx++) {
      for (let gy = 0; gy < 2; gy++) {
        for (let wx = 0; wx < 2; wx++) {
          for (let wy = 0; wy < 2; wy++) {
            if (
              goob.position.x + gx === item.x + wx &&
              goob.position.y + gy === item.y + wy
            ) {
              return true;
            }
          }
        }
      }
    }
  }

  return false;
}

function updateGoobWaterStatus() {
  for (let goob of goobData) {
    goob.isInWater = isGoobInWater(goob);
  }
}

function isTileOccupied(x, y, { checkGoobs = true, checkItems = true, exclude = null } = {}) {
  const newItemTiles = [
    [x, y],
    [x + 1, y],
    [x, y + 1],
    [x + 1, y + 1],
  ];

  const user = getCurrentUser(); // ✅ Always fresh
  const itemsToCheck = user?.placedItems || [];

  if (checkItems) {
    for (const item of itemsToCheck) {
      if (exclude && item === exclude) continue;

      const itemTiles = [
        [item.x, item.y],
        [item.x + 1, item.y],
        [item.x, item.y + 1],
        [item.x + 1, item.y + 1],
      ];

      for (const [tx, ty] of newItemTiles) {
        for (const [ix, iy] of itemTiles) {
          if (tx === ix && ty === iy) return true;
        }
      }
    }
  }

  if (checkGoobs) {
    for (const goob of goobData) {
      const goobTiles = [
        [goob.position.x, goob.position.y],
        [goob.position.x + 1, goob.position.y],
        [goob.position.x, goob.position.y + 1],
        [goob.position.x + 1, goob.position.y + 1],
      ];
      for (const [tx, ty] of newItemTiles) {
        for (const [gx, gy] of goobTiles) {
          if (tx === gx && ty === gy) return true;
        }
      }
    }
  }

  return false;
}
function canMove(goob, dx, dy, allGoobs) {
  const newX = goob.position.x + dx;
  const newY = goob.position.y + dy;

  // Stay within grid bounds (check all 2x2 tiles)
  if (
    newX < 0 || newY < 0 ||
    newX + 1 >= canvas.width / cellSize ||
    newY + 1 >= canvas.height / cellSize
  ) {
    return false;
  }

  // Get blocked tiles from placed items like trees
  const blockedTiles = getBlockedTilesFromPlacedItems();

  // Check if any of the 2x2 tiles the Goob would occupy are blocked
  for (let gx = 0; gx < 2; gx++) {
    for (let gy = 0; gy < 2; gy++) {
      const tileKey = `${newX + gx},${newY + gy}`;
      if (blockedTiles.has(tileKey)) {
        return false; // tree or other blocker
      }
    }
  }

  // Check for collisions with other Goobs
  for (let other of allGoobs) {
    if (other === goob) continue;
    for (let ox = 0; ox < 2; ox++) {
      for (let oy = 0; oy < 2; oy++) {
        for (let gx = 0; gx < 2; gx++) {
          for (let gy = 0; gy < 2; gy++) {
            if (newX + gx === other.position.x + ox && newY + gy === other.position.y + oy) {
              return false;
            }
          }
        }
      }
    }
  }

  return true;
}

function moveGoobsRandomly() {
  if (placingRequired) return; // ⛔ Stop movement until setup is done

  for (let goob of goobData) {
    const { dx, dy } = getRandomDirection();
    if (canMove(goob, dx, dy, goobData)) {
      goob.startPosition = { ...goob.position };
      goob.targetPosition = {
        x: goob.position.x + dx,
        y: goob.position.y + dy
      };
      goob.startTime = performance.now();
    }
  }

  saveGoobsToLocalStorage();
}

function drawGoobs(timestamp) {
   updateGoobWaterStatus();
  for (let goob of goobData) {
    let { x, y } = goob.position;

    if (goob.targetPosition && goob.startTime !== undefined) {
      const progress = Math.min((timestamp - goob.startTime) / 500, 1); // 500ms animation
      x = goob.startPosition.x + (goob.targetPosition.x - goob.startPosition.x) * progress;
      y = goob.startPosition.y + (goob.targetPosition.y - goob.startPosition.y) * progress;

      if (progress >= 1) {
        goob.position = { ...goob.targetPosition };
        delete goob.startPosition;
        delete goob.targetPosition;
        delete goob.startTime;
      }
    }

     const image = goob.isInWater ? goobWaterImage : goobImage;

ctx.drawImage(
  image,
  x * cellSize,
  y * cellSize,
  cellSize * 2,
  cellSize * 2
);
  }
}

function updateGameTimeDisplay() {
  if (!gameStartTime) return;
  updateGoobHungerByGameTime();
  const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
  const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');
  document.getElementById('gameTime').textContent = `${hours}:${minutes}:${seconds}`;
}

function startGameTimer() {
  if (placingRequired) return; // ⛔ Don't start timer if user hasn't placed required items

  gameStartTime = Date.now();
  localStorage.setItem('goobStartTime', gameStartTime);
  clearInterval(timerInterval);
  timerInterval = setInterval(updateGameTimeDisplay, 1000);
}

function loadGameTimer() {
  const savedTime = localStorage.getItem('goobStartTime');
  if (savedTime) {
    gameStartTime = parseInt(savedTime);
    timerInterval = setInterval(updateGameTimeDisplay, 1000);
  }
}


function getOrCreateUser() {
  const userJson = localStorage.getItem('currentUser');
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      // Ensure user has required properties
      if (!Array.isArray(user.goobs)) user.goobs = [];
      if (typeof user.inventory !== 'object' || user.inventory === null) user.inventory = {};
      if (!Array.isArray(user.placedItems)) user.placedItems = [];
      if (!user.gardenCreated) user.gardenCreated = Date.now();
      if (!Array.isArray(user.achievements)) user.achievements = [];
      return user;
    } catch (e) {
      console.warn("Error parsing user from localStorage, creating new user.");
    }
  }

  // If no user found or parsing error, create new
  const newUser = {
  username: 'player',
  goobs: [],
  inventory: {
    tree: 10,
    water: 10,
    redberry: 10
  },
  placedItems: [],
  gardenCreated: Date.now(),
  achievements: []
};
  setCurrentUser(newUser);
  return newUser;
}


function saveGoobsToLocalStorage() {
  const user = getOrCreateUser();
  if (!user) return;

  user.goobs = goobData;
  setCurrentUser(user);
}

function createInitialGoobs() {
  const now = Date.now();

  const initialGoobs = [
    {
      name: "Goob1",
      position: { x: 5, y: 5 },
      hunger: 24,
      lastHungerUpdateTime: gameStartTime,
      createdAt: now
    },
    {
      name: "Goob2",
      position: { x: 43, y: 43 },
      hunger: 24,
      lastHungerUpdate: gameStartTime,
      createdAt: now
    }
  ];

  goobData = initialGoobs;

  const user = getCurrentUser();
  if (user) {
    user.goobs = initialGoobs;
    setCurrentUser(user);
  }
}


function newGarden() {
  if (!confirm("Are you sure you want to start a new Goob Garden?")) return;

  // Default username (will be editable later)
  const defaultUsername = 'Player';

  // Set current user (new or overwrite existing one)
  localStorage.setItem('currentUser', defaultUsername);

  // Create fresh user object
  const user = {
    username: defaultUsername,
    goobs: [],
    inventory: {
      tree: 10,
      water: 10,
      redberry: 10
    },
    gardenCreated: Date.now(),
    achievements: [],
    placedItems: [],
    placingRequired: true,
    placedCounts: { tree: 0, water: 0 }
  };

  // Save only this user (no duplicate allUsers logic)
  localStorage.setItem('currentUser', JSON.stringify(user));

  // Update runtime state
  placedItems = [];
  placedCounts = { tree: 0, water: 0 };
  placingRequired = true;

  // Create starter goobs
  createInitialGoobs();

  // Draw visuals
  drawGrid();
  if (goobImage.complete) {
    drawGoobs();
  } else {
    goobImage.onload = () => drawGoobs();
  }

  // Reset timer and UI
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  gameStartTime = null;
  localStorage.removeItem('goobStartTime');
  document.getElementById('gameTime').textContent = '00:00:00';

  // Update modal
  editGoobName.value = user.username || '';
  goobAge.textContent = '-';
  if (goobHunger) goobHunger.textContent = '-';
  selectedGoob = null;

  openUserModal();
  updateInventoryDisplay();
  updateUserGreeting();
  document.getElementById('newGardenBtn').textContent = 'Reset Garden';
}


function getCurrentUser() {
  const userJson = localStorage.getItem('currentUser');
  if (!userJson) return null;
  const user = JSON.parse(userJson);

  // Ensure placedItems is an array to avoid errors
  if (!Array.isArray(user.placedItems)) {
    user.placedItems = [];
  }
  if (!Array.isArray(user.goobs)) {
    user.goobs = [];
  }
  if (typeof user.inventory !== 'object' || user.inventory === null) {
    user.inventory = {};
  }

  return user;
}

function setCurrentUser(user) {
  if (!user || typeof user !== 'object') {
    console.warn("Invalid user object passed to setCurrentUser.");
    return;
  }
  localStorage.setItem('currentUser', JSON.stringify(user));
}

function restoreStateFromLocalStorage() {
  const user = getCurrentUser();
  if (user) {
    goobData = user.goobs || [];
    placedItems = user.placedItems || [];

    // Set default properties on goobs
    for (let goob of goobData) {
      goob.position = goob.position || { x: 0, y: 0 };
      delete goob.startPosition;
      delete goob.targetPosition;
      delete goob.startTime;
    }

    // ✅ Preload all placed item images before drawing
    const typesToLoad = [...new Set(placedItems.map(item => item.type))];
    let loadedCount = 0;

    // 🌟 Restore placement banner visibility
const banner = document.getElementById('placementBanner');
const shouldShowBanner = localStorage.getItem('showPlacementBanner') === 'true';
if (shouldShowBanner) {
  banner.classList.remove('hidden');
} else {
  banner.classList.add('hidden');
}

  
          for (const type of typesToLoad) {
          preloadAllItemImages(type);
  }
          drawGrid();
          drawGoobs();
  }

  loadGameTimer();
  updateGameTimeDisplay();
  updateInventoryDisplay();
  setupInventoryDraggables();
  updateUserGreeting();
  checkItemPlacementProgress();
}

goobImage.onload = () => {
  drawGrid();
  restoreStateFromLocalStorage();
  updateUserGreeting();

  const user = getCurrentUser();
  const button = document.getElementById('newGardenBtn');
  button.textContent = user && user.goobs && user.goobs.length > 0 ? 'Reset Garden' : 'New Garden';

  requestAnimationFrame(animateGarden);
};

document.getElementById('newGardenBtn').addEventListener('click', newGarden);

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const gridX = Math.floor((e.clientX - rect.left) / cellSize);
  const gridY = Math.floor((e.clientY - rect.top) / cellSize);

  for (const goob of goobData) {
    const { x, y } = goob.position;
    if (gridX >= x && gridX < x + 2 && gridY >= y && gridY < y + 2) {
      const ageMs = Date.now() - goob.createdAt;
      const ageMin = Math.floor(ageMs / 60000);
      const days = Math.floor(ageMin / 1440);
      const hours = Math.floor((ageMin % 1440) / 60);
      const minutes = ageMin % 60;

      tooltip.style.display = 'block';
      tooltip.style.left = `${e.pageX + 10}px`;
      tooltip.style.top = `${e.pageY + 10}px`;
      tooltip.innerHTML = `
        <strong>${goob.name}</strong><br>
        Age: ${days}d ${hours}h ${minutes}m<br>
        Tummy: ${goob.hunger}/24
      `;
      return;
    }
  }
  tooltip.style.display = 'none';
});

canvas.addEventListener('mouseleave', () => {
  tooltip.style.display = 'none';
});

canvas.addEventListener('click', (e) => {
  if (wasDragging) {
    wasDragging = false;
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const clickX = Math.floor((e.clientX - rect.left) / cellSize);
  const clickY = Math.floor((e.clientY - rect.top) / cellSize);

  // Make sure initialClickTile is within the same 2x2 goob region as final click
  const same2x2Region = (goob) => {
    return initialClickTile &&
      initialClickTile.x >= goob.position.x &&
      initialClickTile.x < goob.position.x + 2 &&
      initialClickTile.y >= goob.position.y &&
      initialClickTile.y < goob.position.y + 2 &&
      clickX >= goob.position.x &&
      clickX < goob.position.x + 2 &&
      clickY >= goob.position.y &&
      clickY < goob.position.y + 2;
  };

  for (const goob of goobData) {
    if (same2x2Region(goob)) {
      selectedGoob = goob;
      editGoobName.value = goob.name;

      const ageMs = Date.now() - goob.createdAt;
      const ageMin = Math.floor(ageMs / 60000);
      const days = Math.floor(ageMin / 1440);
      const hours = Math.floor((ageMin % 1440) / 60);
      const minutes = ageMin % 60;

      goobAge.textContent = `${days}d ${hours}h ${minutes}m`;
      const hungerBar = document.getElementById("hungerBar");
      hungerBar.value = goob.hunger;
      document.getElementById("hungerText").textContent = `${goob.hunger}/24`;

      goobModal.style.display = 'block';
      break;
    }
  }

  initialClickTile = null;
});

closeModalBtn.addEventListener('click', () => {
  goobModal.style.display = 'none';
});

saveGoobBtn.addEventListener('click', () => {
  if (selectedGoob) {
    selectedGoob.name = editGoobName.value;
  } else {
    const user = getOrCreateUser();
    user.username = editGoobName.value;
    setCurrentUser(user);
  }

  saveGoobsToLocalStorage();
  goobModal.style.display = 'none';
  showConfirmation("Saved!");
});


function showConfirmation(message) {
  confirmation.textContent = message;
  confirmation.classList.add('show');

  setTimeout(() => {
    confirmation.classList.remove('show');
  }, 2000);
}

function animateGarden(timestamp) {
  if (!lastAnimationTime || timestamp - lastAnimationTime > 16) {
    drawGrid();
    drawGoobs(timestamp);
    lastAnimationTime = timestamp;
  }
  requestAnimationFrame(animateGarden);
}

function openUserModal() {
  const user = getCurrentUser();
  if (!user) return;

  // Pre-fill the name input
  const nameInput = document.getElementById('userModalName');
  nameInput.value = user.username || '';

  // Show age
  const gardenAgeMs = Date.now() - (user.gardenCreated || Date.now());
const ageMin = Math.floor(gardenAgeMs / 60000);
const days = Math.floor(ageMin / 1440);
const hours = Math.floor((ageMin % 1440) / 60);
const minutes = ageMin % 60;
document.getElementById('userAgeDisplay').textContent = `${days}d ${hours}h ${minutes}m`;


  // Show achievements
  const list = document.getElementById('userAchievementsList');
  list.innerHTML = '';
  if (user.achievements && user.achievements.length > 0) {
    user.achievements.forEach(ach => {
      const li = document.createElement('li');
      li.textContent = ach;
      list.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'None yet!';
    list.appendChild(li);
  }

  // Open the modal
  document.getElementById('userModal').style.display = 'block';
}

function closeUserModal() {
  document.getElementById('userModal').style.display = 'none';
  checkItemPlacementProgress(); // 🔔 Show warning after user closes modal
}

document.getElementById('openUserInfoBtn').addEventListener('click', () => {
  openUserModal();
});

function saveNewUsername() {
  const newName = document.getElementById('userModalName').value.trim();
  if (!newName) return;

  const user = getCurrentUser();
  if (!user) {
    console.error("No current user found.");
    return;
  }

  // Update and resave the user
  user.username = newName;
  localStorage.setItem('currentUser', JSON.stringify(user));

  updateUserGreeting();
  updateInventoryDisplay(); // optional, if sidebar includes username
  closeUserModal();
}

function updateUserGreeting() {
  const user = getCurrentUser();
  const greeting = document.getElementById('userGreeting');
  if (user && user.username) {
    greeting.textContent = `${user.username}'s Garden`;
  } else {
    greeting.textContent = `Your Garden`;
  }
}

function updateGoobHungerByGameTime() {
  const now = Date.now();

  for (const goob of goobData) {
    if (!goob.lastHungerUpdateTime) {
      goob.lastHungerUpdateTime = gameStartTime;
    }

    const elapsedMs = now - goob.lastHungerUpdateTime;
    const hoursPassed = Math.floor(elapsedMs / (60 * 60 * 1000)); // every hour

    if (hoursPassed >= 1) {
      goob.hunger = Math.max(0, goob.hunger - hoursPassed);
      goob.lastHungerUpdateTime += hoursPassed * 60 * 60 * 1000; // move update marker
    }
  }
}

function updateInventoryDisplay() {
  const inventory = getInventory();
  const grid = document.getElementById('inventoryGrid');
  grid.innerHTML = ''; // Clear existing

  if (!inventory) {
    console.warn("No inventory found.");
    return;
  }

  Object.entries(inventory).forEach(([item, count]) => {
    if (count > 0) {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'inventory-item';

      const img = document.createElement('img');
      img.src = `images/${(item)}.png`;
      img.alt = item;

      const label = document.createElement('span');
      label.textContent = `x${count}`;

      itemDiv.appendChild(img);
      itemDiv.appendChild(label);
      grid.appendChild(itemDiv);

      // Tooltip logic using itemDirectory
      const tooltip = document.getElementById('itemTooltip');
      const itemData = itemDirectory[item];

      if (itemData) {
        itemDiv.addEventListener('mouseenter', () => {
          tooltip.innerHTML = `
            <strong>${itemData.name}</strong><br>
            ${itemData.description}<br>
            <em>x${count}</em>
          `;
          tooltip.style.display = 'block';
        });

        itemDiv.addEventListener('mousemove', (e) => {
          const rect = tooltip.getBoundingClientRect();
          let left = e.pageX - rect.width - 10;

          // Fallback to right side if offscreen
          if (left < 0) left = e.pageX + 10;

          tooltip.style.left = `${left}px`;
          tooltip.style.top = `${e.pageY + 10}px`;
        });

        itemDiv.addEventListener('mouseleave', () => {
          tooltip.style.display = 'none';
        });
      }
    }
  });

  setupInventoryDraggables();
}

function checkItemPlacementProgress() {
  const placedItems = getPlacedItems(); // Use your helper that returns the current placedItems array

  const treesPlaced = placedItems.filter(i => i.type === 'tree').length;
  const waterPlaced = placedItems.filter(i => i.type === 'water').length;

  const banner = document.getElementById('placementBanner');

  const userExists = localStorage.getItem('currentUser');

if (userExists) {
  if (treesPlaced < 10 || waterPlaced < 10) {
    // Requirements NOT met
    banner.classList.remove('hidden');
    localStorage.setItem('showPlacementBanner', 'true');

    placingRequired = true;
    localStorage.setItem('placingRequired', 'true');

    window.goobMovementEnabled = false; // Stop goob movement
  } else {
    // Requirements met
    banner.classList.add('hidden');
    localStorage.setItem('showPlacementBanner', 'false');

    if (placingRequired) {
      placingRequired = false;
      localStorage.setItem('placingRequired', 'false');
      startGameTimer();
      window.goobMovementEnabled = true; // Enable goob movement
      showConfirmation("Garden complete! Goobs are now active.");
      }
    }
  }
}

function setupInventoryDraggables() {
  const grid = document.getElementById('inventoryGrid');
  const images = grid.querySelectorAll('.inventory-item img');

  images.forEach(img => {
    img.addEventListener('mousedown', (e) => {
      e.preventDefault();
      draggingInventoryItem = img.alt.toLowerCase(); // ✅ Normalize here
      isDragging = false;
      dragOffsetX = e.offsetX;
      dragOffsetY = e.offsetY;
    });
  });
}

function cleanupDragging() {
  if (dragImage && dragImage.parentNode) {
    dragImage.parentNode.removeChild(dragImage);
  }
  dragImage = null;

  draggingInventoryItem = null;
  draggingPlacedItem = null;
  isDragging = false;
  wasDragging = false;

  dragOffsetX = 0;
  dragOffsetY = 0;

  document.body.classList.remove('dragging-any');
  canvas.classList.remove('grabbing');
  canvas.classList.remove('grab');
}

function moveDragImage(x, y) {
  if (!dragImage) {
    dragImage = document.createElement("img");
    const type = draggingInventoryItem || draggingPlacedItem?.type;
    dragImage.src = `images/${type}.png`;
    dragImage.classList.add("dragging-image");
    dragImage.style.position = "fixed";
    dragImage.style.pointerEvents = "none";
    dragImage.style.width = "40px";
    dragImage.style.height = "40px";
    document.body.appendChild(dragImage);
  }

  dragImage.style.left = `${x - 10}px`;
  dragImage.style.top = `${y - 10}px`;
}


function placeItemOnGrid(type, x, y) {
  const user = getCurrentUser();
  const placedItems = user?.placedItems || [];
  const inventory = user.inventory || {};
  if (!inventory[type] || inventory[type] <= 0) return;

  const gridCols = Math.floor(canvas.width / cellSize);
  const gridRows = Math.floor(canvas.height / cellSize);

  if (x < 0 || y < 0 || x + 1 >= gridCols || y + 1 >= gridRows) {
    showConfirmation("Too close to edge!");
    return;
  }

  // 🍓 SPECIAL CASE: Feed a RedBerry to a goob
  if (type === 'redberry') {
    const goob = goobData.find(g =>
      x >= g.position.x &&
      x < g.position.x + 2 &&
      y >= g.position.y &&
      y < g.position.y + 2
    );

    if (goob) {
      goob.hunger = Math.min(24, goob.hunger + 8);
      inventory[type]--;
      user.inventory = inventory;
      setCurrentUser(user);
      updateInventoryDisplay();
      drawGoobs();
      showConfirmation(`${goob.name} ate a berry!`);
    } else {
      showConfirmation("No goob here to feed!");
    }

    return; // ✅ Skip placement logic
  }

  // 🌳 TREE
  if (type === 'tree') {
    if (isTileOccupied(x, y, { checkGoobs: true, checkItems: true })) {
      showConfirmation("Can't place a tree here!");
      return;
    }
  }

  // 💧 WATER
  if (type === 'water') {
    if (isTileOccupied(x, y, { checkGoobs: false, checkItems: true })) {
      showConfirmation("Can't place water here!");
      return;
    }
  }

  // ✅ Place regular item
  inventory[type]--;
  user.inventory = inventory;
  placedItems.push({ type: type.toLowerCase(), x, y });
  user.placedItems = placedItems;

  setCurrentUser(user);
  updateInventoryDisplay();
  drawGrid();
  drawGoobs();

  checkItemPlacementProgress(); // Banner + game state
}

canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const tileX = Math.floor(mouseX / cellSize);
  const tileY = Math.floor(mouseY / cellSize);

  initialClickTile = { x: tileX, y: tileY }; // Track the tile the click began on

  const user = getCurrentUser();
  const placedItems = user?.placedItems || [];

  const item = placedItems.find(obj =>
    tileX >= obj.x &&
    tileX < obj.x + 2 &&
    tileY >= obj.y &&
    tileY < obj.y + 2
  );

  if (item) {
    draggingPlacedItem = item;
    draggingItem = item;
    isDragging = false;

    dragOffsetX = mouseX - item.x * cellSize;
    dragOffsetY = mouseY - item.y * cellSize;

    e.preventDefault();
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!draggingItem) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const tileOffsetX = dragOffsetX / cellSize;
  const tileOffsetY = dragOffsetY / cellSize;

  tempDragX = Math.floor(mouseX / cellSize - tileOffsetX);
  tempDragY = Math.floor(mouseY / cellSize - tileOffsetY);
});

document.addEventListener('mousemove', (e) => {
  if ((draggingInventoryItem || draggingPlacedItem) && !dragImage && !isDragging) {
    isDragging = true;
    wasDragging = true; // ✅ Set this HERE as soon as dragging begins
    document.body.classList.add('dragging-any');

    const itemType = draggingInventoryItem || draggingPlacedItem.type;
    dragImage = document.createElement('img');
    dragImage.src = `images/${(itemType)}.png`;
    dragImage.style.position = 'absolute';
    dragImage.style.width = '40px';
    dragImage.style.height = '40px';
    dragImage.style.pointerEvents = 'none';
    dragImage.style.zIndex = '1000';
    document.body.appendChild(dragImage);
  }

  if (dragImage) {
    dragImage.style.left = (e.pageX - 20) + 'px';
    dragImage.style.top = (e.pageY - 20) + 'px';
  }
});

document.addEventListener('mouseup', (e) => {
  const rect = canvas.getBoundingClientRect();
  const isInsideCanvas =
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom;

  if ((draggingInventoryItem || draggingPlacedItem) && isInsideCanvas) {
    const itemType = draggingInventoryItem || draggingPlacedItem?.type;

    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;
    const intersectionX = Math.round(cursorX / cellSize);
    const intersectionY = Math.round(cursorY / cellSize);
    const tileX = intersectionX - 1;
    const tileY = intersectionY - 1;

    if (draggingInventoryItem) {
      placeItemOnGrid(itemType, tileX, tileY);
    } else if (draggingPlacedItem) {
      movePlacedItem(draggingPlacedItem, tileX, tileY);
      tempDragX = null;
      tempDragY = null;
    }

    cleanupDragging();
  }

  if (!isInsideCanvas) {
    cleanupDragging();
  }
});

document.getElementById('autoPlaceBtn').addEventListener('click', () => {
  const itemSize = 2;
  const gridCols = canvas.width / cellSize;
  const gridRows = canvas.height / cellSize;

  const occupied = new Set();

  // Mark Goob positions as occupied
  for (let goob of goobData) {
    for (let dx = 0; dx < itemSize; dx++) {
      for (let dy = 0; dy < itemSize; dy++) {
        occupied.add(`${goob.position.x + dx},${goob.position.y + dy}`);
      }
    }
  }

  function findValidPosition() {
    let attempts = 0;
    while (attempts < 1000) {
      const x = Math.floor(Math.random() * (gridCols - itemSize + 1));
      const y = Math.floor(Math.random() * (gridRows - itemSize + 1));
      let fits = true;

      for (let dx = 0; dx < itemSize; dx++) {
        for (let dy = 0; dy < itemSize; dy++) {
          if (occupied.has(`${x + dx},${y + dy}`)) {
            fits = false;
            break;
          }
        }
        if (!fits) break;
      }

      if (fits) {
        for (let dx = 0; dx < itemSize; dx++) {
          for (let dy = 0; dy < itemSize; dy++) {
            occupied.add(`${x + dx},${y + dy}`);
          }
        }
        return { x, y };
      }

      attempts++;
    }

    console.warn("No valid position found after 1000 attempts");
    return null;
  }

  // Get user and inventory counts
  const user = getCurrentUser();
const inventory = user?.inventory || {};
const availableTrees = inventory.tree || 0;
const availableWaters = inventory.water || 0;
placedItems = user.placedItems || [];

  const treesToPlace = Math.min(10, availableTrees);
  const watersToPlace = Math.min(10, availableWaters);

  let treesPlaced = 0;
  let watersPlaced = 0;

  // Place trees
  for (let i = 0; i < treesToPlace; i++) {
    const pos = findValidPosition();
    if (pos) {
      placedItems.push({ type: 'tree', x: pos.x, y: pos.y });
      treesPlaced++;
    }
  }

  // Place waters
  for (let i = 0; i < watersToPlace; i++) {
    const pos = findValidPosition();
    if (pos) {
      placedItems.push({ type: 'water', x: pos.x, y: pos.y });
      watersPlaced++;
    }
  }

  // Update placed counts
  placedCounts.tree += treesPlaced;
  placedCounts.water += watersPlaced;

  // Deduct from inventory (set to 0 only what was used)
  if (inventory.tree !== undefined) inventory.tree = Math.max(0, inventory.tree - treesPlaced);
  if (inventory.water !== undefined) inventory.water = Math.max(0, inventory.water - watersPlaced);

  // Save and update display
  user.placedItems = placedItems;
  setCurrentUser(user);
  updateInventoryDisplay();

  drawGrid();
  drawGoobs();
  checkItemPlacementProgress();
});

window.onload = function () {
  preloadAllItemImages();
  restoreStateFromLocalStorage();
  drawGrid();
  drawGoobs(performance.now());
};

function movePlacedItem(item, newX, newY) {
  const user = getCurrentUser();
  const placedItems = user?.placedItems || [];

  const gridCols = Math.floor(canvas.width / cellSize);
  const gridRows = Math.floor(canvas.height / cellSize);

  // Prevent edge placement
  if (newX < 0 || newY < 0 || newX + 1 >= gridCols || newY + 1 >= gridRows) {
    if (wasDragging) showConfirmation("Too close to edge!");
    return;
  }

  const checkGoobs = item.type !== 'water';
  const checkItems = true;

  if (isTileOccupied(newX, newY, { checkGoobs, checkItems, exclude: item })) {
    if (wasDragging) showConfirmation("Can't move item here!");
    return;
  }

  // ✅ Actually move the item
  item.x = newX;
  item.y = newY;

  setCurrentUser(user);
  drawGrid();
  drawGoobs();
}

function getBlockedTilesFromPlacedItems() {
  const user = getCurrentUser(); // ✅ Always fetch fresh user data
  const blocked = new Set();

  for (const item of user?.placedItems || []) {
    if (item.type === 'tree') {
      blocked.add(`${item.x},${item.y}`);
      blocked.add(`${item.x + 1},${item.y}`);
      blocked.add(`${item.x},${item.y + 1}`);
      blocked.add(`${item.x + 1},${item.y + 1}`);
    }
  }

  return blocked;
}




setInterval(moveGoobsRandomly, 1000); // every 10 seconds

