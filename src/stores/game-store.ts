import { create } from 'zustand'
import { STARTER_DECK } from '../data/cards'
import type { GameScreen, Player } from '../types/game'
import type { Card } from '../types/card'

interface GameState {
  screen: GameScreen
  floor: number
  player: Player
  gold: number
  deck: string[]
  log: string[]

  startGame: () => void
  setScreen: (screen: GameScreen) => void
  addLog: (msg: string) => void
  addCardToDeck: (card: Card) => void
  nextFloor: () => void
  updatePlayer: (player: Player) => void
}

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'entry',
  floor: 1,
  player: { hp: 80, maxHp: 80, block: 0, status: {} },
  gold: 0,
  deck: [...STARTER_DECK],
  log: [],

  addLog: (msg) =>
    set((s) => ({
      log: [msg, ...s.log].slice(0, 20),
    })),

  setScreen: (screen) => set({ screen }),

  startGame: () =>
    set({
      floor: 1,
      player: { hp: 80, maxHp: 80, block: 0, status: {} },
      deck: [...STARTER_DECK],
      gold: 0,
      log: [],
      screen: 'map',
    }),

  updatePlayer: (player) => set({ player }),

  addCardToDeck: (card) =>
    set((s) => ({
      deck: [...s.deck, card.id],
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
}))