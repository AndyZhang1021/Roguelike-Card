import { CardCode, CardType, type Card, type GameCard } from "../types/card"
import { CharacterType } from "../types/character"


export const ALL_CARDS: Card[] = [
  { code: CardCode.STRIKE, name: 'Strike', icon: '⚔️', cost: 1, type: CardType.ATTACK, description: 'Deal 6 dmg', occurenceCount: 10 },
  { code: CardCode.DEFEND, name: 'Defend', icon: '🛡️', cost: 1, type: CardType.SKILL, description: 'Gain 5 block', occurenceCount: 2 },
  { code: CardCode.BASH, name: 'Bash', icon: '🔨', cost: 2, type: CardType.ATTACK, description: 'Deal 8 dmg + Weak', occurenceCount: 2 },
  { code: CardCode.FIREBALL, name: 'Fireball', icon: '🔥', cost: 2, type: CardType.ATTACK, description: 'Deal 12 dmg', occurenceCount: 2 },
  { code: CardCode.HEAL, name: 'Bandage', icon: '💊', cost: 1, type: CardType.SKILL, description: 'Heal 6 HP', occurenceCount: 3 },
  { code: CardCode.POISON, name: 'Poison Dart', icon: '🪶', cost: 1, type: CardType.ATTACK, description: 'Apply 3 Poison', occurenceCount: 2 },
  { code: CardCode.DOUBLE, name: 'Twin Strike', icon: '⚡', cost: 1, type: CardType.ATTACK, description: 'Deal 4 dmg twice', occurenceCount: 1 },
  { code: CardCode.ARMOR, name: 'Fortify', icon: '🏰', cost: 2, type: CardType.SKILL, description: 'Gain 12 block', occurenceCount: 1 },
  { code: CardCode.BLAST, name: 'Arcane Blast', icon: '💫', cost: 3, type: CardType.ATTACK, description: 'Deal 20 dmg', occurenceCount: 1 },
]


export const GetCardDeck = (): GameCard[] => {
  const deck: GameCard[] = [];
  ALL_CARDS.map((card: Card) => {
    for (let i = 0; i < card.occurenceCount; i++)
      deck.push({ ...card, id: `${card.code}_${i}` });
  });
  return deck;
}

export const STARTER_DECK: CardCode[] = [
  CardCode.STRIKE, CardCode.STRIKE, CardCode.STRIKE,
  CardCode.DEFEND, CardCode.DEFEND,
  CardCode.BASH, CardCode.HEAL, CardCode.DOUBLE, CardCode.ARMOR, CardCode.BLAST
]

export const getCard = (code: CardCode) => ALL_CARDS.find(c => c.code === code)