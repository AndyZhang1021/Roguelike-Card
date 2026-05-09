import { create } from 'zustand'
import { getCard } from '../data/cards'
import { BOSSES } from '../data/bosses'
import { useGameStore } from './game-store'
import type { Enemy, GameScreen } from '../types/game'
import { CardCode, MAX_HAND_SIZE, type Card, type GameCard } from '../types/card'
import { CharacterType } from "../types/character"
import { Shuffle } from "../utilities/general"

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

  addLog: (msg: string) => void
  startBattle: () => void
  playCard: (card: GameCard) => void
  endTurn: () => void
  resetBattle: () => void
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
    get().resetBattle();
    const game = useGameStore.getState()
    const bossData = BOSSES[game.floor - 1]

    const enemy: Enemy = {
      ...bossData,
      maxHp: bossData.hp,
      block: 0,
      status: {},
    }
    
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
    })

    game.setScreen('battle')
    game.addLog(`⚔️ Battle starts vs ${enemy.name}!`);
  },

  playCard: (card) => {
    const { energy, enemy, log, addLog } = get();
    const game = useGameStore.getState();
    const player = game.player;

    if (energy < card.cost || !enemy) return;

    let newEnemy = { ...enemy, status: { ...enemy.status } };
    let newPlayer = { ...player, status: { ...player.status } };

    switch (card.code) {
      case CardCode.STRIKE:
        newEnemy.hp -= 96;
        addLog('⚔️ Strike: 6 dmg');
        break;
      case CardCode.BASH:
        newEnemy.hp -= 8
        newEnemy.status.weak = (newEnemy.status.weak || 0) + 2
        addLog('🔨 Bash: 8 dmg + Weak')
        break
      case CardCode.DEFEND:
        newPlayer.block += 5
        addLog('🛡️ Defend: +5 block')
        break
      case CardCode.FIREBALL:
        newEnemy.hp -= 12
        addLog('🔥 Fireball: 12 dmg')
        break
      case CardCode.HEAL:
        newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + 6)
        addLog('💊 Heal: +6 HP')
        break
      case CardCode.POISON:
        newEnemy.status.poison = (newEnemy.status.poison || 0) + 3
        addLog('🪶 Poison: +3')
        break
      case CardCode.DOUBLE:
        newEnemy.hp -= 8
        addLog('⚡ Twin Strike: 4+4 dmg')
        break
      case CardCode.ARMOR:
        newPlayer.block += 12
        addLog('🏰 Fortify: +12 block')
        break
      case CardCode.BLAST:
        newEnemy.hp -= 20
        addLog('💫 Arcane Blast: 20 dmg')
        break
    }
    
    set((s) => ({
      energy: s.energy - card.cost,
      hand: s.hand.filter((c) => c.id !== card.id),
      discard: [...s.discard, card.id],
      enemy: newEnemy,
      dmgCaused: enemy.hp - newEnemy.hp,
    }))

    game.updatePlayer(newPlayer)

    if (newEnemy.hp <= 0) goScreen(game, "reward");
  },

  endTurn: () => {
    const { enemy, maxEnergy, draw, addLog, hand, round, dmgCaused, dmgTaken } = get();
    const game = useGameStore.getState();
    const player = game.player;

    if (!enemy) return;
    let newRound = round + 1;
    let newEnemy = { ...enemy, status: { ...enemy.status } };
    let newPlayer = { ...player, status: { ...player.status } };
    let newDmgCaused = dmgCaused;
    let newDmgTaken = dmgTaken;
    let newDraw = [...draw];
    let newHand: GameCard[] = [...hand];

    const updateState = () => {
      set({
        enemy: newEnemy,
        hand: newHand,
        energy: maxEnergy,
        round: newRound,
        draw: newDraw,
        dmgCaused: newDmgCaused,
        dmgTaken: newDmgTaken,
      });
      game.updatePlayer(newPlayer);
    }

    // ✅ 1. 玩家回合结束 → 手牌进 discard
    // let newDiscard = [...discard, ...hand.map(c => c.id)]
    addLog(`Round ${newRound}: 👹 ${enemy.name} turn start!`);
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

    // ✅ 4. 抽新手牌
    newRound++;
    addLog(`Round ${newRound}: Player turn start!`);
    console.log("newDraw", newDraw)
    if (newDraw.length == 0) newDraw = Shuffle(game.deck.filter((c) => !newHand.some((h) => h.id === c.id)));
    if (newDraw.length > 0) {
      newHand = [...newHand, newDraw[0]];
      newDraw.splice(0, 1);
    }
    console.log("newDraw", newDraw)

    // ✅ 5. 更新 state
    updateState();
  }
}))