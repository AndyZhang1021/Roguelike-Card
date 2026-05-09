import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { useGameStore } from "../../stores/game-store.ts"
import { useBattleStore } from "../../stores/battle-store.ts";
import { Layout } from "../shared/layout.tsx"
import { Heart, Shield } from 'lucide-react';
import { EnemyCard } from "../enemies/enemy-card.tsx"
import type { Card, GameCard } from "../../types/card.ts";
import { CardItem } from "../cards/card.tsx";
import Hero from "../../assets/hero.png";
import { IsZero } from "../../utilities/field-validation.ts";

const BattleScreen = () => {
  const player = useGameStore((s) => s.player);
  const log = useBattleStore((s) => s.log);
  const enemy = useBattleStore((s) => s.enemy);
  const hand = useBattleStore((s) => s.hand);
  const energy = useBattleStore((s) => s.energy);
  const maxEnergy = useBattleStore((s) => s.maxEnergy);
  const deck = useGameStore((s) => s.deck);
  const draw = useBattleStore((s) => s.draw);
  const discard = useBattleStore((s) => s.discard);
  const playCard = useBattleStore((s) => s.playCard);
  const endTurn = useBattleStore((s) => s.endTurn);
  const startBattle = useBattleStore((s) => s.startBattle);

  const [playingCard, setPlayingCard] = useState<GameCard | null>(null);
  const hasPlayedRef = useRef(false);

  const discardedCards = useMemo(() => {
    return deck.filter((c) => discard.includes(c.id))
  }, [deck, discard]);

  if (!enemy) {
    startBattle();
    return;
  }

  const handlePlayCard = (card: GameCard) => {
    if (playingCard) return;
    hasPlayedRef.current = false;
    setPlayingCard(card)
  }

  return (
    <Layout>
      <div className="relative flex flex-col justify-between h-full overflow-hidden">
        <AnimatePresence>
          {playingCard && (
            <motion.div key={`flying-${playingCard.id}`}
              exit={{ opacity: 0 }}
              initial={{ position: "fixed", left: "50%", bottom: 110, x: "-50%", y: 0, scale: 1, opacity: 1, rotate: 0 }}
              animate={{ y: -380, x: "calc(-50% + 100px)", scale: 1, opacity: .8, rotate: 18 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              style={{ width: 88, minHeight: 120, zIndex: 9999, pointerEvents: "none" }}
              onAnimationComplete={() => {
                if (hasPlayedRef.current) return;
                if (!playingCard) return;

                hasPlayedRef.current = true;
                playCard(playingCard);
                setPlayingCard(null);
              }}>
              <CardItem card={playingCard} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 h-1/2">
          {/* 顶部状态栏 */}
          <div className="border-b border-gray-200 flex items-center gap-4 text-[#666] p-4">
            {/* <span>❤️ {player.hp}/{player.maxHp}</span>
            <span>🛡️ {player.block}</span> */}
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
                <p className="text-2xl"><span className="text-4xl">{energy}</span>/{maxEnergy}</p>
                <p>Energy</p>
              </div>
            </center>
            {/* 能量 + 结束回合 */}
            <div className="flex items-center gap-1 w-full border relative">
              <div className="border rounded h-32 w-20">
                <img src={Hero} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <p className="mb-2">Adventurer</p>
                {!IsZero(player.block) && <div className="bg-sky-400 rounde-sm w-full text-white text-center relative">
                  <Shield strokeWidth={1} stroke="black" fill="cyan" className="absolute top-1/2 left-0 -translate-y-1/2" />
                  <p>{player.block}</p>
                </div>}
                <div className="bg-red-400 rounde-sm w-full text-white text-center relative">
                  <Heart strokeWidth={1} stroke="black" fill="red" className="absolute top-1/2 left-0 -translate-y-1/2" />
                  <p>{player.hp}/{player.maxHp}</p>
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
            <div style={{
              background: '#f9f9f9', border: '1px solid #eee',
              borderRadius: 8, padding: '8px 12px',
              fontSize: 12, color: '#666',
              maxHeight: 72, overflowY: 'auto',
              lineHeight: 1.8,
            }}>
              {log.slice(0, 5).map((l, i) => <div key={i}>{l}</div>)}
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
              <CardOnHand
                cards={hand}
                energy={energy}
                playingCard={playingCard}
                onPlayCard={handlePlayCard}
              />
            </div>
            <div className="border border-b-0 h-14 w-full rounded-t-full" />
          </div>

          <div className="w-1/6 flex flex-col items-center justify-center">
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
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p>In Deck ({draw.length})</p>
                <div className="h-50 overflow-auto">
                  {draw.map((card) => <p className="text-xsm">{card.icon} {card.name}</p>)}
                </div>
              </div>
              <div>
                <p>Discard ({discardedCards.length})</p>
                <div className="h-50 overflow-auto">
                  {discardedCards.map((card) => <p className="text-xsm">{card.icon} {card.name}</p>)}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  )
}

const CardOnHand = ({ cards, energy, playingCard, onPlayCard }: { cards: Card[], energy: number, playingCard: Card | null, onPlayCard: (card: Card) => void }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>();
  const total = cards.length;
  const center = (total - 1) / 2;

  const onClickCard = (canPlay: boolean, card: Card) => {
    if (!canPlay) return;
    onPlayCard(card);
  }

  return (
    <div className="relative h-65 w-full flex justify-center">
      <div className="relative w-full h-full">
        {cards.filter(Boolean).map((card: any, i: number) => {
          const offset = i - center

          const spread = Math.max(50, 120 - total * 2)
          const rotate = offset * 2
          const y = Math.pow(offset, 2) * 2

          const isHovered = hoveredIndex === i
          const canPlay = energy >= card?.cost && !playingCard

          return (
            <motion.div
              key={`${card.id}_${i}`}
              className="absolute left-1/2 bottom-0"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onClickCard(canPlay, card)}
              animate={{
                x: offset * spread,
                y: isHovered ? -70 : y,
                rotate: isHovered ? 0 : rotate,
                scale: isHovered ? 1.08 : 1,
              }}
              whileTap={canPlay ? { scale: 0.98 } : undefined}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              style={{
                translateX: "-50%",
                transformOrigin: "bottom center",
                zIndex: isHovered ? 999 : i,
                cursor: canPlay ? "pointer" : "not-allowed",
                pointerEvents: playingCard ? "none" : "auto",
              }}
            >
              <CardItem card={card} disabled={!canPlay} />
            </motion.div>
          )
        })}
      </div>
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

export default BattleScreen;
