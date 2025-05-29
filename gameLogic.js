// gameLogic.js
import { getGoobData, setGoobData } from './goobData.js';
import { weightedRandom } from './probabilityEngine.js'; // optional helper

// Example: Run a random event for a Goob
export function runGoobEvent(goobId) {
  const goob = getGoobData(goobId);

  // Define base chances (adjustable later)
  const baseChances = {
    happy: 60 * goob.luckModifier,
    neutral: 30 * goob.luckModifier,
    sad: 10 * goob.luckModifier
  };

  // Pick outcome using weighted random
  const outcome = weightedRandom(baseChances);

  // Log it to Goob history
  goob.history.push(outcome);

  // Adjust Goob data based on outcome
  if (outcome === 'happy') {
    goob.luckModifier *= 1.01;
  } else if (outcome === 'sad') {
    goob.luckModifier *= 0.95;
  }

  // Save updated data
  setGoobData(goobId, goob);

  return outcome;
}
