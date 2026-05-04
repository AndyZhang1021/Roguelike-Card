import { BOSSES } from '../../data/bosses'
import { useBattleStore } from "../../stores/battle-store"
import { useGameStore } from "../../stores/game-store"

export const MapScreen = () => {
  const floor = useGameStore((s) => s.floor)
  const player = useGameStore((s) => s.player)
  const gold = useGameStore((s) => s.gold)
  const deck = useGameStore((s) => s.deck)
  const startBattle = useBattleStore((s) => s.startBattle)

  const onClickMapNode = () => {
    
  }

  return (
    <div className="container mx-auto px-4">
      {/* 顶部状态栏 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, fontSize: 14 }}>
        <span>❤️ {player.hp}/{player.maxHp}</span>
        <span>🪙 {gold}</span>
        <span>🃏 {deck.length} cards</span>
        <span>📍 Floor {floor}</span>
      </div>

      {/* 地图 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[...BOSSES].reverse().map((boss, i) => {
          const bossFloor = BOSSES.length - i  // 10 → 1
          const isDone = bossFloor < floor
          const isCurrent = bossFloor === floor
          const isLocked = bossFloor > floor

          return (
            <div
              key={bossFloor}
              onClick={() => isCurrent && startBattle()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 10,
                border: isCurrent ? '2px solid #1D9E75' : '1px solid #ddd',
                background: isDone ? '#f5f5f5' : isCurrent ? '#E1F5EE' : '#fff',
                opacity: isLocked ? 0.4 : 1,
                cursor: isCurrent ? 'pointer' : 'default',
                transition: 'transform 0.1s',
              }}
              onMouseEnter={e => { if (isCurrent) (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)' }}
            >
              <span style={{ fontSize: 28 }}>
                {isDone ? '✅' : boss.emoji}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 15 }}>
                  Floor {bossFloor} — {boss.name}
                </div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                  HP {boss.hp} · ATK {boss.atk}
                </div>
              </div>
              {isCurrent && (
                <span style={{ fontSize: 13, color: '#1D9E75', fontWeight: 500 }}>
                  Enter →
                </span>
              )}
              {isDone && (
                <span style={{ fontSize: 12, color: '#aaa' }}>Cleared</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MapScreen;