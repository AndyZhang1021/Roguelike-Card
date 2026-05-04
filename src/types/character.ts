export interface Character {
  id: CharacterType,
  name: string,
  description: string,
  imgUrl: string,
}

export enum CharacterType {
  ENEMY = 'enemy',
  PLAYER = 'player',
}