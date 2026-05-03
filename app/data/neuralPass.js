export const NEURAL_PASS_TIERS = [
  {
    tier: 1,
    requiredXp: 0,
    reward: { type: 'badge', id: 'recruit', name: 'Recruit Badge', icon: 'Shield' }
  },
  {
    tier: 2,
    requiredXp: 200,
    reward: { type: 'credits', amount: 100, name: '100 Neural Credits', icon: 'Zap' }
  },
  {
    tier: 3,
    requiredXp: 500,
    reward: { type: 'theme', id: 'hacker-green', name: 'Matrix Theme', icon: 'Palette' }
  },
  {
    tier: 4,
    requiredXp: 1000,
    reward: { type: 'badge', id: 'sentinel', name: 'Sentinel Badge', icon: 'Target' }
  },
  {
    tier: 5,
    requiredXp: 2000,
    reward: { type: 'credits', amount: 500, name: '500 Neural Credits', icon: 'Zap' }
  },
  {
    tier: 6,
    requiredXp: 3500,
    reward: { type: 'item', id: 'item_yubikey', name: 'Hardware Security Key', icon: 'Lock' }
  }
];
