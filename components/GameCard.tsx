'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Game } from '@/types';
import { Play, Star, Users, ImageIcon } from 'lucide-react';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Safe defaults for potentially undefined properties
  const tags = game.tags || [];
  const playCount = game.playCount || 0;
  const rating = game.rating || 0;
  const ratingCount = game.ratingCount || 0;
  const category = game.category || 'Game';
  const featured = game.featured || false;

  return (
    <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 border border-gray-100">
      {/* Game Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        {game.thumbnail && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
            <Image
              src={game.thumbnail}
              alt={game.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover group-hover:scale-110 transition-transform duration-700 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              unoptimized={false}
            />
          </>
        ) : (
          // Fallback UI
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="h-16 w-16 text-blue-500 opacity-60 mx-auto mb-2" />
              <p className="text-blue-600 font-medium text-sm">{game.title}</p>
            </div>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform duration-500 border border-white/30">
            <Play className="h-8 w-8 text-white ml-1" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          {featured && (
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              ⭐ Featured
            </span>
          )}
          <span className="bg-black/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full border border-white/20">
            {category}
          </span>
        </div>

        {/* Stats Overlay */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 border border-white/30">
            <div className="flex items-center space-x-1 text-white text-xs">
              <Users className="h-3 w-3" />
              <span>{playCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Game Info */}
      <div className="p-6">
        <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors duration-300">
          {game.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {game.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{playCount.toLocaleString()} plays</span>
          </div>
          
          {ratingCount > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-100"
              >
                {tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="text-gray-400 text-xs self-center">+{tags.length - 2}</span>
            )}
          </div>
        )}

        {/* Play Button */}
        <Link
          href={`/game/${game.id}`}
          className="group/btn w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Play className="h-5 w-5 group-hover/btn:scale-110 transition-transform duration-300" />
          <span>Play Now</span>
        </Link>
      </div>
    </div>
  );
}