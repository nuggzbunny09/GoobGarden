const canvas = document.getElementById('gardenCanvas');
const ctx = canvas.getContext('2d');
const cellSize = 20;
const goobImage = new Image();
goobImage.src = 'Goob.png';

const goobWaterImage = new Image();
goobWaterImage.src = 'images/GoobWater.png'; // adjust path if needed

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
let placedItems = [];
let draggingItem= null;
let draggingInventoryItem = null;   // from inventory
let draggingPlacedItem = null;      // from existing grid
let dragImage = null;               // visual cursor icon
let isDragging = false;
let wasDragging = false;
let placingRequired = false;
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

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function preloadItemImage(type, callback) {
  if (itemImages[type]) {
    if (itemImages[type].complete) {
      callback();
    } else {
      itemImages[type].addEventListener('load', callback);
    }
  } else {
    const img = new Image();
    img.src = `images/${capitalize(type)}.png`;
    img.addEventListener('load', callback);
    itemImages[type] = img;
  }
}

function drawGrid() {
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

  // ✅ Draw placed items only here
  for (const item of placedItems) {
    const img = itemImages[item.type];
    if (img && img.complete) {
      ctx.drawImage(
        img,
        item.x * cellSize,
        item.y * cellSize,
        cellSize * 2,
        cellSize * 2
      );
    }
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

  if (checkItems) {
    for (const item of placedItems) {
      if (exclude && item === exclude) continue; // Skip the current item if excluded

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
  const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
  const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');
  document.getElementById('gameTime').textContent = `${hours}:${minutes}:${seconds}`;
}

function startGameTimer() {
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
  let user = getCurrentUser();
  if (!user) {
    user = {
      username: 'Player',
      goobs: [],
      inventory: {},
      gardenCreated: Date.now()
    };
    setCurrentUser(user);
  }
  return user;
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
      createdAt: now
    },
    {
      name: "Goob2",
      position: { x: 43, y: 43 },
      hunger: 24,
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

  let user = getCurrentUser();
  const isNewUser = !user;

  if (!user) {
    user = {
      username: '',
      goobs: [],
      inventory: {},
      gardenCreated: Date.now(),
      achievements: [],
      placedItems: []
    };
  }

  // Reset garden
  user.goobs = [];
  user.gardenCreated = Date.now();
  user.placedItems = [];

  // 👇 Give starting items
  user.inventory = {
    tree: 10,
    water: 10,
    redBerry: 10
  };

  // Save updated user to localStorage
  setCurrentUser(user);
  placedItems = [];

  // ⛔ Disable goob movement until required items are placed
  placingRequired = true;
  placedCounts = { tree: 0, water: 0 };

  // ✅ Create starter Goobs (but don't start moving them yet!)
  createInitialGoobs();

  // Redraw game world
  drawGrid();

  if (goobImage.complete) {
    drawGoobs();
  } else {
    goobImage.onload = () => {
      drawGoobs();
    };
  }

  document.getElementById('newGardenBtn').textContent = 'Reset Garden';

  // Reset and show user info
  editGoobName.value = user.username || '';
  goobAge.textContent = '-';
  if (goobHunger) goobHunger.textContent = '-';
  selectedGoob = null;

  // 📌 Ensure user modal opens immediately
  openUserModal();

  updateInventoryDisplay();
  updateUserGreeting();
}

function getCurrentUser() {
  const userJSON = localStorage.getItem('currentUser');
  if (!userJSON) return null;
  try {
    const user = JSON.parse(userJSON);
    // Basic validation to ensure it's an object
    if (user && typeof user === 'object') return user;
    return null;
  } catch {
    return null;
  }
}


function setCurrentUser(user) {
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

    for (const type of typesToLoad) {
      preloadItemImage(type, () => {
        loadedCount++;
        if (loadedCount === typesToLoad.length) {
          // Only draw once ALL images are ready
          drawGrid();
          drawGoobs();
        }
      });
    }
  }

  loadGameTimer();
  updateGameTimeDisplay();
  updateInventoryDisplay();
  setupInventoryDraggables();
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
    wasDragging = false; // Reset it
    return; // Skip click behavior
  }

  const rect = canvas.getBoundingClientRect();
  const gridX = Math.floor((e.clientX - rect.left) / cellSize);
  const gridY = Math.floor((e.clientY - rect.top) / cellSize);

  for (const goob of goobData) {
    const { x, y } = goob.position;
    if (gridX >= x && gridX < x + 2 && gridY >= y && gridY < y + 2) {
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
      return;
    }
  }
});

