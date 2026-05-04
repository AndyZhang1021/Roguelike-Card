import EnemyCardImg from "../../assets/character/enemy.png";
import type { Enemy } from "../../types/enemy";

export const EnemyCard = ({ enemy }: { enemy: Enemy }) => {
  return (
    <div className="h-105 w-65 relative">
      <div className="relative z-10 h-full w-full flex flex-col justify-between pt-12 pb-8 px-6">
        <div className="flex items-center justify-between">
          <p className="text-white text-2xl">{enemy.name}</p>
          <p className="text-white">⚔️ {enemy.atk}</p>
        </div>
        <p className="text-7xl">{enemy.emoji}</p>
        <div className="bg-red-700 w-full rounded-full text-white text-center h-3">
          <p className="text-xl -mt-4">{enemy.hp}/{enemy.maxHp}</p>
        </div>
      </div>
      <img src={EnemyCardImg} className="absolute top-0 left-0 w-full h-full object-contain" />
    </div>
  )
}

