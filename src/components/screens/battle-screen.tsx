import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { useGameStore } from "../../stores/game-store.ts"
import type { Card } from "../../types/game.ts"
import { Layout } from "../shared/layout.tsx"

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
              <div className="font-semibold mb-2 text-2xl uppercase">
                {enemy.name}
              </div>

              <HpBar current={enemy.hp} max={enemy.maxHp} color="#E24B4A" />

              <div className="text-gray-400 text-sm mt-2">
                {enemy.hp}/{enemy.maxHp} HP · {enemy.block} block
              </div>

              {/* 敌人 */}
              <div id="enemy-target">
                <div style={{ fontSize: 80, marginBottom: 6 }}>
                  {enemy.emoji}
                </div>

                <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                  Intent: ⚔️ {enemy.atk} dmg
                </div>

                {Object.entries(enemy.status).map(
                  ([k, v]) =>
                    v > 0 && (
                      <StatusBadge key={k} label={`${k} ${v}`} debuff />
                    )
                )}
              </div>
            </center>
          </div>
        </div>

        <div className="border-t border-t-gray-200">
          {/* 能量 + 结束回合 */}
          <div>
            <HpBar current={player.hp} max={player.maxHp} color="#1D9E75" />

            <div className="flex items-center justify-between px-4 py-2 gap-4">
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

          {/* 手牌区 */}
          <div className="p-4 border-t border-gray-200">
            <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
              Hand ({hand.length})
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {hand.map((card) => (
                <CardComponent
                  key={card.id}
                  card={card}
                  canPlay={energy >= card.cost && !playingCard}
                  onPlay={() => handlePlayCard(card)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function HpBar({
  current,
  max,
  color,
}: {
  current: number
  max: number
  color: string
}) {
  const pct = Math.max(0, (current / max) * 100)

  return (
    <div
      style={{
        height: 20,
        background: "#eee",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: color,
          transition: "width 0.3s",
          borderRadius: 3,
        }}
      />
    </div>
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