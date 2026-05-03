import { CardType, type Card } from "../types/card"


export const ALL_CARDS: Card[] = [
  { id: 'strike', name: 'Strike', icon: '⚔️', cost: 1, type: CardType.ATTACK, description: 'Deal 6 dmg' },
  { id: 'defend', name: 'Defend', icon: '🛡️', cost: 1, type: CardType.SKILL, description: 'Gain 5 block' },
  { id: 'bash', name: 'Bash', icon: '🔨', cost: 2, type: CardType.ATTACK, description: 'Deal 8 dmg + Weak' },
  { id: 'fireball', name: 'Fireball', icon: '🔥', cost: 2, type: CardType.ATTACK, description: 'Deal 12 dmg' },
  { id: 'heal', name: 'Bandage', icon: '💊', cost: 1, type: CardType.SKILL, description: 'Heal 6 HP' },
  { id: 'poison', name: 'Poison Dart', icon: '🪶', cost: 1, type: CardType.ATTACK, description: 'Apply 3 Poison' },
  { id: 'double', name: 'Twin Strike', icon: '⚡', cost: 1, type: CardType.ATTACK, description: 'Deal 4 dmg twice' },
  { id: 'armor', name: 'Fortify', icon: '🏰', cost: 2, type: CardType.SKILL, description: 'Gain 12 block' },
  { id: 'blast', name: 'Arcane Blast', icon: '💫', cost: 3, type: CardType.ATTACK, description: 'Deal 20 dmg' },
]

export const STARTER_DECK: string[] = [
  'strike', 'strike', 'strike',
  'defend', 'defend',
  'bash', 'heal', 'double',
]

export const getCard = (id: string) => ALL_CARDS.find(c => c.id === id)