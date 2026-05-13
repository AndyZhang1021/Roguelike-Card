import type { GameCard } from "./card";
import type { Enemy, Player } from "./game";

export enum BoonType {
  BLESSED = 'blessed',     // 好运
  TWISTED = 'twisted',     // 半益
  CORRUPTED = 'corrupted', // 有害
  CHAOTIC = 'chaotic',     // 混乱 - 随机性强
}

export enum BoonTrigger {
  ROUND_START = 'round_start', // 玩家回合开始（抽牌前）
  ROUND_END = 'round_end',     // 玩家按 End Turn 时
  ON_ATTACK = 'on_attack',     // 出攻击牌时
}

export interface BoonContext {
  player: Player;
  enemy: Enemy;
  disabledCards: { round: number; card: GameCard }[];
  card?: GameCard;
  dmg?: number;
}

export interface BoonOutcome {
  player: Player;
  enemy: Enemy;
  disabledCards: { round: number; card: GameCard }[];
  logs: string[];
  drawCards: number;
}

export type BoonEffect = (ctx: BoonContext) => Partial<BoonOutcome> | void;

export interface Boon {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: BoonType;
  triggers: Partial<Record<BoonTrigger, BoonEffect>>;
}