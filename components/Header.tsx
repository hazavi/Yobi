'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { GamepadIcon, Search, User, Menu, X, Settings, LogOut } from 'lucide-react';

export default function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Search functionality
  useEffect(() => {
    const searchGames = async () => {
      if (searchQuery.trim().length > 2) {
        try {
          const { getAllGames } = await import('@/lib/gameUtils');
          const games = await getAllGames();
          const filteredGames = games.filter(game =>
            game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            game.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            game.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          );
          setSearchResults(filteredGames.slice(0, 5)); // Limit to 5 results
          setShowSearchResults(true);
        } catch (error) {
          console.error('Error searching games:', error);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    };

    const debounceTimer = setTimeout(searchGames, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearchSelect = (gameId: string) => {
    router.push(`/game/${gameId}`);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/games?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearchResults(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <GamepadIcon className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Yobi</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </form>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {searchResults.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => handleSearchSelect(game.id)}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <img
                      src={game.thumbnail}
                      alt={game.title}
                      className="w-10 h-10 rounded object-cover mr-3"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-game.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{game.title}</div>
                      <div className="text-sm text-gray-500">{game.category}</div>
                    </div>
                  </div>
                ))}
                {searchQuery.trim().length > 2 && (
                  <div
                    onClick={() => handleSearchSubmit(new Event('submit') as any)}
                    className="p-3 text-center text-blue-600 hover:bg-gray-50 cursor-pointer border-t"
                  >
                    See all results for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            <Link href="/games" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Games
            </Link>
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <User className="h-5 w-5" />
                  <span>{getUserDisplayName()}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-medium">{getUserDisplayName()}</div>
                      <div className="text-gray-500">{user.email}</div>
                    </div>
                    
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/signin"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {/* Search Bar - Mobile */}
              <form onSubmit={handleSearchSubmit} className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </form>

              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/games"
                className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Games
              </Link>

              {user ? (
                <div className="border-t border-gray-200 pt-4">
                  <div className="px-3 py-2">
                    <div className="text-base font-medium text-gray-800">{getUserDisplayName()}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                  
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-blue-600 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4">
                  <Link
                    href="/auth/signin"
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-blue-600 hover:bg-blue-700 text-white block px-3 py-2 rounded-md text-base font-medium mx-3 mt-2 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}