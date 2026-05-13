import { create } from 'zustand'
import { BOSSES } from '../data/bosses'
import { ApplyBoons } from '../data/boons'
import { useGameStore } from './game-store'
import { type Enemy, type GameScreen } from '../types/game'
import { CardCode, CardType, MAX_HAND_SIZE, type GameCard } from '../types/card'
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
      status: {},
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

    let newEnemy = { ...enemy };
    let newPlayer = { ...player };
    let newDisabledCards = [...disabledCards];

    let dmg = 0;
    switch (card.code) {
      case CardCode.STRIKE:
        dmg = 6;
        newEnemy.hp -= dmg;
        addLog('⚔️ Strike: 6 dmg');
        break;
      case CardCode.BASH:
        dmg = 8;
        newEnemy.hp -= dmg;
        newEnemy.status.weak = (newEnemy.status.weak || 0) + 2
        addLog('🔨 Bash: 8 dmg + Weak')
        break
      case CardCode.DEFEND:
        newPlayer.block += 5;
        addLog('🛡️ Defend: +5 block')
        break
      case CardCode.FIREBALL:
        dmg = 12;
        newEnemy.hp -= dmg;
        addLog('🔥 Fireball: 12 dmg')
        break
      case CardCode.HEAL:
        newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + 6);
        addLog('💊 Heal: +6 HP')
        break
      case CardCode.POISON:
        newEnemy.status.poison = (newEnemy.status.poison || 0) + 3;
        addLog('🪶 Poison: +3')
        break
      case CardCode.DOUBLE:
        dmg = 8;
        newEnemy.hp -= dmg;
        addLog('⚡ Twin Strike: 4+4 dmg')
        break
      case CardCode.ARMOR:
        newPlayer.block += 12;
        addLog('🏰 Fortify: +12 block')
        break
      case CardCode.BLAST:
        dmg = 20;
        newEnemy.hp -= dmg;
        addLog('💫 Arcane Blast: 20 dmg')
        break
    }

    if (card.type === CardType.ATTACK) {
      const outcome = ApplyBoons(BoonTrigger.ON_ATTACK, {
        player: newPlayer,
        enemy: newEnemy,
        disabledCards: newDisabledCards,
        card,
        dmg,
      });
      newPlayer = outcome.player;
      newEnemy = outcome.enemy;
      newDisabledCards = outcome.disabledCards;
      outcome.logs.forEach(addLog);
    }

    set((s) => ({
      energy: s.energy - card.cost,
      hand: s.hand.filter((c) => c.id !== card.id),
      discard: [...s.discard, card.id],
      enemy: newEnemy,
      dmgCaused: dmg,
      disabledCards: newDisabledCards
    }))

    game.updatePlayer(newPlayer)

    if (newEnemy.hp <= 0) goScreen(game, "reward");
  },

  endTurn: () => {
    const { enemy, disabledCards, addLog, drawCard, startPlayerRound, startEnemyRound } = get();
    const game = useGameStore.getState();
    if (!enemy) return;

    const outcome = ApplyBoons(BoonTrigger.ROUND_END, {
      player: game.player,
      enemy,
      disabledCards,
    });
    outcome.logs.forEach(addLog);
    game.updatePlayer(outcome.player);
    set({ enemy: outcome.enemy, disabledCards: outcome.disabledCards });
    for (let i = 0; i < outcome.drawCards; i++) drawCard();

    if (outcome.player.hp <= 0) {
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

    const outcome = ApplyBoons(BoonTrigger.ROUND_START, {
      player: game.player,
      enemy,
      disabledCards: tickedDisabled,
    });
    outcome.logs.forEach(addLog);
    game.updatePlayer(outcome.player);
    set({
      round: newRound,
      enemy: outcome.enemy,
      disabledCards: outcome.disabledCards,
    });

    drawCard();
    for (let i = 0; i < outcome.drawCards; i++) drawCard();

    if (outcome.player.hp <= 0) goScreen(game, "gameover");
  },

  startEnemyRound: () => {
    const { enemy, maxEnergy, draw, addLog, round, hand, dmgCaused, dmgTaken } = get();
    const game = useGameStore.getState();
    const player = game.player;

    if (!enemy) return;
    let newEnemy = { ...enemy, status: { ...enemy.status } };
    let newPlayer = { ...player };
    let newDmgCaused = dmgCaused;
    let newDmgTaken = dmgTaken;
    let newDraw = [...draw];
    let newHand: GameCard[] = [...hand];

    const updateState = () => {
      set({
        enemy: newEnemy,
        hand: newHand,
        energy: maxEnergy,
        draw: newDraw,
        dmgCaused: newDmgCaused,
        dmgTaken: newDmgTaken,
      });
      game.updatePlayer(newPlayer);
    }
    // ✅ 1. 玩家回合结束 → 手牌进 discard
    // let newDiscard = [...discard, ...hand.map(c => c.id)]
    addLog(`Round ${round}: 👹 ${enemy.name} turn start!`);
    set({ turn: CharacterType.ENEMY });

    // ✅ 2. 毒伤
    if (newEnemy.status.poison) {
      newEnemy.hp -= newEnemy.status.poison
      newDmgCaused += newEnemy.status.poison;
      addLog(`☠️ Poison: ${newEnemy.status.poison} dmg`)
      newEnemy.status.poison = Math.max(0, newEnemy.status.poison - 1)
    }

    if (newEnemy.hp <= 0) {
      updateState();
      goScreen(game, "reward");
      return;
    }

    // ✅ 3. 敌人攻击
    let atk = newEnemy.atk;

    if (newEnemy.status.weak) {
      atk = Math.floor(atk * 0.75);
      newDmgCaused += atk;
      newEnemy.status.weak--;
    }

    const absorbed = Math.min(newPlayer.block, atk);
    const dmg = atk - absorbed;

    newPlayer.hp -= dmg;
    newDmgTaken += dmg;
    newPlayer.block = 0;

    addLog(`👹 ${enemy.name} attacks ${atk} dmg`);

    if (newPlayer.hp <= 0) {
      updateState();
      goScreen(game, "gameover");
      return;
    }
    updateState();
  },
}))