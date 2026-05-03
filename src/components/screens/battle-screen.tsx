import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { useGameStore } from "../../stores/game-store.ts"
import { Layout } from "../shared/layout.tsx"
import { Heart, Shield } from 'lucide-react';
import { EnemyCard } from "../enemies/enemy-card.tsx"
import type { Card } from "../../types/card.ts";
import { CardItem } from "../cards/card.tsx";

export default function BattleScreen() {
  const player = useGameStore((s) => s.player)
  const enemy = useGameStore((s) => s.enemy)
  const hand = useGameStore((s) => s.hand)
  const energy = useGameStore((s) => s.energy)
  const maxEnergy = useGameStore((s) => s.maxEnergy)
  const playCard = useGameStore((s) => s.playCard)
  const endTurn = useGameStore((s) => s.endTurn)

  const [playingCard, setPlayingCard] = useState<Card | null>(null)

  if (!enemy) return null

  const handlePlayCard = (card: Card) => {
    if (playingCard) return
    setPlayingCard(card)
  }

  return (
    <Layout>
      <div className="relative flex flex-col justify-between h-full overflow-hidden">
        <AnimatePresence>
          {playingCard && (
            <motion.div key={`flying-${playingCard.id}`}
              initial={{
                position: "fixed",
                left: "50%",
                bottom: 110,
                x: "-50%",
                y: 0,
                scale: 1,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                y: -380,
                x: "calc(-50% + 100px)",
                scale: 1,
                opacity: .8,
                rotate: 18,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              onAnimationComplete={() => {
                playCard(playingCard)
                setPlayingCard(null)
              }}
              style={{
                width: 88,
                minHeight: 120,
                zIndex: 9999,
                pointerEvents: "none",
              }}>
              <CardComponent card={playingCard} canPlay={true} onPlay={() => { }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 h-1/2">
          {/* 顶部状态栏 */}
          <div className="border-b border-gray-200 flex items-center gap-4 text-[#666] p-4">
            <span>❤️ {player.hp}/{player.maxHp}</span>
            <span>🛡️ {player.block}</span>
          </div>

          {/* 战斗区 */}
          <div>
            <center className="p-8">
            <EnemyCard enemy={enemy} />
              <div className="text-gray-400 text-sm mt-2">
                {enemy.hp}/{enemy.maxHp} HP · {enemy.block} block
              </div>

              {/* 敌人 */}
              {/* <div id="enemy-target">
                {Object.entries(enemy.status).map(
                  ([k, v]) =>
                    v > 0 && (
                      <StatusBadge key={k} label={`${k} ${v}`} debuff />
                    )
                )}
              </div> */}
            </center>
          </div>
        </div>

        <div className="flex">
          <div className="w-1/6 flex flex-col justify-end">
            <center>
              <div className="rounded-full h-32 w-32 flex flex-col items-center border justify-center mb-14">
                <p className="text-2xl"><span className="text-4xl">3</span>/{maxEnergy}</p>
                <p>Energy</p>
              </div>
            </center>
            {/* 能量 + 结束回合 */}
            <div className="flex items-center gap-1 w-full border relative">
              <div className="border rounded h-32 w-1/4"></div>
              <div className="flex-1">
                <p>Adventurer</p>
                <div className="bg-sky-400 rounde-sm w-full text-white text-center relative">
                  <Shield strokeWidth={1} stroke="black" fill="cyan" className="absolute top-1/2 left-0 -translate-y-1/2" />
                  <p>72/80</p>
                </div>
                <div className="bg-red-400 rounde-sm w-full text-white text-center relative">
                  <Heart strokeWidth={1} stroke="black" fill="red" className="absolute top-1/2 left-0 -translate-y-1/2" />
                  <p>72/80</p>
                </div>
                <div className="flex gap-3 items-center mt-2">
                  <div className="w-5 h-5 rotate-45 flex items-center justify-center border">
                    <span className="-rotate-45 text-sm">S</span>
                  </div>
                  <div className="w-5 h-5 rotate-45 flex items-center justify-center border">
                    <span className="-rotate-45 text-sm">B</span>
                  </div>
                  <div className="w-5 h-5 rotate-45 flex items-center justify-center border">
                    <span className="-rotate-45 text-sm">B</span>
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="flex items-center justify-between px-4 py-2 gap-4">
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "#888" }}>Energy</span>

                  {Array.from({ length: maxEnergy }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: i < energy ? "#534AB7" : "#eee",
                        border: "1px solid #ddd",
                      }}
                    />
                  ))}
                </div>

                <center className="flex-1">
                  <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                    {player.hp}/{player.maxHp} HP · {player.block} block
                  </div>
                </center>
              </div> */}
          </div>

          {/* 手牌区 */}
          <div className="flex-1 flex flex-col justify-end">
            <div className="p-4 -mb-10 mx-auto">
              <div className="flex flex-wrap gap-2 justify-center">
                {hand.map((card) => (
                  <CardItem card={card} key={card.id} />
                ))}
              </div>
            </div>
            <div className="border border-b-0 h-14 w-full rounded-t-full" />
          </div>

          <div className="w-1/6 flex items-center justify-center">
            <button
              onClick={endTurn}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "1px solid #ddd",
                background: "#fff",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              End turn →
            </button>
          </div>
        </div>

      </div>
    </Layout>
  )
}


function StatusBadge({
  label,
  debuff,
}: {
  label: string
  debuff?: boolean
}) {
  return (
    <span
      style={{
        display: "inline-block",
        marginTop: 4,
        marginRight: 4,
        padding: "2px 8px",
        borderRadius: 99,
        fontSize: 11,
        background: debuff ? "#FCEBEB" : "#E1F5EE",
        color: debuff ? "#A32D2D" : "#0F6E56",
      }}
    >
      {label}
    </span>
  )
}

function CardComponent({
  card,
  canPlay,
  onPlay,
}: {
  card: Card
  canPlay: boolean
  onPlay: () => void
}) {
  return (
    <motion.div
      onClick={() => canPlay && onPlay()}
      whileHover={canPlay ? { y: -8 } : undefined}
      whileTap={canPlay ? { scale: 0.96 } : undefined}
      transition={{ duration: 0.15 }}
      style={{
        width: 88,
        minHeight: 120,
        border: `1px solid ${canPlay ? "#aaa" : "#eee"}`,
        borderRadius: 10,
        padding: "10px 8px",
        background: "#fff",
        opacity: canPlay ? 1 : 0.45,
        cursor: canPlay ? "pointer" : "not-allowed",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        position: "relative",
      }}
    >
      {/* 费用 */}
      <div
        style={{
          position: "absolute",
          top: 6,
          right: 7,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#534AB7",
          color: "#fff",
          fontSize: 11,
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {card.cost}
      </div>

      <span style={{ fontSize: 22 }}>{card.icon}</span>

      <div style={{ fontSize: 11, fontWeight: 500 }}>{card.name}</div>

      <div
        style={{
          fontSize: 9,
          color: "#aaa",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {card.type}
      </div>

      <div
        style={{
          fontSize: 10,
          color: "#888",
          marginTop: "auto",
          lineHeight: 1.4,
        }}
      >
        {card.desc}
      </div>
    </motion.div>
  )
}