export type GameScreen = 'entry' | 'map' | 'battle' | 'reward' | 'gameover' | 'win'

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