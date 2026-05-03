import CardImg from "../../assets/card/card.png";
import type { Card } from "../../types/card";

export const CardItem = ({ card }: { card: Card }) => {
  return (
    <div className="h-80 w-40 relative">
      <div className="relative z-10 h-full w-full flex flex-col justify-between pt-12 pb-8 px-6">
        <div className="flex items-center justify-between">
          <p className="text-white text-2xl">{card.name}</p>
          <p className="text-white">⚔️ {card.cost}</p>
        </div>
        <p className="text-7xl">{card.icon}</p>
        <div className="bg-red-700 w-full rounded-full text-white text-center h-3">
        </div>
      </div>
      <img src={CardImg} className="absolute top-0 left-0 w-full h-full object-contain" />
    </div>
  )
}

