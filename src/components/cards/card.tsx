import CardImg from "../../assets/card/card.png"
import type { Card } from "../../types/card"

export const CardItem = ({ card, disabled }: { card: Card, disabled?: boolean }) => {
  return (
    <div className={`relative w-50 aspect-3/4 ${disabled ? "grayscale-25 brightness-150" : ""} transition-all`}>
      <p className="absolute top-1.5 left-5 z-30 text-white text-2xl">{card.cost}</p>
      <div className="bg-gray-800 absolute z-10 overflow-hidden flex flex-col justify-between items-center text-center pt-4 pl-6 pr-5 pb-10 
        left-[10%] right-[7%] top-[7%] bottom-[2%]">
        <p className="text-white text-lg font-semibold line-clamp-2">{card.name}</p>
        <p className="text-4xl">{card.icon}</p>
        <p className="text-white text-xs leading-relaxed line-clamp-5">{card.description}</p>
      </div>
      <p className="absolute bottom-0.75 left-1/2 -translate-x-1/2 z-30 text-gray-100 uppercase text-xs">{card.type}</p>
      {/* 卡牌边框 */}
      <img
        src={CardImg}
        className={`absolute inset-0 z-20 w-full h-full object-contain pointer-events-none ${disabled ? "grayscale-75 brightness-150" : ""}`}
        draggable={false}
      />
    </div>
  )
}