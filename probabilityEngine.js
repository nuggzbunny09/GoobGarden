// probabilityEngine.js

const DEBUG = false;

export function randomEvent(chance) {
  const result = Math.random() < chance;
  if (DEBUG) console.log(`randomEvent(${chance}) => ${result}`);
  return result;
}

export function weightedRandom(weights) {
  const total = Object.values(weights).reduce((sum, val) => sum + val, 0);
  let pick = Math.random() * total;

  for (const [key, weight] of Object.entries(weights)) {
    if (pick < weight) return key;
    pick -= weight;
  }

  return Object.keys(weights)[0]; // fallback
}
