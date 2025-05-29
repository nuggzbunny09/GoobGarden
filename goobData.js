// goobData.js

function getGoobs() {
  return JSON.parse(localStorage.getItem('goobs') || '[]');
}

function saveGoobs(goobs) {
  localStorage.setItem('goobs', JSON.stringify(goobs));
}

function getGoobById(id) {
  const goobs = getGoobs();
  return goobs.find(goob => goob.id === id);
}

function updateGoob(updatedGoob) {
  const goobs = getGoobs();
  const index = goobs.findIndex(g => g.id === updatedGoob.id);
  if (index !== -1) {
    goobs[index] = updatedGoob;
    saveGoobs(goobs);
  }
}

// Add a Goob-specific achievement
function unlockGoobAchievement(goobId, achievement) {
  const goob = getGoobById(goobId);
  if (!goob.achievements) goob.achievements = [];

  if (!goob.achievements.includes(achievement)) {
    goob.achievements.push(achievement);
    updateGoob(goob);
  }
}

// Check if Goob has an achievement
function goobHasAchievement(goobId, achievement) {
  const goob = getGoobById(goobId);
  return goob.achievements?.includes(achievement) || false;
}
