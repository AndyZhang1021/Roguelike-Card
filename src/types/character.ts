export interface Character {
  id: CharacterType,
  name: string,
  description: string,
  imgUrl: string,
}

export type CharacterType = 'enemy' | 'player'