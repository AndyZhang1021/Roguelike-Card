import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { useGameStore } from "../../stores/game-store.ts"
import { useBattleStore } from "../../stores/battle-store.ts";
import { Layout } from "../shared/layout.tsx"
import { Heart, Settings, Shield } from 'lucide-react';
import { EnemyCard } from "../enemies/enemy-card.tsx"
import { MAX_HAND_LIMIT, type Card, type GameCard } from "../../types/card.ts";
import { CardItem } from "../cards/card.tsx";
import Hero from "../../assets/hero.png";
import { IsZero } from "../../utilities/field-validation.ts";

const BattleScreen = () => {
  const player = useGameStore((s) => s.player);
  const floor = useGameStore((s) => s.floor);
  const log = useBattleStore((s) => s.log);
  const enemy = useBattleStore((s) => s.enemy);
  const hand = useBattleStore((s) => s.hand);
  const energy = useBattleStore((s) => s.energy);
  const maxEnergy = useBattleStore((s) => s.maxEnergy);
  const deck = useGameStore((s) => s.deck);
  const draw = useBattleStore((s) => s.draw);
  const discard = useBattleStore((s) => s.discard);
  const playCard = useBattleStore((s) => s.playCard);
  const discardCard = useBattleStore((s) => s.discardCard);
  const endTurn = useBattleStore((s) => s.endTurn);
  const startBattle = useBattleStore((s) => s.startBattle);
  const setScreen = useGameStore((s) => s.setScreen);

  const [playingCard, setPlayingCard] = useState<GameCard | null>(null);
  const [sourceRect, setSourceRect] = useState<DOMRect | null>(null);
  const [discardMode, setDiscardMode] = useState(false);
  const hasPlayedRef = useRef(false);

  const excessCount = Math.max(0, hand.length - MAX_HAND_LIMIT);

  useEffect(() => {
    if (discardMode && hand.length <= MAX_HAND_LIMIT) {
      setDiscardMode(false);
    }
  }, [discardMode, hand.length]);

  const discardedCards = useMemo(() => {
    return deck.filter((c) => discard.includes(c.id))
  }, [deck, discard]);

  if (!enemy) {
    startBattle();
    return;
  }

  const handlePlayCard = (card: GameCard, rect: DOMRect) => {
    if (playingCard) return;
    if (discardMode) {
      discardCard(card);
      return handleEndTurn();
    }
    hasPlayedRef.current = false;
    setSourceRect(rect);
    setPlayingCard(card);
  }

  const handleEndTurn = () => {
    const currentHand = useBattleStore.getState().hand;
    if (currentHand.length > MAX_HAND_LIMIT) return setDiscardMode(true);
    setDiscardMode(false);
    endTurn();
  }

  return (
    <Layout>
      <div className="relative flex flex-col justify-between h-full overflow-hidden">
        <AnimatePresence>
          {playingCard && sourceRect && (
            <motion.div key={`flying-${playingCard.id}`}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.18 } }}
              initial={{
                position: "fixed",
                left: sourceRect.left,
                top: sourceRect.top,
                width: sourceRect.width,
                height: sourceRect.height,
                x: 0, y: 0, scale: 1, opacity: 1, rotate: 0,
              }}
              animate={{
                y: [0, -180, -200, -380],
                x: [0, 0, 0, 100],
                scale: [1, 1.12, 1.12, 0.95],
                rotate: [0, -2, 0, 18],
                opacity: [1, 1, 1, 0],
                filter: [
                  "drop-shadow(0 0 0 rgba(255,220,140,0))",
                  "drop-shadow(0 0 18px rgba(255,220,140,.85))",
                  "drop-shadow(0 0 18px rgba(255,220,140,.85))",
                  "drop-shadow(0 0 0 rgba(255,220,140,0))",
                ],
              }}
              transition={{
                duration: 0.9,
                times: [0, 0.22, 0.55, 1],
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              style={{ zIndex: 9999, pointerEvents: "none" }}
              onAnimationComplete={() => {
                if (hasPlayedRef.current) return;
                if (!playingCard) return;

                hasPlayedRef.current = true;
                playCard(playingCard);
                setPlayingCard(null);
                setSourceRect(null);
              }}>
              <CardItem card={playingCard} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 h-1/2">
          {/* 顶部状态栏 */}
          <div className="border-b border-gray-200 flex items-center justify-between gap-4 text-[#666] p-4">
            <p>Floor {floor}</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setScreen('map')}>
                <Settings />
              </button>
            </div>
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
                  {player.boons.map((b, i) => <div className="w-6 h-6 flex items-center justify-center border shadow-lg rounded border-gray-200">
                    <span className="text-sm">{b.icon}</span>
                  </div>)}
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
          </div>

          {/* 手牌区 */}
          <div className="flex-1 flex flex-col justify-end">
            <div className="p-4 -mb-10 mx-auto">
              <CardOnHand
                cards={hand}
                energy={energy}
                playingCard={playingCard}
                discardMode={discardMode}
                onPlayCard={handlePlayCard}
              />
            </div>
            <div className="border border-b-0 h-14 w-full rounded-t-full" />
          </div>

          <div className="w-1/6 flex flex-col items-center justify-center">
            <button
              onClick={discardMode ? () => setDiscardMode(false) : handleEndTurn}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "1px solid #ddd",
                background: discardMode ? "#fff5f5" : "#fff",
                cursor: "pointer",
                color: discardMode ? "#dc2626" : undefined,
                fontSize: 13,
              }}
            >
              {discardMode ? "Cancel" : "End turn →"}
            </button>
            {discardMode && (
              <p className="text-xs text-red-500 mt-1 text-center">
                Discard {excessCount} more card{excessCount > 1 ? 's' : ''}
              </p>
            )}
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

