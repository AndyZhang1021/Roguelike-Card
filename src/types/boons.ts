import type { GameCard } from "./card";
import type { Enemy, Player, RoundPhase } from "./game";

export enum BoonType {
  BLESSED = 'blessed',     // 好运
  TWISTED = 'twisted',     // 半益
  CORRUPTED = 'corrupted', // 有害
  CHAOTIC = 'chaotic',     // 混乱 - 随机性强
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
  triggers: Partial<Record<RoundPhase, BoonEffect>>;
}