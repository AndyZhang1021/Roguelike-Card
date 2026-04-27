import BattleScreen from "./components/screens/battle-screen"
import MapScreen from "./components/screens/map-screens"
import EntryScreen from "./components/screens/entry-screen"
import { useGameStore } from "./stores/game-store"

function App() {
  const screen = useGameStore((s) => s.screen)

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16 }}>
      {screen === 'entry' && <EntryScreen />}
      {screen === 'main' && <MainScreen />}
      {screen === 'map' && <MapScreen />}
      {screen === 'battle' && <BattleScreen />}
      {screen === 'reward' && <div>Reward — TODO</div>}
      {screen === 'gameover' && <div>Game Over — TODO</div>}
      {screen === 'win' && <div>You Win — TODO</div>}
    </div>
  )
}

export default App