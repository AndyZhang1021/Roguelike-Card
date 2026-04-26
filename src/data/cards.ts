import type { Card } from "../types/game"

export const ALL_CARDS: Card[] = [
  { id: 'strike',   name: 'Strike',      icon: '⚔️', cost: 1, type: 'attack', desc: 'Deal 6 dmg' },
  { id: 'defend',   name: 'Defend',      icon: '🛡️', cost: 1, type: 'skill',  desc: 'Gain 5 block' },
  { id: 'bash',     name: 'Bash',        icon: '🔨', cost: 2, type: 'attack', desc: 'Deal 8 dmg + Weak' },
  { id: 'fireball', name: 'Fireball',    icon: '🔥', cost: 2, type: 'attack', desc: 'Deal 12 dmg' },
  { id: 'heal',     name: 'Bandage',     icon: '💊', cost: 1, type: 'skill',  desc: 'Heal 6 HP' },
  { id: 'poison',   name: 'Poison Dart', icon: '🪶', cost: 1, type: 'attack', desc: 'Apply 3 Poison' },
  { id: 'double',   name: 'Twin Strike', icon: '⚡', cost: 1, type: 'attack', desc: 'Deal 4 dmg twice' },
  { id: 'armor',    name: 'Fortify',     icon: '🏰', cost: 2, type: 'skill',  desc: 'Gain 12 block' },
  { id: 'blast',    name: 'Arcane Blast',icon: '💫', cost: 3, type: 'attack', desc: 'Deal 20 dmg' },
]

export const STARTER_DECK: string[] = [
  'strike', 'strike', 'strike',
  'defend', 'defend',
  'bash', 'heal', 'double',
]

export const getCard = (id: string) => ALL_CARDS.find(c => c.id === id)