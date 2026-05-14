import { useEffect, useState } from "react"
import { BOSSES } from '../../data/bosses'
import { useBattleStore } from "../../stores/battle-store"
import { useGameStore } from "../../stores/game-store"
import type { Boon } from "../../types/boons"
import { Layout } from "../shared/layout"

export const RewardScreen = () => {
  const floor = useGameStore((s) => s.floor);
  const round = useBattleStore((s) => s.round);
  const dmgCaused = useBattleStore((s) => s.dmgCaused);
  const dmgTaken = useBattleStore((s) => s.dmgTaken);
  const getAvailableBoons = useGameStore((s) => s.getAvailableBoons);
  const addBoon = useGameStore((s) => s.addBoon);
  const discardBoon = useGameStore((s) => s.discardBoon);
  const resetBattle = useBattleStore((s) => s.resetBattle);
  const setScreen = useGameStore((s) => s.setScreen);
  const nextFloor = useGameStore((s) => s.nextFloor);

  const [availableBoons, setAvailableBoons] = useState<Boon[]>([]);
  const [selectedBoon, setSelectedBoon] = useState<Boon | null>(null);

  useEffect(() => {
    setAvailableBoons(getAvailableBoons(3));
  }, []);

  const proceedNext = () => {
    if (availableBoons.length > 0) {
      if (!selectedBoon) return;
      else addBoon(selectedBoon);
    }
    setScreen("map");
    nextFloor();
  }

  return (
    <Layout>
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="border rounded p-4">
          <p>You Win — Floor {floor}</p>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <p className="text-center">Round {round}</p>
            <p className="text-center">💥 DMG Caused: {dmgCaused}</p>
            <p className="text-center">💥 DMG Taken: {dmgTaken}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {availableBoons.map((boon: Boon, i) => {
            const isSelected = selectedBoon?.name === boon.name;
            return (
              <button key={i} className={`border ${isSelected ? "border-amber-500 bg-amber-50" : ""} rounded p-4 mt-4 text-center`}
                onClick={() => setSelectedBoon(boon)}>
                <p className="font-semibold">{boon.name}</p>
                <p className="text-2xl">{boon.icon}</p>
                <p className="font-light text-sm">{boon.description}</p>
                <span className="inline-block border px-4 py-2 rounded mt-4">
                  {selectedBoon?.name === boon.name ? "Selected" : "Select"}
                </span>
              </button>
            )
          })}
        </div>
        <center className="mt-6">
          <button
            className="border px-4 py-2 rounded"
            disabled={availableBoons.length > 0 && !selectedBoon}
            onClick={proceedNext}>Next</button>
        </center>
      </div>
    </Layout>
  )
}

export default RewardScreen;