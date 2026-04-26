import { create } from 'zustand'
import { STARTER_DECK, getCard } from '../data/cards'
import { BOSSES } from '../data/bosses'
import type { GameScreen, Player, Enemy, Card } from "../types/game"

interface GameState {
  screen: GameScreen
  floor: number
  player: Player
  enemy: Enemy | null
  hand: Card[]
  draw: string[]
  discard: string[]
  energy: number
  maxEnergy: number
  gold: number
  log: string[]
  deck: string[]

  // actions
  startGame: () => void
  startBattle: () => void
  playCard: (card: Card) => void
  endTurn: () => void
  addCardToDeck: (card: Card) => void
  nextFloor: () => void
  setScreen: (screen: GameScreen) => void
  addLog: (msg: string) => void
}

const shuffle = <T>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'map',
  floor: 1,
  player: { hp: 80, maxHp: 80, block: 0, status: {} },
  enemy: null,
  hand: [],
  draw: [],
  discard: [],
  energy: 3,
  maxEnergy: 3,
  gold: 0,
  log: [],
  deck: [...STARTER_DECK],

  addLog: (msg) => set((s) => ({
    log: [msg, ...s.log].slice(0, 20)
  })),

  setScreen: (screen) => set({ screen }),

  startGame: () => set({
    floor: 1,
    player: { hp: 80, maxHp: 80, block: 0, status: {} },
    deck: [...STARTER_DECK],
    gold: 0,
    log: [],
    screen: 'map',
  }),

  startBattle: () => {
    const { floor, deck, maxEnergy, addLog } = get()
    const bossData = BOSSES[floor - 1]
    const enemy: Enemy = { ...bossData, maxHp: bossData.hp, block: 0, status: {} }
    const draw = shuffle(deck)

    // 摸5张
    const hand = draw.splice(0, 5).map(id => getCard(id)!).filter(Boolean)

    set({ screen: 'battle', enemy, draw, discard: [], hand, energy: maxEnergy })
    addLog(`⚔️ Battle starts vs ${enemy.name}!`)
  },

  playCard: (card) => {
    const { energy, enemy, player, addLog } = get()
    if (energy < card.cost || !enemy) return

    let newEnemy = { ...enemy }
    let newPlayer = { ...player }

    // 卡牌效果
    switch (card.id) {
      case 'strike':   newEnemy.hp -= 6; addLog('⚔️ Strike: 6 dmg'); break
      case 'bash':     newEnemy.hp -= 8; newEnemy.status.weak = (newEnemy.status.weak||0)+2; addLog('🔨 Bash: 8 dmg + Weak'); break
      case 'defend':   newPlayer.block += 5; addLog('🛡️ Defend: +5 block'); break
      case 'fireball': newEnemy.hp -= 12; addLog('🔥 Fireball: 12 dmg'); break
      case 'heal':     newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp+6); addLog('💊 Heal: +6 HP'); break
      case 'poison':   newEnemy.status.poison = (newEnemy.status.poison||0)+3; addLog('🪶 Poison: +3'); break
      case 'double':   newEnemy.hp -= 8; addLog('⚡ Twin Strike: 4+4 dmg'); break
      case 'armor':    newPlayer.block += 12; addLog('🏰 Fortify: +12 block'); break
      case 'blast':    newEnemy.hp -= 20; addLog('💫 Arcane Blast: 20 dmg'); break
    }

    set((s) => ({
      energy: s.energy - card.cost,
      hand: s.hand.filter(c => c.id !== card.id),
      discard: [...s.discard, card.id],
      enemy: newEnemy,
      player: newPlayer,
    }))

    if (newEnemy.hp <= 0) {
      addLog('🏆 Victory!')
      set({ screen: 'reward' })
    }
  },

  endTurn: () => {
    const { enemy, player, maxEnergy, draw, discard, deck, addLog } = get()
    if (!enemy) return

    // 毒伤
    let newEnemy = { ...enemy }
    if (newEnemy.status.poison) {
      newEnemy.hp -= newEnemy.status.poison
      newEnemy.status.poison = Math.max(0, newEnemy.status.poison - 1)
      addLog(`☠️ Poison: ${enemy.status.poison} dmg`)
    }

    // 敌人攻击
    let atk = newEnemy.atk
    if (newEnemy.status.weak) { atk = Math.floor(atk * 0.75); newEnemy.status.weak-- }
    const absorbed = Math.min(player.block, atk)
    const dmg = atk - absorbed
    const newPlayer = { ...player, hp: player.hp - dmg, block: 0 }
    addLog(`👹 ${enemy.name} attacks ${atk} dmg${absorbed > 0 ? ` (${absorbed} blocked)` : ''}`)

    // 重新摸牌
    let newDraw = [...draw]
    let newDiscard = [...discard]
    if (newDraw.length < 5) {
      newDraw = [...newDraw, ...shuffle(newDiscard)]
      newDiscard = []
    }
    const newHand = newDraw.splice(0, 5).map(id => getCard(id)!).filter(Boolean)

    set({ enemy: newEnemy, player: newPlayer, draw: newDraw, discard: newDiscard, hand: newHand, energy: maxEnergy })

    if (newPlayer.hp <= 0) set({ screen: 'gameover' })
    if (newEnemy.hp <= 0) { addLog('🏆 Victory!'); set({ screen: 'reward' }) }
  },

  addCardToDeck: (card) => set((s) => ({
    deck: [...s.deck, card.id]
  })),

  nextFloor: () => {
    const { floor } = get()
    if (floor >= 10) { set({ screen: 'win' }); return }
    set({ floor: floor + 1, screen: 'map' })
  },
}))