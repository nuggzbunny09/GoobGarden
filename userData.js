const defaultUserData = {
  name: "New Player",
  goobs: [],
  inventory: {
    tree: 10,
    water: 10
  },
  placedItems: [],
  gardenCreated: Date.now(),
  achievements: []
};

function createNewUserData() {
  if (!localStorage.getItem('userData')) {
    localStorage.setItem('userData', JSON.stringify(defaultUserData));
  }
}

function getUserData() {
  return JSON.parse(localStorage.getItem('userData'));
}

function saveUserData(userData) {
  localStorage.setItem('userData', JSON.stringify(userData));
}

// Add these to handle inventory and placed items:

function getInventory() {
  return getCurrentUser().inventory || {};
}

function setInventory(newInventory) {
  const userData = getCurrentUser();
  userData.inventory = newInventory;
  saveUserData(userData);
}

function getPlacedItems() {
  return getCurrentUser().placedItems || [];
}

function setPlacedItems(items) {
  const userData = getCurrentUser();
  userData.placedItems = items;
  saveUserData(userData);
}
