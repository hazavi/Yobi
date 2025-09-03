'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Game } from '@/types';
import { getGameById, incrementPlayCount } from '@/lib/gameUtils';
import { ArrowLeft, Maximize2, Star, Users, Calendar, Tag, RotateCcw, Home, ExternalLink } from 'lucide-react';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [playCountIncremented, setPlayCountIncremented] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameIframeRef, setGameIframeRef] = useState<HTMLIFrameElement | null>(null);

  const toggleFullscreen = () => {
    if (!gameIframeRef) return;
    
    if (!isFullscreen) {
      // Enter fullscreen
      if (gameIframeRef.requestFullscreen) {
        gameIframeRef.requestFullscreen();
      } else if ((gameIframeRef as any).webkitRequestFullscreen) {
        (gameIframeRef as any).webkitRequestFullscreen();
      } else if ((gameIframeRef as any).msRequestFullscreen) {
        (gameIframeRef as any).msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    async function loadGame() {
      try {
        const gameData = await getGameById(gameId);
        
        if (gameData) {
          setGame(gameData);
          
          // Increment play count once when the page loads
          if (!playCountIncremented) {
            await incrementPlayCount(gameId);
            setPlayCountIncremented(true);
          }
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error loading game:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }

    if (gameId) {
      loadGame();
    }
  }, [gameId, router, playCountIncremented]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="aspect-[16/9] bg-gray-200 rounded-lg mb-6"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Game not found</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

  <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Game Frame */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-3 py-2 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">{game.title}</h1>
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center justify-center w-10 h-10 text-gray-700 hover:cursor-pointer text-black transition-colors duration-200"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  <Maximize2 className="h-5 w-5" />
                </button>
              </div>
              
              {/* Game iframe with 16:9 aspect ratio */}
              <div className="relative w-full" style={{ paddingBottom: '56.25%' /* slightly taller than 16:9 */ }}>
                <iframe
                  ref={setGameIframeRef}
                  src={game.url}
                  className="absolute top-0 left-0 w-full h-full border-0"
                  allowFullScreen
                  title={game.title}
                  allow="fullscreen; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </div>
            </div>
          </div>

          {/* Game Info Sidebar */}
          <div className="space-y-6">
            {/* Game Details */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Game Details</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm leading-relaxed">{game.description}</p>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{(game.playCount + 1).toLocaleString()} plays</span>
                  </div>
                  
                  {game.ratingCount > 0 && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{game.rating.toFixed(1)} ({game.ratingCount})</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Added {new Date(game.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {game.category}
                  </span>
                  {game.featured && (
                    <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      Featured
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            {game.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-5">
                <div className="flex items-center space-x-2 mb-4">
                  <Tag className="h-5 w-5 text-gray-400" />
                  <h2 className="text-lg font-bold text-gray-900">Tags</h2>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {game.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors duration-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Keyboard Controls */}
            {game.keyboardControls && game.keyboardControls.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Keyboard Controls</h2>
                
                {/* Check if we have WASD or Arrow keys for special layout */}
                {(() => {
                  const wasdKeys = game.keyboardControls.filter(c => ['w', 'a', 's', 'd'].includes(c.key.toLowerCase()));
                  const arrowKeys = game.keyboardControls.filter(c => ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(c.key));
                  
                  return (
                    <div className="space-y-4">
                      {/* Two-column main clusters */}
                      <div className="flex flex-wrap gap-6">
                        {wasdKeys.length > 0 && (
                          <div className="flex flex-col items-center hover:cursor-default">
                            <KeyboardLayout type="wasd" controls={wasdKeys} />
                          </div>
                        )}
                        {arrowKeys.length > 0 && (
                          <div className="flex flex-col items-center hover:cursor-default">
                            <KeyboardLayout type="arrows" controls={arrowKeys} />
                          </div>
                        )}
                      </div>
                      {/* Other / bottom row keys (includes Space, Shift, etc.) */}
                      {(() => {
                        const otherKeys = game.keyboardControls.filter(c => 
                          !['w', 'a', 's', 'd'].includes(c.key.toLowerCase()) &&
                          !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(c.key)
                        );
                        if (otherKeys.length === 0) return null;
                        // Put space key ("Space") in center if exists
                        const spaceControl = otherKeys.find(k => k.key === 'Space');
                        const nonSpace = otherKeys.filter(k => k.key !== 'Space');
                        return (
                          <div className="flex flex-wrap items-center gap-2 justify-center ">
                            {nonSpace.map((control, i) => (
                              <div key={i} className="flex items-center space-x-1 hover:cursor-default">
                                <KeyboardKey keyName={control.key} />
                                <span className="text-gray-700 text-[11px] leading-none">{control.action}</span>
                              </div>
                            ))}
                            {spaceControl && (
                              <div className="flex items-center space-x-1 hover:cursor-default">
                                <KeyboardKey keyName={spaceControl.key} />
                                <span className="text-gray-700 text-[11px] leading-none">{spaceControl.action}</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// KeyboardKey component to display keyboard keys that look realistic
function KeyboardKey({ keyName }: { keyName: string }) {
  const getKeyDisplay = (key: string) => {
    const keyMap: { [key: string]: { display: string; isWide?: boolean; isArrow?: boolean } } = {
      // Arrow Keys
      'ArrowUp': { display: '↑', isArrow: true },
      'ArrowDown': { display: '↓', isArrow: true },
      'ArrowLeft': { display: '←', isArrow: true },
      'ArrowRight': { display: '→', isArrow: true },
      
      // Special Keys
      'Space': { display: 'Space', isWide: true },
      'Enter': { display: 'Enter', isWide: true },
      'Shift': { display: 'Shift', isWide: true },
      'Ctrl': { display: 'Ctrl' },
      'Alt': { display: 'Alt' },
      'Tab': { display: 'Tab' },
      'Escape': { display: 'Esc' },
    };
    
    const keyInfo = keyMap[key];
    if (keyInfo) return keyInfo;
    
    return { display: key.toUpperCase() };
  };

  const keyInfo = getKeyDisplay(keyName);
  
  // Base styles for all keys - smaller size
  const baseStyles = "inline-flex items-center justify-center h-7 text-xs font-mono font-semibold text-gray-800 bg-gradient-to-b from-gray-50 to-gray-200 border-2 border-gray-300 rounded shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-150";
  
  // Width styles based on key type - smaller
  let widthStyles = "min-w-[28px] px-2";
  if (keyInfo.isWide) {
    // Wider base for general wide keys
    widthStyles = "min-w-[60px] px-2";
  }
  // Special super-wide styling for Space explicitly
  if (keyName === 'Space') {
    widthStyles = "min-w-[140px] px-4";
  }
  
  // Special styling for arrow keys
  let specialStyles = "";
  if (keyInfo.isArrow) {
    specialStyles = "text-sm";
  }

  return (
    <div className={`${baseStyles} ${widthStyles} ${specialStyles}`}>
      <span>{keyInfo.display}</span>
    </div>
  );
}

// KeyboardLayout component for showing keys in proper keyboard arrangement
function KeyboardLayout({ type, controls }: { type: 'wasd' | 'arrows', controls: any[] }) {
  const getControlForKey = (key: string) => {
    return controls.find(c => c.key.toLowerCase() === key.toLowerCase());
  };

  if (type === 'wasd') {
    const wKey = getControlForKey('w');
    const aKey = getControlForKey('a');
    const sKey = getControlForKey('s');
    const dKey = getControlForKey('d');

    return (
      <div className="flex flex-col items-center space-y-2">
        {/* W key */}
        <div className="flex justify-center">
          {wKey && (
            <div className="flex flex-col items-center space-y-1">
              <KeyboardKey keyName="w" />
              <span className="text-xs text-gray-600 text-center max-w-[60px]">{wKey.action}</span>
            </div>
          )}
        </div>
        
        {/* A S D keys */}
        <div className="flex space-x-2">
          {aKey && (
            <div className="flex flex-col items-center space-y-1">
              <KeyboardKey keyName="a" />
              <span className="text-xs text-gray-600 text-center max-w-[60px]">{aKey.action}</span>
            </div>
          )}
          {sKey && (
            <div className="flex flex-col items-center space-y-1">
              <KeyboardKey keyName="s" />
              <span className="text-xs text-gray-600 text-center max-w-[60px]">{sKey.action}</span>
            </div>
          )}
          {dKey && (
            <div className="flex flex-col items-center space-y-1">
              <KeyboardKey keyName="d" />
              <span className="text-xs text-gray-600 text-center max-w-[60px]">{dKey.action}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'arrows') {
    const upKey = getControlForKey('ArrowUp');
    const leftKey = getControlForKey('ArrowLeft');
    const downKey = getControlForKey('ArrowDown');
    const rightKey = getControlForKey('ArrowRight');

    return (
      <div className="flex flex-col items-center space-y-2">
        {/* Up arrow */}
        <div className="flex justify-center">
          {upKey && (
            <div className="flex flex-col items-center space-y-1">
              <KeyboardKey keyName="ArrowUp" />
              <span className="text-xs text-gray-600 text-center max-w-[60px]">{upKey.action}</span>
            </div>
          )}
        </div>
        
        {/* Left Down Right arrows */}
        <div className="flex space-x-2">
          {leftKey && (
            <div className="flex flex-col items-center space-y-1">
              <KeyboardKey keyName="ArrowLeft" />
              <span className="text-xs text-gray-600 text-center max-w-[60px]">{leftKey.action}</span>
            </div>
          )}
          {downKey && (
            <div className="flex flex-col items-center space-y-1">
              <KeyboardKey keyName="ArrowDown" />
              <span className="text-xs text-gray-600 text-center max-w-[60px]">{downKey.action}</span>
            </div>
          )}
          {rightKey && (
            <div className="flex flex-col items-center space-y-1">
              <KeyboardKey keyName="ArrowRight" />
              <span className="text-xs text-gray-600 text-center max-w-[60px]">{rightKey.action}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}