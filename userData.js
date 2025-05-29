// userData.js

// Get user data from localStorage or return default if none
function getUserData() {
  return JSON.parse(localStorage.getItem('userData') || JSON.stringify({
    inventory: [],
    achievements: []
  }));
}

// Save user data back to localStorage
function saveUserData(data) {
  localStorage.setItem('userData', JSON.stringify(data));
}

// Add an item to inventory
function addItemToInventory(item) {
  const data = getUserData();
  data.inventory.push(item);
  saveUserData(data);
}

// Add an achievement if not already unlocked
function unlockAchievement(achievement) {
  const data = getUserData();
  if (!data.achievements.includes(achievement)) {
    data.achievements.push(achievement);
    saveUserData(data);
  }
}

// Example: Check if achievement unlocked
function hasAchievement(achievement) {
  const data = getUserData();
  return data.achievements.includes(achievement);
}
