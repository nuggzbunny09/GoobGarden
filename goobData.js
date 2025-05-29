// goobData.js

// Get saved Goob data from localStorage
export function getGoobData(goobId) {
  const data = JSON.parse(localStorage.getItem('goobData')) || {};
  return data[goobId] || createNewGoobData();
}

// Save Goob data to localStorage
export function setGoobData(goobId, newData) {
  const data = JSON.parse(localStorage.getItem('goobData')) || {};
  data[goobId] = newData;
  localStorage.setItem('goobData', JSON.stringify(data));
}

// Create a new Goob data structure
export function createNewGoobData() {
  return {
    luckModifier: 1.0, // Default neutral modifier
    rareEvents: 0,     // How many rare events have occurred
    history: []        // Optional: track past outcomes
  };
}
