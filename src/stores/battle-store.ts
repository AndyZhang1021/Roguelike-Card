import { create } from 'zustand'
import { BOSSES } from '../data/bosses'
import { ApplyBoons } from '../data/boons'
import { RunCardActions } from '../data/cards'
import { DealDamage, DecayStatusesOnTurnEnd, TickStatusesOnTurnStart } from '../data/statuses'
import { useGameStore } from './game-store'
import { type Enemy, type GameScreen } from '../types/game'
import { CardType, MAX_HAND_SIZE, type GameCard } from '../types/card'
import { CharacterType } from "../types/character"
import { Shuffle } from "../utilities/general"
import { BoonTrigger } from "../types/boons"

interface BattleState {
  enemy: Enemy | null,
  hand: GameCard[],
  draw: GameCard[],
  discard: string[],
  energy: number,
  maxEnergy: number,
  turn: CharacterType,
  round: number,
  log: string[],
  dmgCaused: number,
  dmgTaken: number,
  disabledCards: { round: number, card: GameCard }[],

  addLog: (msg: string) => void,
  startBattle: () => void,
  drawCard: (card?: GameCard) => void,
  playCard: (card: GameCard) => void,
  discardCard: (card: GameCard) => void,
  endTurn: () => void,
  resetBattle: () => void,
  startPlayerRound: () => void,
  startEnemyRound: () => void,
}

const goScreen = (game: any, screen: GameScreen) => {
  switch (screen) {
    case 'battle':
      game.addLog('🏆 Victory!')
      break;
    case 'gameover':
      game.addLog('💀 Defeat!')
      break;
    case 'win':
      game.addLog('🎉 You Win!')
      break;
  }
  game.setScreen(screen);
}

