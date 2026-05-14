import { ActionType, CardType, StatusKind, type Card, type CardAction, type GameCard } from "../types/card"
import type { Enemy, Player } from "../types/game"
import { IsNull } from "../utilities/field-validation"
import { ApplyStatus, DealDamage, STATUSES } from "./statuses"

export const ALL_CARDS: Card[] = [
  {
    name: 'Strike', icon: '⚔️', cost: 1, type: CardType.ATTACK, occurenceCount: 10,
    description: 'Deal 6 damage',
    actions: [
      { type: ActionType.DAMAGE, amount: 6, target: 'enemy' }, 
      { type: ActionType.APPLY_STATUS, status: StatusKind.WEAK, stacks: 2, target: 'enemy' },
      // { type: ActionType.BLOCK, amount: 10, target: 'self' },
    ],
  },
  {
    name: 'Defend', icon: '🛡️', cost: 1, type: CardType.SKILL, occurenceCount: 2,
    description: 'Gain 5 block',
    actions: [{ type: ActionType.BLOCK, amount: 5, target: 'self' }],
  },
  {
    name: 'Bash', icon: '🔨', cost: 2, type: CardType.ATTACK, occurenceCount: 2,
    description: 'Deal 8 damage. Apply 2 Weak',
    actions: [
      { type: ActionType.DAMAGE, amount: 8, target: 'enemy' },
      { type: ActionType.APPLY_STATUS, status: StatusKind.WEAK, stacks: 2, target: 'enemy' },
    ],
  },
  {
    name: 'Fireball', icon: '🔥', cost: 2, type: CardType.ATTACK, occurenceCount: 2,
    description: 'Deal 12 damage',
    actions: [{ type: ActionType.DAMAGE, amount: 12, target: 'enemy' }],
  },
  {
    name: 'Bandage', icon: '💊', cost: 1, type: CardType.SKILL, occurenceCount: 3,
    description: 'Heal 6 HP',
    actions: [{ type: ActionType.HEAL, amount: 6, target: 'self' }],
  },
  {
    name: 'Poison Dart', icon: '🪶', cost: 1, type: CardType.ATTACK, occurenceCount: 2,
    description: 'Apply 3 Poison',
    actions: [{ type: ActionType.APPLY_STATUS, status: StatusKind.POISON, stacks: 3, target: 'enemy' }],
  },
  {
    name: 'Twin Strike', icon: '⚡', cost: 1, type: CardType.ATTACK, occurenceCount: 1,
    description: 'Deal 4 damage twice',
    actions: [
      { type: ActionType.DAMAGE, amount: 4, target: 'enemy' },
      { type: ActionType.DAMAGE, amount: 4, target: 'enemy' },
    ],
  },
  {
    name: 'Fortify', icon: '🏰', cost: 2, type: CardType.SKILL, occurenceCount: 1,
    description: 'Gain 12 block',
    actions: [{ type: ActionType.BLOCK, amount: 12, target: 'self' }],
  },
  {
    name: 'Arcane Blast', icon: '💫', cost: 3, type: CardType.ATTACK, occurenceCount: 1,
    description: 'Deal 20 damage',
    actions: [{ type: ActionType.DAMAGE, amount: 20, target: 'enemy' }],
  },
]

export const GetCardDeck = (): GameCard[] => {
  const deck: GameCard[] = [];
  ALL_CARDS.map((card: Card) => {
    for (let i = 0; i < card.occurenceCount; i++)
      deck.push({ ...card, id: `${card.name}_${i}` });
  });
  return deck;
}

export interface ActionContext {
  player: Player;
  enemy: Enemy;
}

export interface ActionOutcome extends ActionContext {
  logs: string[];
  dmgToEnemy: number; // 累积本次出牌对敌人造成的伤害（boon trigger 用）
}

export function ApplyAction(action: CardAction, ctx: ActionOutcome): ActionOutcome {
  switch (action.type) {
    case ActionType.DAMAGE: {
      if (action.target === 'enemy') {
        const { defender, dmgDealt } = DealDamage(action.amount, ctx.player, ctx.enemy);
        return {
          ...ctx,
          enemy: defender,
          logs: [...ctx.logs, `⚔️ ${dmgDealt} dmg`],
          dmgToEnemy: ctx.dmgToEnemy + dmgDealt,
        };
      } else {
        const { defender, dmgDealt } = DealDamage(action.amount, ctx.enemy, ctx.player);
        return {
          ...ctx,
          player: defender,
          logs: [...ctx.logs, `💢 Self ${dmgDealt} dmg`],
        };
      }
    }
    case ActionType.BLOCK: {
      if (action.target === 'self') {
        return {
          ...ctx,
          player: { ...ctx.player, block: ctx.player.block + action.amount },
          logs: [...ctx.logs, `🛡️ +${action.amount} block`],
        };
      } else {
        return {
          ...ctx,
          enemy: { ...ctx.enemy, block: ctx.enemy.block + action.amount },
          logs: [...ctx.logs, `🛡️ Enemy +${action.amount} block`],
        };
      }
    }
    case ActionType.HEAL: {
      if (action.target === 'self') {
        return {
          ...ctx,
          player: { ...ctx.player, hp: Math.min(ctx.player.maxHp, ctx.player.hp + action.amount) },
          logs: [...ctx.logs, `💊 +${action.amount} HP`],
        };
      } else {
        return {
          ...ctx,
          enemy: { ...ctx.enemy, hp: Math.min(ctx.enemy.maxHp, ctx.enemy.hp + action.amount) },
          logs: [...ctx.logs, `💊 Enemy +${action.amount} HP`],
        };
      }
    }
    case ActionType.APPLY_STATUS: {
      const def = STATUSES[action.status];
      const suffix = !IsNull(action.duration) ? ` (${action.duration}t)` : '';
      if (action.target === 'self') {
        return {
          ...ctx,
          player: ApplyStatus(ctx.player, action.status, action.stacks, action.duration),
          logs: [...ctx.logs, `${def.icon} Self +${action.stacks} ${def.name}${suffix}`],
        };
      } else {
        return {
          ...ctx,
          enemy: ApplyStatus(ctx.enemy, action.status, action.stacks, action.duration),
          logs: [...ctx.logs, `${def.icon} Enemy +${action.stacks} ${def.name}${suffix}`],
        };
      }
    }
  }
}

export function RunCardActions(card: Card, player: Player, enemy: Enemy): ActionOutcome {
  let outcome: ActionOutcome = { player, enemy, logs: [], dmgToEnemy: 0 };
  for (const action of card.actions) {
    outcome = ApplyAction(action, outcome);
  }
  return outcome;
}