import { useGameStore } from "../stores/game-store"
import type { Card } from "../types/game"


export default function BattleScreen() {
  const player = useGameStore((s) => s.player)
  const enemy = useGameStore((s) => s.enemy)
  const hand = useGameStore((s) => s.hand)
  const energy = useGameStore((s) => s.energy)
  const maxEnergy = useGameStore((s) => s.maxEnergy)
  const log = useGameStore((s) => s.log)
  const playCard = useGameStore((s) => s.playCard)
  const endTurn = useGameStore((s) => s.endTurn)

  if (!enemy) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* 顶部状态栏 */}
      <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#666' }}>
        <span>❤️ {player.hp}/{player.maxHp}</span>
        <span>🛡️ {player.block}</span>
      </div>

      {/* 战斗区 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* 玩家 */}
        <div style={{ padding: 14, border: '1px solid #ddd', borderRadius: 10, background: '#fff' }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>🧙</div>
          <div style={{ fontWeight: 500, marginBottom: 6 }}>You</div>
          <HpBar current={player.hp} max={player.maxHp} color="#1D9E75" />
          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
            {player.hp}/{player.maxHp} HP · {player.block} block
          </div>
          {Object.entries(player.status).map(([k, v]) => v > 0 && (
            <StatusBadge key={k} label={`${k} ${v}`} />
          ))}
        </div>

        {/* 敌人 */}
        <div style={{ padding: 14, border: '1px solid #f5a5a5', borderRadius: 10, background: '#fff9f9' }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>{enemy.emoji}</div>
          <div style={{ fontWeight: 500, marginBottom: 6 }}>{enemy.name}</div>
          <HpBar current={enemy.hp} max={enemy.maxHp} color="#E24B4A" />
          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
            {enemy.hp}/{enemy.maxHp} HP · {enemy.block} block
          </div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
            Intent: ⚔️ {enemy.atk} dmg
          </div>
          {Object.entries(enemy.status).map(([k, v]) => v > 0 && (
            <StatusBadge key={k} label={`${k} ${v}`} debuff />
          ))}
        </div>
      </div>

      {/* 战斗日志 */}
      <div style={{
        background: '#f9f9f9', border: '1px solid #eee',
        borderRadius: 8, padding: '8px 12px',
        fontSize: 12, color: '#666',
        maxHeight: 72, overflowY: 'auto',
        lineHeight: 1.8,
      }}>
        {log.slice(0, 5).map((l, i) => <div key={i}>{l}</div>)}
      </div>

      {/* 能量 + 结束回合 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#888' }}>Energy</span>
          {Array.from({ length: maxEnergy }).map((_, i) => (
            <div key={i} style={{
              width: 20, height: 20, borderRadius: '50%',
              background: i < energy ? '#534AB7' : '#eee',
              border: '1px solid #ddd',
            }} />
          ))}
        </div>
        <button
          onClick={endTurn}
          style={{
            padding: '8px 18px', borderRadius: 8,
            border: '1px solid #ddd', background: '#fff',
            cursor: 'pointer', fontSize: 13,
          }}
        >
          End turn →
        </button>
      </div>

      {/* 手牌 */}
      <div>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
          Hand ({hand.length})
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {hand.map((card) => (
            <CardComponent
              key={card.id + Math.random()}
              card={card}
              canPlay={energy >= card.cost}
              onPlay={() => playCard(card)}
            />
          ))}
        </div>
      </div>

    </div>
  )
}

// 子组件

function HpBar({ current, max, color }: { current: number; max: number; color: string }) {
  const pct = Math.max(0, (current / max) * 100)
  return (
    <div style={{ height: 6, background: '#eee', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.3s', borderRadius: 3 }} />
    </div>
  )
}

function StatusBadge({ label, debuff }: { label: string; debuff?: boolean }) {
  return (
    <span style={{
      display: 'inline-block', marginTop: 4, marginRight: 4,
      padding: '2px 8px', borderRadius: 99, fontSize: 11,
      background: debuff ? '#FCEBEB' : '#E1F5EE',
      color: debuff ? '#A32D2D' : '#0F6E56',
    }}>
      {label}
    </span>
  )
}

function CardComponent({ card, canPlay, onPlay }: { card: Card; canPlay: boolean; onPlay: () => void }) {
  return (
    <div
      onClick={() => canPlay && onPlay()}
      style={{
        width: 88, minHeight: 120,
        border: `1px solid ${canPlay ? '#aaa' : '#eee'}`,
        borderRadius: 10, padding: '10px 8px',
        background: '#fff',
        opacity: canPlay ? 1 : 0.45,
        cursor: canPlay ? 'pointer' : 'not-allowed',
        transition: 'transform 0.15s',
        display: 'flex', flexDirection: 'column', gap: 4,
        position: 'relative',
      }}
      onMouseEnter={e => { if (canPlay) (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-8px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
    >
      {/* 费用 */}
      <div style={{
        position: 'absolute', top: 6, right: 7,
        width: 20, height: 20, borderRadius: '50%',
        background: '#534AB7', color: '#fff',
        fontSize: 11, fontWeight: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {card.cost}
      </div>
      <span style={{ fontSize: 22 }}>{card.icon}</span>
      <div style={{ fontSize: 11, fontWeight: 500 }}>{card.name}</div>
      <div style={{ fontSize: 9, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 }}>{card.type}</div>
      <div style={{ fontSize: 10, color: '#888', marginTop: 'auto', lineHeight: 1.4 }}>{card.desc}</div>
    </div>
  )
}