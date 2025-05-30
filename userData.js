// userData.js

const defaultUserData = {
  name: "New Player",
  inventory: [],
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

function updateUserName(newName) {
  const userData = getUserData();
  userData.name = newName;
  localStorage.setItem('userData', JSON.stringify(userData));
}