export const useBattleStore = create<BattleState>((set, get) => ({
  enemy: null,
  hand: [],
  draw: [],
  discard: [],
  energy: 3,
  maxEnergy: 3,
  turn: CharacterType.PLAYER,
  round: 1,
  log: [],
  dmgCaused: 0,
  dmgTaken: 0,
  disabledCards: [],

  addLog: (msg) =>
    set((s) => ({ log: [msg, ...s.log].slice(0, 20) })),

  resetBattle: () =>
    set({
      enemy: null,
      hand: [],
      draw: [],
      discard: [],
      energy: 3,
      maxEnergy: 3,
      round: 1,
    }),

  startBattle: () => {
    const { resetBattle, startPlayerRound } = get();
    resetBattle();
    const game = useGameStore.getState();
    const bossData = BOSSES[game.floor - 1];

    const enemy: Enemy = {
      ...bossData,
      maxHp: bossData.hp,
      block: 0,
      status: [],
    };

    const draw: GameCard[] = Shuffle(game.deck);
    const hand: GameCard[] = draw.splice(0, MAX_HAND_SIZE);
    set({
      enemy,
      draw,
      discard: [],
      hand,
      turn: CharacterType.PLAYER,
      round: 1,
      energy: get().maxEnergy,
      log: [],
    });

    game.setScreen('battle');
    game.addLog(`⚔️ Battle starts vs ${enemy.name}!`);
    startPlayerRound();
  },

  drawCard: (card?: GameCard) => {
    const { draw, hand, discard } = get();
    const game = useGameStore.getState();
    let newDraw = [...draw];
    let newHand = [...hand];
    let newDiscard = [...discard];
    if (newDraw.length === 0 && newDiscard.length > 0) {
      newDraw = Shuffle(game.deck.filter((c) => newDiscard.includes(c.id)));
      newDiscard = [];
    }
    if (newDraw.length > 0) {
      newHand = [...newHand, newDraw[0]];
      newDraw.splice(0, 1);
    }
    set({ draw: newDraw, hand: newHand, discard: newDiscard });
  },

  discardCard: (card: GameCard) => {
    set((s) => ({
      hand: s.hand.filter((c) => c.id !== card.id),
      discard: [...s.discard, card.id],
    }));
    get().addLog(`🗑️ Discarded ${card.name}`);
  },

  playCard: (card) => {
    const { energy, enemy, disabledCards, addLog } = get();
    const game = useGameStore.getState();
    const player = game.player;

    if (energy < card.cost || !enemy) return;

    addLog(`${card.icon} ${card.name}`);

    // 1. 跑卡牌 actions
    const actionOutcome = RunCardActions(card, player, enemy);
    let newPlayer = actionOutcome.player;
    let newEnemy = actionOutcome.enemy;
    let newDisabledCards = [...disabledCards];
    actionOutcome.logs.forEach(addLog);

    // 2. 攻击牌触发 ON_ATTACK boon
    if (card.type === CardType.ATTACK) {
      const boonOutcome = ApplyBoons(BoonTrigger.ON_ATTACK, {
        player: newPlayer,
        enemy: newEnemy,
        disabledCards: newDisabledCards,
        card,
        dmg: actionOutcome.dmgToEnemy,
      });
      newPlayer = boonOutcome.player;
      newEnemy = boonOutcome.enemy;
      newDisabledCards = boonOutcome.disabledCards;
      boonOutcome.logs.forEach(addLog);
    }

    set((s) => ({
      energy: s.energy - card.cost,
      hand: s.hand.filter((c) => c.id !== card.id),
      discard: [...s.discard, card.id],
      enemy: newEnemy,
      dmgCaused: actionOutcome.dmgToEnemy,
      disabledCards: newDisabledCards,
    }))

    game.updatePlayer(newPlayer)

    if (newEnemy.hp <= 0) goScreen(game, "reward");
    else if (newPlayer.hp <= 0) goScreen(game, "gameover");
  },

  endTurn: () => {
    const { enemy, disabledCards, addLog, drawCard, startPlayerRound, startEnemyRound } = get();
    const game = useGameStore.getState();
    if (!enemy) return;

    // ROUND_END boons
    const outcome = ApplyBoons(BoonTrigger.ROUND_END, {
      player: game.player,
      enemy,
      disabledCards,
    });
    outcome.logs.forEach(addLog);

    // 玩家回合结束：状态衰减（玩家身上的 Weak / Vulnerable -1）
    const decayedPlayer = DecayStatusesOnTurnEnd(outcome.player);

    game.updatePlayer(decayedPlayer);
    set({ enemy: outcome.enemy, disabledCards: outcome.disabledCards });
    for (let i = 0; i < outcome.drawCards; i++) drawCard();

    if (decayedPlayer.hp <= 0) {
      goScreen(game, "gameover");
      return;
    }
    if (outcome.enemy.hp <= 0) {
      goScreen(game, "reward");
      return;
    }

    startEnemyRound();
    startPlayerRound();
  },

  startPlayerRound: () => {
    const { round, enemy, disabledCards, addLog, drawCard } = get();
    const game = useGameStore.getState();
    if (!enemy) return;

    const newRound = round + 1;
    const tickedDisabled = [...disabledCards]
      .map((c) => ({ ...c, round: c.round - 1 }))
      .filter((c) => c.round > 0);

    addLog(`Round ${newRound}: Player turn start!`);
    set({ turn: CharacterType.PLAYER });

    // 玩家回合开始：tick 玩家状态（如 Poison 扣血）
    const playerTick = TickStatusesOnTurnStart(game.player);
    playerTick.logs.forEach(addLog);

    // ROUND_START boons
    const boonOutcome = ApplyBoons(BoonTrigger.ROUND_START, {
      player: playerTick.target,
      enemy,
      disabledCards: tickedDisabled,
    });
    boonOutcome.logs.forEach(addLog);
    game.updatePlayer(boonOutcome.player);
    set({
      round: newRound,
      enemy: boonOutcome.enemy,
      disabledCards: boonOutcome.disabledCards,
    });

    drawCard();
    for (let i = 0; i < boonOutcome.drawCards; i++) drawCard();

    if (boonOutcome.player.hp <= 0) goScreen(game, "gameover");
  },

  startEnemyRound: () => {
    const { enemy, maxEnergy, addLog, round, dmgCaused, dmgTaken } = get();
    const game = useGameStore.getState();
    const player = game.player;

    if (!enemy) return;
    let newEnemy: Enemy = { ...enemy, status: [...enemy.status] };
    let newPlayer = { ...player };
    let newDmgCaused = dmgCaused;
    let newDmgTaken = dmgTaken;

    const commit = () => {
      set({
        enemy: newEnemy,
        energy: maxEnergy,
        dmgCaused: newDmgCaused,
        dmgTaken: newDmgTaken,
      });
      game.updatePlayer(newPlayer);
    }

    addLog(`Round ${round}: 👹 ${enemy.name} turn start!`);
    set({ turn: CharacterType.ENEMY });

    // 1. 敌人回合开始：tick 敌人状态（如 Poison 扣血）
    const enemyTick = TickStatusesOnTurnStart(newEnemy);
    newEnemy = enemyTick.target;
    enemyTick.logs.forEach(addLog);

    if (newEnemy.hp <= 0) {
      commit();
      return goScreen(game, "reward");
    }
    // 2. 敌人攻击（dmgDealt 已经过 Weak / Vulnerable / Strength / 玩家 block）
    const { defender, dmgDealt } = DealDamage(newEnemy.atk, newEnemy, newPlayer);
    newDmgCaused += dmgDealt;
    newDmgTaken += dmgDealt;
    addLog(`👹 ${enemy.name} attacks ${dmgDealt} dmg`);
    newPlayer = defender;

    if (defender.hp <= 0) {
      commit();
      return goScreen(game, "gameover");
    }

    // 3. 敌人回合结束：状态衰减（Weak / Vulnerable -1 stack）
    newEnemy = DecayStatusesOnTurnEnd(newEnemy);
    commit();
  },
}))