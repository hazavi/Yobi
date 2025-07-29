import { ref, push, set, get, update, remove } from 'firebase/database';
import { Game } from '@/types';

// Helper function to get database instance
async function getDatabase() {
  const { database } = await import('@/lib/firebase');
  if (!database) {
    throw new Error('Firebase database not initialized');
  }
  return database;
}

export async function addGame(gameData: Omit<Game, 'id' | 'createdAt' | 'updatedAt' | 'playCount' | 'rating' | 'ratingCount'>) {
  try {
    const database = await getDatabase();
    const gamesRef = ref(database, 'games');
    const newGameRef = push(gamesRef);
    
    const game: Omit<Game, 'id'> = {
      ...gameData,
      tags: gameData.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      playCount: 0,
      rating: 0,
      ratingCount: 0,
    };
    
    await set(newGameRef, game);
    return newGameRef.key;
  } catch (error) {
    console.error('Error adding game:', error);
    throw error;
  }
}

export async function getAllGames(): Promise<Game[]> {
  try {
    const database = await getDatabase();
    const gamesRef = ref(database, 'games');
    const snapshot = await get(gamesRef);
    
    if (snapshot.exists()) {
      const gamesData = snapshot.val();
      return Object.entries(gamesData).map(([id, gameData]: [string, any]) => ({
        id,
        ...gameData,
        tags: gameData.tags || [],
        playCount: gameData.playCount || 0,
        rating: gameData.rating || 0,
        ratingCount: gameData.ratingCount || 0,
        createdAt: gameData.createdAt ? new Date(gameData.createdAt) : new Date(),
        updatedAt: gameData.updatedAt ? new Date(gameData.updatedAt) : new Date(),
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
}

export async function getFeaturedGames(): Promise<Game[]> {
  try {
    const games = await getAllGames();
    return games.filter(game => game.featured);
  } catch (error) {
    console.error('Error fetching featured games:', error);
    return [];
  }
}

export async function getGameById(id: string): Promise<Game | null> {
  try {
    const database = await getDatabase();
    const gameRef = ref(database, `games/${id}`);
    const snapshot = await get(gameRef);
    
    if (snapshot.exists()) {
      const gameData = snapshot.val();
      return {
        id,
        ...gameData,
        tags: gameData.tags || [],
        playCount: gameData.playCount || 0,
        rating: gameData.rating || 0,
        ratingCount: gameData.ratingCount || 0,
        createdAt: gameData.createdAt ? new Date(gameData.createdAt) : new Date(),
        updatedAt: gameData.updatedAt ? new Date(gameData.updatedAt) : new Date(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching game:', error);
    return null;
  }
}

export async function updateGame(id: string, gameData: Partial<Omit<Game, 'id' | 'createdAt'>>) {
  try {
    const database = await getDatabase();
    const gameRef = ref(database, `games/${id}`);
    const updateData = {
      ...gameData,
      tags: gameData.tags || [],
      updatedAt: new Date(),
    };
    
    await update(gameRef, updateData);
  } catch (error) {
    console.error('Error updating game:', error);
    throw error;
  }
}

export async function deleteGame(id: string) {
  try {
    const database = await getDatabase();
    const gameRef = ref(database, `games/${id}`);
    await remove(gameRef);
  } catch (error) {
    console.error('Error deleting game:', error);
    throw error;
  }
}

export async function incrementPlayCount(id: string) {
  try {
    const database = await getDatabase();
    const gameRef = ref(database, `games/${id}`);
    const snapshot = await get(gameRef);
    
    if (snapshot.exists()) {
      const currentData = snapshot.val();
      const newPlayCount = (currentData.playCount || 0) + 1;
      
      await update(gameRef, {
        playCount: newPlayCount,
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error incrementing play count:', error);
    throw error;
  }
}

export async function rateGame(id: string, rating: number) {
  try {
    const database = await getDatabase();
    const gameRef = ref(database, `games/${id}`);
    const snapshot = await get(gameRef);
    
    if (snapshot.exists()) {
      const currentData = snapshot.val();
      const currentRating = currentData.rating || 0;
      const currentRatingCount = currentData.ratingCount || 0;
      
      const newRatingCount = currentRatingCount + 1;
      const newRating = ((currentRating * currentRatingCount) + rating) / newRatingCount;
      
      await update(gameRef, {
        rating: newRating,
        ratingCount: newRatingCount,
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error rating game:', error);
    throw error;
  }
}