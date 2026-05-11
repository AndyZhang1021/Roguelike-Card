import type { RoundState } from "./game";

export interface Boon {
  name: string,
  icon: string,
  description: string,
  type: BoonType,
  triggerState: RoundState
}

export enum BoonType {
  BLESSED = 'blessed', // 好运
  TWISTED = 'twisted', // 半益
  CORRUPTED = 'corrupted', // 有害
  CHAOTIC = 'chaotic', // 混乱 - 随机性强
}