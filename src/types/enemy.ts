export interface Enemy {
  name: string,
  description: string,
  imgUrl: string,
  emoji: string
  hp: number
  maxHp: number
  block: number
  atk: number
  status: Record<string, number>
}