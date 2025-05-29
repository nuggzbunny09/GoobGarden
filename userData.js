// userData.js

function getUserData() {
  return JSON.parse(localStorage.getItem('userData') || '{}');
}

function saveUserData(data) {
  localStorage.setItem('userData', JSON.stringify(data));
}

function updateUserData(updates) {
  const data = getUserData();
  Object.assign(data, updates);
  saveUserData(data);
}
