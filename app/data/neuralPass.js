export const NEURAL_PASS_TIERS = [
  {
    tier: 1,
    requiredXp: 0,
    reward: { type: 'badge', id: 'recruit', name: 'Recruit Badge', icon: 'Shield' },
    premiumReward: { type: 'badge', id: 'knight', name: 'Neural Knight Badge', icon: 'Award' }
  },
  {
    tier: 2,
    requiredXp: 200,
    reward: { type: 'credits', amount: 100, name: '100 Neural Credits', icon: 'Zap' },
    premiumReward: { type: 'credits', amount: 500, name: '500 Neural Credits', icon: 'Zap' }
  },
  {
    tier: 3,
    requiredXp: 500,
    reward: { type: 'theme', id: 'hacker-green', name: 'Matrix Theme', icon: 'Palette' },
    premiumReward: { type: 'theme', id: 'glitch-pro', name: 'Pro Glitch Theme', icon: 'Sparkles' }
  },
  {
    tier: 4,
    requiredXp: 1000,
    reward: { type: 'badge', id: 'sentinel', name: 'Sentinel Badge', icon: 'Target' },
    premiumReward: { type: 'badge', id: 'archon', name: 'Archon Prime Badge', icon: 'Crown' }
  },
  {
    tier: 5,
    requiredXp: 2000,
    reward: { type: 'credits', amount: 500, name: '500 Neural Credits', icon: 'Zap' },
    premiumReward: { type: 'credits', amount: 2000, name: '2000 Neural Credits', icon: 'Zap' }
  },
  {
    tier: 6,
    requiredXp: 3500,
    reward: { type: 'item', id: 'item_yubikey', name: 'Hardware Security Key', icon: 'Lock' },
    premiumReward: { type: 'item', id: 'quantum_chip', name: 'Quantum Encryption Chip', icon: 'Zap' }
  }
];
