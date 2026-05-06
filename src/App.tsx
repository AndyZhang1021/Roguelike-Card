import MapScreen from "./components/screens/map-screen"
import EntryScreen from "./components/screens/entry-screen"
import { useGameStore } from "./stores/game-store"
import BattleScreen from "./components/screens/battle-screen"
import RewardScreen from "./components/screens/reward-screen"
import GameOverScreen from "./components/screens/gameover-screen"

const App = () => {
  const screen = useGameStore((s) => s.screen)
  return (
    <>
      {screen === 'entry' && <EntryScreen />}
      {screen === 'map' && <MapScreen />}
      {screen === 'battle' && <BattleScreen />}
      {screen === 'reward' && <RewardScreen />}
      {screen === 'gameover' && <GameOverScreen />}
      {screen === 'win' && <div>You Win — TODO</div>}
    </>
  )
}

export default App