// filepath: types/index.ts
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