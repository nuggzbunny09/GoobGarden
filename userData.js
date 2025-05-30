// userData.js

const defaultUserData = {
  name: "New Player",
  goobs: []
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

function updateUserName(newName) {
  const userData = getUserData();
  userData.name = newName;
  saveUserData(userData);
}

function getUserGoobs() {
  return getUserData().goobs || [];
}

function saveUserGoobs(goobs) {
  const userData = getUserData();
  userData.goobs = goobs;
  saveUserData(userData);
}
