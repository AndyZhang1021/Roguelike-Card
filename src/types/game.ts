import type { Boon } from "./boons"
import type { StatusKind } from "./card"

export type GameScreen = 'entry' | 'map' | 'battle' | 'reward' | 'gameover' | 'win'

export interface StatusEntry {
  kind: StatusKind
  stacks: number
  duration?: number  // 剩余回合数；undefined 表示永久
}

export type StatusList = StatusEntry[]

export interface Enemy {
  name: string
  emoji: string
  hp: number
  maxHp: number
  block: number
  atk: number
  status: StatusList
}

export interface Player {
  hp: number
  maxHp: number
  block: number
  boons: Boon[]
  status: StatusList
}