closeModalBtn.addEventListener('click', () => {
  goobModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === goobModal) {
    goobModal.style.display = 'none';
  }
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
}

function saveNewUsername() {
  const newName = document.getElementById('userModalName').value.trim();
  if (!newName) return;

  const user = getCurrentUser();
  user.username = newName;
  setCurrentUser(user);


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

function updateInventoryDisplay() {
  const user = getCurrentUser();
  const grid = document.getElementById('inventoryGrid');
  grid.innerHTML = ''; // Clear existing

  if (!user || !user.inventory) {
    console.warn("No user or user inventory found.");
    return;
  }

  Object.entries(user.inventory).forEach(([item, count]) => {
    if (count > 0) {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'inventory-item';

      const img = document.createElement('img');
      img.src = `images/${capitalize(item)}.png`;
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

function setupInventoryDraggables() {
  const grid = document.getElementById('inventoryGrid');
  const images = grid.querySelectorAll('.inventory-item img');

  images.forEach(img => {
    img.addEventListener('mousedown', (e) => {
      e.preventDefault();
      draggingInventoryItem = img.alt;
      isDragging = false;
      dragOffsetX = e.offsetX;
  dragOffsetY = e.offsetY;
    });
  });
}

function cleanupDragging() {
  if (dragImage) {
    document.body.removeChild(dragImage);
    dragImage = null;
  }
  draggingInventoryItem = null;
  draggingPlacedItem = null;
  isDragging = false;

   document.body.classList.remove('dragging-any');
  canvas.classList.remove('grabbing');
  canvas.classList.remove('grab');
}

function moveDragImage(x, y) {
  if (dragImage) {
    dragImage.style.left = `${x - 10}px`;
    dragImage.style.top = `${y - 10}px`;
  }
}

function placeItemOnGrid(type, x, y) {
  preloadItemImage(type, () => {
    const user = getCurrentUser();
    if (!user || !user.inventory[type] || user.inventory[type] <= 0) return;

    const gridCols = Math.floor(canvas.width / cellSize);
    const gridRows = Math.floor(canvas.height / cellSize);
    
    if (x < 0 || y < 0 || x + 1 >= gridCols || y + 1 >= gridRows) {
      showConfirmation("Too close to edge!");
      return;
    }

    if (type === 'tree') {
      if (isTileOccupied(x, y, { checkGoobs: true, checkItems: true })) {
        showConfirmation("Can't place a tree here!");
        return;
      }
    } else if (type === 'water') {
      if (isTileOccupied(x, y, { checkGoobs: false, checkItems: true })) {
        showConfirmation("Can't place water here!");
        return;
      }
    }

    // Deduct item
    user.inventory[type]--;
    setCurrentUser(user);
    updateInventoryDisplay();

    // Place item visually
    placedItems.push({ type, x, y });
    savePlacedItems();
    drawGrid();
    drawGoobs();

    // ✅ Step 3: Track placed counts and check readiness
    if (placingRequired && (type === 'tree' || type === 'water')) {
      placedCounts[type]++;

      if (placedCounts.tree >= 10 && placedCounts.water >= 10) {
        placingRequired = false;
        startGameTimer(); // Start goobs only after both conditions met
        showConfirmation("Garden complete! Goobs are now active.");
      }
    }
  });
}

function savePlacedItems() {
  const user = getCurrentUser();
  if (user) {
    user.placedItems = placedItems;
    setCurrentUser(user);
  }
}

function loadPlacedItems() {
  const user = getCurrentUser();
  if (user && Array.isArray(user.placedItems)) {
    placedItems = user.placedItems;
  }
}

canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const tileX = Math.floor(mouseX / cellSize);
  const tileY = Math.floor(mouseY / cellSize);

  // Find the item that includes this tile within its 2x2 area
  const item = placedItems.find(obj =>
    tileX >= obj.x &&
    tileX < obj.x + 2 &&
    tileY >= obj.y &&
    tileY < obj.y + 2
  );

  if (item) {
    draggingPlacedItem = item;
    isDragging = false;

    const rect = canvas.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left - item.x * cellSize;
    dragOffsetY = e.clientY - rect.top - item.y * cellSize;

    e.preventDefault();
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!draggingItem) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const gridX = Math.floor(mouseX / cellSize) - dragOffset.x;
  const gridY = Math.floor(mouseY / cellSize) - dragOffset.y;

  // Temporarily update the item's position
  draggingItem.x = gridX;
  draggingItem.y = gridY;

  drawGrid();
  drawGoobs();
});

document.addEventListener('mousemove', (e) => {
  if ((draggingInventoryItem || draggingPlacedItem) && !dragImage && !isDragging) {
    isDragging = true;
    document.body.classList.add('dragging-any');
    const itemType = draggingInventoryItem || draggingPlacedItem.type;

    dragImage = document.createElement('img');
    dragImage.src = `images/${capitalize(itemType)}.png`;
    dragImage.style.position = 'absolute';
    dragImage.style.width = '40px';
    dragImage.style.height = '40px';
    dragImage.style.pointerEvents = 'none';
    dragImage.style.zIndex = '1000';
    document.body.appendChild(dragImage);
  }

   if (dragImage) {
    dragImage.style.left = (e.pageX - 20) + 'px'; // 40px / 2
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
      preloadItemImage(itemType, () => {
        placeItemOnGrid(itemType, tileX, tileY);
        wasDragging = isDragging;
        cleanupDragging();
      });
    } else if (draggingPlacedItem) {
      movePlacedItem(draggingPlacedItem, tileX, tileY);
      wasDragging = isDragging;
      cleanupDragging();
    }

    // Do NOT run cleanupDragging() here anymore
  }

  if (!isInsideCanvas) {
    cleanupDragging();
  }
}); // ← 🧩 this was missing

function movePlacedItem(item, newX, newY) {
  const gridCols = Math.floor(canvas.width / cellSize);
  const gridRows = Math.floor(canvas.height / cellSize);

  // Check boundaries
  if (newX < 0 || newY < 0 || newX + 1 >= gridCols || newY + 1 >= gridRows) {
    showConfirmation("Too close to edge!");
    return;
  }

  // Determine what to check based on item type
  const checkGoobs = item.type !== 'water';
  const checkItems = true;

  // Check for overlap (excluding itself)
  if (isTileOccupied(newX, newY, {
    checkGoobs,
    checkItems,
    exclude: item
  })) {
    showConfirmation("Can't move item here!");
    return;
  }

  // Move is valid
  item.x = newX;
  item.y = newY;
  savePlacedItems();
  drawGrid();
  drawGoobs();
}

function getBlockedTilesFromPlacedItems() {
  const blocked = new Set();
  for (const item of placedItems) {
    if (item.type === 'tree') {
      // Trees take up 2x2 tiles
      blocked.add(`${item.x},${item.y}`);
      blocked.add(`${item.x + 1},${item.y}`);
      blocked.add(`${item.x},${item.y + 1}`);
      blocked.add(`${item.x + 1},${item.y + 1}`);
    }
  }
  return blocked;
}



setInterval(moveGoobsRandomly, 1000); // every 10 seconds

