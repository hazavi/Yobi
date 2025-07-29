'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import GameCard from '@/components/GameCard';
import { Game } from '@/types';
import { getFeaturedGames, getAllGames } from '@/lib/gameUtils';
import { Gamepad, Star, Clock, ArrowRight } from 'lucide-react';

export default function Home() {
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGames() {
      try {
        const [featured, all] = await Promise.all([
          getFeaturedGames(),
          getAllGames()
        ]);
        
        setFeaturedGames(featured);
        setRecentGames(all.slice(0, 8));
        setAllGames(all);
      } catch (error) {
        console.error('Error loading games:', error);
      } finally {
        setLoading(false);
      }
    }

    loadGames();
  }, []);

  const LoadingSkeleton = ({ count = 8, cols = "lg:grid-cols-4" }) => (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${cols} gap-6`}>
      {[...Array(count)].map((_, i) => (
        <div 
          key={i} 
          className="group animate-pulse"
          style={{animationDelay: `${i * 100}ms`}}
        >
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300"></div>
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-32">
      <div className="relative inline-block">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <Gamepad className="h-12 w-12 text-blue-500" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping opacity-75"></div>
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">Games Coming Soon!</h3>
      <p className="text-gray-600 max-w-md mx-auto">
        Amazing games are being added to our collection. Check back soon!
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Header />
      
      <main className="relative">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 rounded-full opacity-10 blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-200 rounded-full opacity-10 blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-3/4 w-64 h-64 bg-cyan-200 rounded-full opacity-10 blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>

        {/* Featured Games */}
        {(featuredGames.length > 0 || loading) && (
          <section className="relative py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full font-bold mb-4 animate-fade-in">
                  <Star className="h-4 w-4" />
                  <span>Featured</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-slide-up">
                  <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Handpicked Games
                  </span>
                </h2>
              </div>
              
              {loading ? (
                <LoadingSkeleton count={6} cols="lg:grid-cols-3" />
              ) : featuredGames.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredGames.map((game, index) => (
                    <div 
                      key={game.id} 
                      className="transform hover:scale-105 transition-all duration-500 animate-fade-in-up" 
                      style={{animationDelay: `${index * 150}ms`}}
                    >
                      <GameCard game={game} />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        )}

        {/* Recent Games */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-full font-bold mb-4 animate-fade-in">
                <Clock className="h-4 w-4" />
                <span>Latest</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-slide-up">
                <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                  Fresh Arrivals
                </span>
              </h2>
            </div>
            
            {loading ? (
              <LoadingSkeleton />
            ) : recentGames.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentGames.map((game, index) => (
                  <div 
                    key={game.id} 
                    className="transform hover:scale-105 transition-all duration-300 animate-fade-in-up" 
                    style={{animationDelay: `${index * 100}ms`}}
                  >
                    <GameCard game={game} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </section>

        {/* All Games */}
        {(allGames.length > 8 || loading) && (
          <section className="relative py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-full font-bold mb-4 animate-fade-in">
                    <Gamepad className="h-4 w-4" />
                    <span>All Games</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold animate-slide-up">
                    <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      Complete Collection
                    </span>
                  </h2>
                </div>
                {allGames.length > 8 && (
                  <a 
                    href="/games" 
                    className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white px-6 py-3 rounded-full font-bold transition-all duration-300 transform hover:scale-105 animate-fade-in"
                  >
                    <span>View All</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </div>
              
              {loading ? (
                <LoadingSkeleton count={12} />
              ) : allGames.length > 8 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {allGames.slice(8, 20).map((game, index) => (
                      <div 
                        key={game.id} 
                        className="transform hover:scale-105 transition-all duration-300 animate-fade-in-up" 
                        style={{animationDelay: `${index * 80}ms`}}
                      >
                        <GameCard game={game} />
                      </div>
                    ))}
                  </div>
                  
                  {allGames.length > 20 && (
                    <div className="text-center mt-12">
                      <a 
                        href="/games" 
                        className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-purple-500/25 animate-fade-in"
                      >
                        <span>Explore All {allGames.length} Games</span>
                        <ArrowRight className="h-5 w-5" />
                      </a>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </section>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="relative bg-gray-900/95 backdrop-blur-sm text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4 animate-fade-in">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Gamepad className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Yobi</span>
            </div>
            <p className="text-gray-400 mb-6 animate-fade-in" style={{animationDelay: '200ms'}}>
              The ultimate destination for online gaming
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400 animate-fade-in" style={{animationDelay: '400ms'}}>
              <a href="/games" className="hover:text-white transition-colors">All Games</a>
              <a href="/about" className="hover:text-white transition-colors">About</a>
              <a href="/contact" className="hover:text-white transition-colors">Contact</a>
              <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-6 text-gray-500 text-sm animate-fade-in" style={{animationDelay: '600ms'}}>
              &copy; 2025 Yobi. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
