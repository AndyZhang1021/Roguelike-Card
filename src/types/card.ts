import type { CharacterType } from "./character"

export enum CardType {
  ATTACK = 'attack',
  SKILL = 'skill',
}

export enum StatusKind {
  WEAK = 'weak',             // 攻击伤害 -25%
  POISON = 'poison',         // 每回合开始扣 N hp
  VULNERABLE = 'vulnerable', // 受到伤害 +50%
  STRENGTH = 'strength',     // 攻击伤害 +N
}
// -----------------------------------------------------------------------------
export type Target = 'self' | 'enemy';

export type CardAction =
  | { type: ActionType.DAMAGE; amount: number; target: Target }
  | { type: ActionType.BLOCK; amount: number; target: Target }
  | { type: ActionType.HEAL; amount: number; target: Target }
  | { type: ActionType.APPLY_STATUS; status: StatusKind; stacks: number; duration?: number; target: Target }

export enum ActionType {
  DAMAGE = 'damage',
  BLOCK = 'block',
  HEAL = 'heal',
  APPLY_STATUS = 'applyStatus',
}
export interface Card {
  name: string,
  icon: string,
  cost: number,
  type: CardType,
  description: string,
  occurenceCount: number,
  actions: CardAction[],
}

export interface GameCard extends Card {
  id: string,
  targets?: CharacterType[],
}

export const MAX_HAND_SIZE = 5;
export const MAX_HAND_LIMIT = 8;