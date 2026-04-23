/**
 * Shared game logic for Awareness Pro
 */

export const XP_PER_LEVEL = 500;

/**
 * Calculates the user's level based on total XP
 * Level 1: 0 - 499
 * Level 2: 500 - 999
 * Level 3: 1000 - 1499
 * ... and so on
 */
export function calculateLevel(xp) {
  if (!xp || xp < 0) return 1;
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

/**
 * Calculates the progress percentage to the next level
 */
export function calculateLevelProgress(xp) {
  if (!xp || xp < 0) return 0;
  const currentLevelXp = xp % XP_PER_LEVEL;
  return (currentLevelXp / XP_PER_LEVEL) * 100;
}

/**
 * Returns the XP required for a specific level
 */
export function getXpForLevel(level) {
  return (level - 1) * XP_PER_LEVEL;
}
