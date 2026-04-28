import BattleScreen from "./components/screens/battle-screen"
import MapScreen from "./components/screens/map-screens"
import EntryScreen from "./components/screens/entry-screen"
import { useGameStore } from "./stores/game-store"

const App = () => {
  const screen = useGameStore((s) => s.screen)
  return (
    <>
      {screen === 'entry' && <EntryScreen />}
      {screen === 'map' && <MapScreen />}
      {screen === 'battle' && <BattleScreen />}
      {screen === 'reward' && <div>Reward — TODO</div>}
      {screen === 'gameover' && <div>Game Over — TODO</div>}
      {screen === 'win' && <div>You Win — TODO</div>}
    </>
  )
}

export default App