import BattleScreen from "./components/battle-screen"
import MapScreen from "./components/map-screens"
import { useGameStore } from "./stores/game-store"

function App() {
  const screen = useGameStore((s) => s.screen)

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16 }}>
      {screen === 'map'      && <MapScreen />}
      {screen === 'battle'   && <BattleScreen />}
      {screen === 'reward'   && <div>Reward — TODO</div>}
      {screen === 'gameover' && <div>Game Over — TODO</div>}
      {screen === 'win'      && <div>You Win — TODO</div>}
    </div>
  )
}

export default App