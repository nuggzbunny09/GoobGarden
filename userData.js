const defaultUserData = {
  username: "Player",
  goobs: [],
  inventory: {
    tree: 10,
    water: 10,
    redberry: 10
  },
  placedItems: [],
  gardenCreated: Date.now(),
  achievements: [],
  placingRequired: true,
  placedCounts: { tree: 0, water: 0 }
};

// Initialize user data if none exists
function createNewUserData() {
  if (!localStorage.getItem('currentUser')) {
    localStorage.setItem('currentUser', JSON.stringify(defaultUserData));
  }
}

// Fetch user data
function getUserData() {
  const raw = localStorage.getItem('currentUser');
  if (!raw) return null;

  const user = JSON.parse(raw);

  // Ensure all required properties are present
  if (!Array.isArray(user.goobs)) user.goobs = [];
  if (!Array.isArray(user.placedItems)) user.placedItems = [];
  if (typeof user.inventory !== 'object' || user.inventory === null) {
    user.inventory = { tree: 10, water: 10, redberry: 10 };
  }
  if (!user.placedCounts) user.placedCounts = { tree: 0, water: 0 };
  if (typeof user.placingRequired !== 'boolean') user.placingRequired = true;

  return user;
}

// Save updated user data
function saveUserData(userData) {
  localStorage.setItem('currentUser', JSON.stringify(userData));
}

// Inventory helpers
function getInventory() {
  const user = getUserData();
  return user?.inventory || {};
}

function setInventory(newInventory) {
  const user = getUserData();
  user.inventory = newInventory;
  saveUserData(user);
}

// Placed items helpers
function getPlacedItems() {
  const user = getUserData();
  return user?.placedItems || [];
}

function setPlacedItems(items) {
  const user = getUserData();
  user.placedItems = items;
  saveUserData(user);
}