const CardOnHand = ({ cards, energy, playingCard, discardMode, onPlayCard }: { cards: Card[], energy: number, playingCard: GameCard | null, discardMode: boolean, onPlayCard: (card: GameCard, rect: DOMRect) => void }) => {
  const disabledCards = useBattleStore((s) => s.disabledCards);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>();
  const visibleCards = cards.filter((c): c is GameCard => Boolean(c));
  const total = visibleCards.length;
  const center = (total - 1) / 2;

  const onClickCard = (canClick: boolean, card: GameCard, e: MouseEvent<HTMLDivElement>) => {
    if (!canClick) return;
    onPlayCard(card, e.currentTarget.getBoundingClientRect());
  }

  return (
    <div className="relative h-65 w-full flex justify-center">
      <div className="relative w-full h-full">
        {visibleCards.map((card, i) => {
          const offset = i - center

          const spread = Math.max(50, 120 - total * 2)
          const rotate = offset * 2
          const y = Math.pow(offset, 2) * 2

          const isHovered = hoveredIndex === i
          const isPlaying = playingCard?.id === card.id
          const canPlay = energy >= card.cost && !playingCard
          const disabled = disabledCards.some(c => c.card.type === card.type && c.round > 0);
          const canClick = discardMode ? !playingCard : (canPlay && !disabled);
          return (
            <motion.div
              key={card.id}
              className="absolute left-1/2 bottom-0"
              onMouseEnter={() => !isPlaying && setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={(e) => onClickCard(canClick, card, e)}
              animate={{
                x: offset * spread,
                y: isPlaying ? y : (isHovered ? -70 : y),
                rotate: isPlaying ? rotate : (isHovered ? 0 : rotate),
                scale: isPlaying ? 1 : (isHovered ? 1.08 : 1),
                opacity: isPlaying ? 0 : 1,
                filter: discardMode && isHovered
                  ? "drop-shadow(0 0 14px rgba(248,113,113,.9))"
                  : "drop-shadow(0 0 0 rgba(0,0,0,0))",
              }}
              whileTap={canClick ? { scale: 0.98 } : undefined}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              style={{
                translateX: "-50%",
                transformOrigin: "bottom center",
                zIndex: isHovered ? 999 : i,
                cursor: canClick ? "pointer" : "not-allowed",
                pointerEvents: playingCard ? "none" : "auto",
              }}
            >
              <CardItem card={card} disabled={!discardMode && (!canPlay || disabled)} />
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
