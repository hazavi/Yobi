// filepath: types/index.ts
export interface KeyboardControl {
  key: string;
  action: string;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  category: string;
  tags: string[];
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
  playCount: number;
  rating: number;
  ratingCount: number;
  keyboardControls?: KeyboardControl[];
}

export type GameCategory = 
  | 'Action'
  | 'Adventure'
  | 'Puzzle'
  | 'Racing'
  | 'Sports'
  | 'Strategy'
  | 'Arcade'
  | 'Shooting';