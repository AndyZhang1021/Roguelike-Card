import type { Boon } from "./boons"

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
  boons: Boon[]
}

export enum RoundState {
  BEFORE_START, START_TURN, AFTER_TURN
}