import { create } from 'zustand'
import { getCard } from '../data/cards'
import { BOSSES } from '../data/bosses'
import { useGameStore } from './game-store'
import type { Enemy, GameScreen } from '../types/game'
import { MAX_HAND_SIZE, type Card } from '../types/card'
import { CharacterType } from "../types/character"

interface BattleState {
  enemy: Enemy | null,
  hand: Card[],
  draw: string[],
  discard: string[],
  energy: number,
  maxEnergy: number,
  turn: CharacterType,
  log: string[],

  addLog: (msg: string) => void
  startBattle: () => void
  playCard: (card: Card) => void
  endTurn: () => void
  resetBattle: () => void
}

const shuffle = <T>(arr: T[]): T[] => {
  const a = [...arr];

  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}

const processVictory = (game: any) => {
  game.addLog('🏆 Victory!')
  game.setScreen('reward')
}

const processDefeat = (game: any) => {
  game.addLog('💀 Defeat!')
  game.setScreen('gameover')
}

export const useBattleStore = create<BattleState>((set, get) => ({
  enemy: null,
  hand: [],
  draw: [],
  discard: [],
  energy: 3,
  maxEnergy: 3,
  turn: CharacterType.PLAYER,
  log: [],

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
    }),

  startBattle: () => {
    const game = useGameStore.getState()
    const bossData = BOSSES[game.floor - 1]

    const enemy: Enemy = {
      ...bossData,
      maxHp: bossData.hp,
      block: 0,
      status: {},
    }

    const draw = shuffle(game.deck);
    const hand = draw.splice(0, MAX_HAND_SIZE).map((id) => getCard(id)!).filter(Boolean);

    set({
      enemy,
      draw,
      discard: [],
      hand,
      turn: CharacterType.PLAYER,
      energy: get().maxEnergy,
    })

    game.setScreen('battle')
    game.addLog(`⚔️ Battle starts vs ${enemy.name}!`);
  },

  playCard: (card) => {
    const { energy, enemy, log } = get();
    const game = useGameStore.getState();
    const player = game.player;
    
    if (energy < card.cost || !enemy) return;
    
    let newEnemy = { ...enemy, status: { ...enemy.status } }
    let newPlayer = { ...player, status: { ...player.status } }
    let newLogs: string[] = [...log];

    switch (card.id) {
      case 'strike':
        newEnemy.hp -= 6;
        newLogs.push('⚔️ Strike: 6 dmg');
        break;
      case 'bash':
        newEnemy.hp -= 8
        newEnemy.status.weak = (newEnemy.status.weak || 0) + 2
        newLogs.push('🔨 Bash: 8 dmg + Weak')
        break
      case 'defend':
        newPlayer.block += 5
        newLogs.push('🛡️ Defend: +5 block')
        break
      case 'fireball':
        newEnemy.hp -= 12
        newLogs.push('🔥 Fireball: 12 dmg')
        break
      case 'heal':
        newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + 6)
        newLogs.push('💊 Heal: +6 HP')
        break
      case 'poison':
        newEnemy.status.poison = (newEnemy.status.poison || 0) + 3
        newLogs.push('🪶 Poison: +3')
        break
      case 'double':
        newEnemy.hp -= 8
        newLogs.push('⚡ Twin Strike: 4+4 dmg')
        break
      case 'armor':
        newPlayer.block += 12
        newLogs.push('🏰 Fortify: +12 block')
        break
      case 'blast':
        newEnemy.hp -= 20
        newLogs.push('💫 Arcane Blast: 20 dmg')
        break
    }

    set((s) => ({
      energy: s.energy - card.cost,
      hand: s.hand.filter((c) => c.id !== card.id),
      discard: [...s.discard, card.id],
      enemy: newEnemy,
      log: newLogs,
    }))

    game.updatePlayer(newPlayer)

    if (newEnemy.hp <= 0) processVictory(game);
  },

  endTurn: () => {
    const { enemy, maxEnergy, draw, discard, hand, log } = get();
    const game = useGameStore.getState();
    const player = game.player;

    if (!enemy) return;

    let newEnemy = { ...enemy, status: { ...enemy.status } };
    let newPlayer = { ...player, status: { ...player.status } };

    let newLogs: string[] = [...log];

    // ✅ 1. 玩家回合结束 → 手牌进 discard
    let newDiscard = [
      ...discard,
      ...hand.map(c => c.id),
    ]

    let newDraw = [...draw]

    // ✅ 2. 毒伤
    if (newEnemy.status.poison) {
      newEnemy.hp -= newEnemy.status.poison
      newLogs.push(`☠️ Poison: ${newEnemy.status.poison} dmg`)
      newEnemy.status.poison = Math.max(0, newEnemy.status.poison - 1)
    }

    if (newEnemy.hp <= 0) {
      set({ enemy: newEnemy, hand: [], discard: newDiscard })
      game.updatePlayer(newPlayer)
      processVictory(game)
      return
    }

    // ✅ 3. 敌人攻击
    let atk = newEnemy.atk

    if (newEnemy.status.weak) {
      atk = Math.floor(atk * 0.75);
      newEnemy.status.weak--;
    }

    const absorbed = Math.min(newPlayer.block, atk)
    const dmg = atk - absorbed

    newPlayer.hp -= dmg
    newPlayer.block = 0

    newLogs.push(`👹 ${enemy.name} attacks ${atk} dmg`)

    if (newPlayer.hp <= 0) {
      set({ enemy: newEnemy, hand: [], discard: newDiscard })
      game.updatePlayer(newPlayer)
      processDefeat(game);
      return;
    }

    // ✅ 4. 抽新手牌
    let newHand: Card[] = [...hand];
    let newCards = newDraw.map(id => getCard(id)).filter(Boolean);
    if (newCards.length > 0) newHand = [...newHand, newCards[0]];

    // ✅ 5. 更新 state
    set({
      enemy: newEnemy,
      draw: newDraw,
      discard: newDiscard,
      hand: newHand,
      energy: maxEnergy,
      log: newLogs,
    })

    game.updatePlayer(newPlayer);
  }
}))