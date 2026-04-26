export type GameScreen = 'map' | 'battle' | 'reward' | 'gameover' | 'win'

export type CardType = 'attack' | 'skill' | 'power'

export interface Card {
  id: string
  name: string
  icon: string
  cost: number
  type: CardType
  desc: string
}

export interface Enemy {
  name: string
  emoji: string
  hp: number
  maxHp: number
  block: number
  atk: number
  status: Record<string, number>
}

export interface Player {
  hp: number
  maxHp: number
  block: number
  status: Record<string, number>
}