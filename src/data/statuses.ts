import { StatusKind } from "../types/card";
import type { Enemy, Player, StatusList } from "../types/game";

export interface StatusDef {
  id: StatusKind;
  name: string;
  icon: string;
  description: string;
  // 自身攻击时调整输出伤害（如 Weak / Strength）
  modifyOutgoingDamage?: (dmg: number, stacks: number) => number;
  // 自身受击时调整承伤（如 Vulnerable）
  modifyIncomingDamage?: (dmg: number, stacks: number) => number;
  // 自身回合开始时触发（如 Poison 扣血）
  onTurnStart?: (stacks: number) => { dmg?: number; logs?: string[] };
  // 自身回合结束时 stacks 是否 -1（如三角形 DoT 那种 stacks 自衰减）
  stacksDecayPerTurn: boolean;
}

export const STATUSES: Record<StatusKind, StatusDef> = {
  [StatusKind.WEAK]: {
    id: StatusKind.WEAK,
    name: 'Weak',
    icon: '🌀',
    description: 'Deal less 1 damage',
    modifyOutgoingDamage: (dmg) => Math.floor(dmg - 1),
    stacksDecayPerTurn: true,
  },
  [StatusKind.VULNERABLE]: {
    id: StatusKind.VULNERABLE,
    name: 'Vulnerable',
    icon: '🎯',
    description: 'Take 1 more damage',
    modifyIncomingDamage: (dmg) => Math.floor(dmg  + 1),
    stacksDecayPerTurn: true,
  },
  [StatusKind.POISON]: {
    id: StatusKind.POISON,
    name: 'Poison',
    icon: '☠️',
    description: 'Take N damage at start of turn, then N decreases by 1',
    onTurnStart: (stacks) => ({
      dmg: stacks,
      logs: [`☠️ Poison: ${stacks} dmg`],
    }),
    stacksDecayPerTurn: true,
  },
  [StatusKind.STRENGTH]: {
    id: StatusKind.STRENGTH,
    name: 'Strength',
    icon: '💪',
    description: 'Deal +N damage with attacks',
    modifyOutgoingDamage: (dmg, stacks) => dmg + stacks,
    stacksDecayPerTurn: false,
  },
};

type Combatant = Player | Enemy;

// 查指定状态的总 stacks（不存在返回 0）
export const GetStatusStacks = (list: StatusList, kind: StatusKind): number =>
  list.find((e) => e.kind === kind)?.stacks ?? 0;

export function CalcDamage(base: number, attacker: Combatant, defender: Combatant): number {
  let dmg = base;
  for (const { kind, stacks } of attacker.status) {
    if (stacks <= 0) continue;
    dmg = STATUSES[kind].modifyOutgoingDamage?.(dmg, stacks) ?? dmg;
  }
  for (const { kind, stacks } of defender.status) {
    if (stacks <= 0) continue;
    dmg = STATUSES[kind].modifyIncomingDamage?.(dmg, stacks) ?? dmg;
  }
  return Math.max(0, dmg);
}

export function DealDamage<T extends Combatant>(
  amount: number,
  attacker: Combatant,
  defender: T,
): { defender: T; dmgDealt: number } {
  const finalDmg = CalcDamage(amount, attacker, defender);
  const absorbed = Math.min(defender.block, finalDmg);
  const hpDmg = finalDmg - absorbed;
  return {
    defender: { ...defender, hp: defender.hp - hpDmg, block: defender.block - absorbed },
    dmgDealt: hpDmg,
  };
}

// 给目标加 stacks 的状态。已有同 kind 的 entry 会合并：stacks 相加，duration 取 max
// （任一方为永久 / undefined 则结果为永久）。
export function ApplyStatus<T extends Combatant>(
  target: T,
  kind: StatusKind,
  stacks: number,
  duration?: number,
): T {
  const idx = target.status.findIndex((e) => e.kind === kind);
  const next: StatusList = [...target.status];
  if (idx >= 0) {
    const cur = next[idx];
    const mergedDuration =
      cur.duration === undefined || duration === undefined
        ? undefined
        : Math.max(cur.duration, duration);
    next[idx] = { ...cur, stacks: cur.stacks + stacks, duration: mergedDuration };
  } else {
    next.push({ kind, stacks, duration });
  }
  return { ...target, status: next };
}

// 回合开始：执行 onTurnStart（如 Poison 扣血），状态本身的衰减放到回合结束
export function TickStatusesOnTurnStart<T extends Combatant>(target: T): { target: T; logs: string[] } {
  let hp = target.hp;
  const logs: string[] = [];
  for (const { kind, stacks } of target.status) {
    if (stacks <= 0) continue;
    const fx = STATUSES[kind].onTurnStart?.(stacks);
    if (!fx) continue;
    if (fx.dmg) hp -= fx.dmg;
    if (fx.logs) logs.push(...fx.logs);
  }
  return { target: { ...target, hp }, logs };
}

// 回合结束：stacksDecayPerTurn 的状态 stacks -1；带 duration 的 entry duration -1。
// stacks 归零或 duration 走完都会移除。
export function DecayStatusesOnTurnEnd<T extends Combatant>(target: T): T {
  const next: StatusList = [];
  for (const entry of target.status) {
    if (entry.stacks <= 0) continue;
    const def = STATUSES[entry.kind];
    const newStacks = def.stacksDecayPerTurn ? entry.stacks - 1 : entry.stacks;
    const newDuration = entry.duration !== undefined ? entry.duration - 1 : undefined;
    if (newStacks <= 0) continue;
    if (newDuration !== undefined && newDuration <= 0) continue;
    next.push({ ...entry, stacks: newStacks, duration: newDuration });
  }
  return { ...target, status: next };
}
