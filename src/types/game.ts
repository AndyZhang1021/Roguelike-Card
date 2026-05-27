import type { Boon } from "./boons"
import type { GameCard, StatusKind } from "./card"

export type GameScreen = 'entry' | 'map' | 'battle' | 'reward' | 'gameover' | 'win'

export interface StatusEntry {
  kind: StatusKind
  stacks: number
  duration?: number  // 剩余回合数；undefined 表示永久
}

export type StatusList = StatusEntry[]

export interface SkillContext {
  player: Player;
  enemy: Enemy;
  disabledCards: { round: number; card: GameCard }[];
  card?: GameCard;
  dmg?: number;
}

export interface SkillOutcome {
  player: Player;
  enemy: Enemy;
  disabledCards: { round: number; card: GameCard }[];
  logs: string[];
  drawCards: number;
}
export type SkillEffect = (ctx: SkillContext) => Partial<SkillOutcome> | void;
export interface Enemy {
  name: string
  emoji: string
  hp: number
  maxHp: number
  block: number
  atk: number
  status: StatusList,
  skillTrigger?: Partial<Record<RoundPhase, SkillEffect>>;
}

export interface Player {
  hp: number
  maxHp: number
  block: number
  boons: Boon[]
  status: StatusList
}


export enum RoundPhase {
  ROUND_START = 'round_start', // 玩家回合开始（抽牌前）
  ROUND_END = 'round_end',     // 玩家按 End Turn 时
  ON_ATTACK = 'on_attack',     // 出攻击牌时
}
