import { BoonTrigger, BoonType, type Boon, type BoonContext, type BoonOutcome } from "../types/boons";

export const ALL_BOONS: Boon[] = [
  {
    id: 'natural-heal',
    name: 'Natural Heal',
    icon: '💫',
    description: 'Every round you get +1 hp',
    type: BoonType.BLESSED,
    triggers: {
      [BoonTrigger.ROUND_START]: ({ player }) => ({
        player: { ...player, hp: Math.min(player.maxHp, player.hp + 1) },
        logs: [`Boon (Natural Heal): 💊 +1 HP`],
      }),
    },
  },
  {
    id: 'lifesteal',
    name: 'Lifesteal',
    icon: '💫',
    description: 'You get +1 hp from each attack',
    type: BoonType.BLESSED,
    triggers: {
      [BoonTrigger.ON_ATTACK]: ({ player }) => ({
        player: { ...player, hp: Math.min(player.maxHp, player.hp + 1) },
        logs: [`Boon (Lifesteal): 💊 +1 HP`],
      }),
    },
  },
  {
    id: 'rage',
    name: 'Rage',
    icon: '💫',
    description: 'You can only attack once per round, but each of your attacks deals double damage',
    type: BoonType.TWISTED,
    triggers: {
      [BoonTrigger.ON_ATTACK]: ({ enemy, card, dmg, disabledCards }) => {
        if (!card || dmg == null) return;
        const newDisabled = [...disabledCards];
        const idx = newDisabled.findIndex(c => c.card.type === card.type);
        if (idx >= 0) newDisabled[idx] = { ...newDisabled[idx], round: newDisabled[idx].round + 1 };
        else newDisabled.push({ round: 1, card });
        return {
          enemy: { ...enemy, hp: enemy.hp - dmg },
          disabledCards: newDisabled,
          logs: [`Boon (Rage): Deal double dmg`],
        };
      },
    },
  },
  {
    id: 'suicide',
    name: 'Suicide',
    icon: '💫',
    description: '-3 hp every start round',
    type: BoonType.CORRUPTED,
    triggers: {
      [BoonTrigger.ROUND_START]: ({ player }) => ({
        player: { ...player, hp: player.hp - 3 },
        logs: [`Boon (Suicide): 💀 -3 HP`],
      }),
    },
  },
  {
    id: 'chaotic',
    name: 'Chaotic',
    icon: '💫',
    description: '50% chance to draw an extra card at turn end',
    type: BoonType.CHAOTIC,
    triggers: {
      [BoonTrigger.ROUND_END]: () => {
        if (Math.random() >= 0.5) return;
        return { drawCards: 1, logs: [`Boon (Chaotic): 🎲 Draw an extra card`] };
      },
    },
  },
];

export const ApplyBoons = (trigger: BoonTrigger, ctx: BoonContext): BoonOutcome => {
  const outcome: BoonOutcome = {
    player: ctx.player,
    enemy: ctx.enemy,
    disabledCards: ctx.disabledCards,
    logs: [],
    drawCards: 0,
  };
  for (const boon of ctx.player.boons) {
    const effect = boon.triggers[trigger];
    if (!effect) continue;
    const patch = effect({
      player: outcome.player,
      enemy: outcome.enemy,
      disabledCards: outcome.disabledCards,
      card: ctx.card,
      dmg: ctx.dmg,
    });
    if (!patch) continue;
    if (patch.player) outcome.player = patch.player;
    if (patch.enemy) outcome.enemy = patch.enemy;
    if (patch.disabledCards) outcome.disabledCards = patch.disabledCards;
    if (patch.logs) outcome.logs.push(...patch.logs);
    if (patch.drawCards) outcome.drawCards += patch.drawCards;
  }
  return outcome;
}
