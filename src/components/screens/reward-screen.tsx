import { BOSSES } from '../../data/bosses'
import { useBattleStore } from "../../stores/battle-store"
import { useGameStore } from "../../stores/game-store"
import { Layout } from "../shared/layout"

export const RewardScreen = () => {
  const floor = useGameStore((s) => s.floor);
  const round = useBattleStore((s) => s.round);
  const dmgCaused = useBattleStore((s) => s.dmgCaused);
  const dmgTaken = useBattleStore((s) => s.dmgTaken);

  const resetBattle = useBattleStore((s) => s.resetBattle);
  const setScreen = useGameStore((s) => s.setScreen);
  const nextFloor = useGameStore((s) => s.nextFloor);

  const proceedNext = () => {
    setScreen("map");
    nextFloor();
    resetBattle();
  }

  return (
    <Layout>
      <div className="w-full h-full flex items-center justify-center">
        <div className="border rounded p-4">
          <p>You Win — Floor {floor}</p>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <p className="text-center">Round {round}</p>
            <p className="text-center">💥 DMG Caused: {dmgCaused}</p>
            <p className="text-center">💥 DMG Taken: {dmgTaken}</p>
          </div>
          <center className="mt-6">
            <button className="border px-4 py-2 rounded" onClick={proceedNext}>Next</button>
          </center>
        </div>
      </div>
    </Layout>
  )
}

export default RewardScreen;