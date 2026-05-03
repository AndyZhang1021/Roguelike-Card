import type { CharacterType } from "./character"

export enum CardType {
  ATTACK = 'attack',
  SKILL = 'skill',
}

export interface Card {
  id: string
  name: string
  icon: string
  cost: number
  type: CardType
  description: string,
  targets?: CharacterType[]
}
