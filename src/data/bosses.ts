import type { Enemy } from "../types/game";

export const BOSSES: Omit<Enemy, 'maxHp' | 'block' | 'status'>[] = [
  { name: 'Rat King',      emoji: '🐀', hp: 20,  atk: 5  },
  { name: 'Goblin Mage',   emoji: '🧟', hp: 28,  atk: 6  },
  { name: 'Stone Golem',   emoji: '🗿', hp: 35,  atk: 7  },
  { name: 'Dark Witch',    emoji: '🧙‍♀️', hp: 40, atk: 8  },
  { name: 'Thunder Drake', emoji: '🐉', hp: 48,  atk: 9  },
  { name: 'Phantom',       emoji: '👻', hp: 55,  atk: 10 },
  { name: 'Iron Knight',   emoji: '🗡️', hp: 62,  atk: 11 },
  { name: 'Sea Serpent',   emoji: '🐍', hp: 70,  atk: 12 },
  { name: 'Lich',          emoji: '💀', hp: 80,  atk: 13 },
  { name: 'Final Dragon',  emoji: '🔥', hp: 100, atk: 15 },
]