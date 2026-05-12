import { create } from 'zustand'
import { GetCardDeck } from '../data/cards'
import type { GameScreen, Player } from '../types/game'
import type { Card, CardCode, GameCard } from '../types/card'
import type { Boon } from "../types/boons"
import { ALL_BOONS } from "../data/boons"
import { Shuffle } from "../utilities/general"

interface GameState {
  screen: GameScreen
  floor: number
  player: Player
  gold: number
  deck: GameCard[]
  log: string[]

  discardedBoons: Boon[]

  startGame: () => void
  setScreen: (screen: GameScreen) => void
  addLog: (msg: string) => void
  addCardToDeck: (card: GameCard) => void
  nextFloor: () => void
  updatePlayer: (player: Player) => void
  // 人物福佑
  getAvailableBoons: (count: number) => Boon[]
  getBoon: (name: string) => Boon | undefined
  addBoon: (boon: Boon) => void
  discardBoon: (boon: Boon) => void
}

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'entry',
  floor: 1,
  player: { hp: 10, maxHp: 80, block: 0, boons: [] },
  gold: 0,
  deck: [],
  log: [],
  discardedBoons: [],

  addLog: (msg) =>
    set((s) => ({
      log: [msg, ...s.log].slice(0, 20),
    })),

  setScreen: (screen) => set({ screen }),

  startGame: () => {
    set({
      floor: 1,
      player: { hp: 80, maxHp: 80, block: 0, boons:[] },
      deck: [...GetCardDeck()],
      gold: 0,
      log: [],
      screen: 'map',
      discardedBoons: [],
    })
  },

  updatePlayer: (player) => set({ player }),

  addCardToDeck: (card) =>
    set((s) => ({
      deck: [...s.deck, card],
    })),

  nextFloor: () => {
    const { floor } = get()

    if (floor >= 10) {
      set({ screen: 'win' })
      return
    }

    set({
      floor: floor + 1,
      screen: 'map',
    })
  },

  // 人物福佑
  getAvailableBoons: (count: number) => Shuffle(ALL_BOONS.filter(b => !get().player.boons.some(d => d.name === b.name))).slice(0, count),
  getBoon: (name: string) => ALL_BOONS.find(b => b.name === name),
  addBoon: (boon: Boon) => set((s) => ({ player: { ...s.player, boons: [...s.player.boons, boon] } })),
  discardBoon: (boon: Boon) => set((s) => ({ discardedBoons: [...s.discardedBoons, boon] })),
})) 