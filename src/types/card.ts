import type { CharacterType } from "./character"

export enum CardType {
  ATTACK = 'attack',
  SKILL = 'skill',
}

export interface Card {
  code: CardCode,
  name: string,
  icon: string,
  cost: number,
  type: CardType,
  description: string,
  occurenceCount: number,
}

export interface GameCard extends Card {
  id: string,
  targets?: CharacterType[],
}

export enum CardCode {
  STRIKE = 'strike',
  BASH = 'bash',
  DEFEND = 'defend',
  FIREBALL = 'fireball',
  HEAL = 'heal',
  POISON = 'poison',
  DOUBLE = 'double',
  ARMOR = 'armor',
  BLAST = 'blast',
}

export const MAX_HAND_SIZE = 5;