'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Game, KeyboardControl } from '@/types';
import { addGame, getAllGames, updateGame, deleteGame } from '@/lib/gameUtils';
import { Plus, Edit, Trash2, Save, X, ExternalLink, Keyboard } from 'lucide-react';

export default function AdminPanel() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    thumbnail: '',
    category: '',
    tags: '',
    featured: false,
  });
  const [keyboardControls, setKeyboardControls] = useState<KeyboardControl[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const availableKeys = [
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    'w', 'a', 's', 'd', 'q', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
    'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm',
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
    'Space', 'Enter', 'Shift', 'Ctrl', 'Alt', 'Tab', 'Escape'
  ];

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/auth/signin');
      return;
    }

    if (isAdmin) {
      loadGames();
    }
  }, [user, isAdmin, loading, router]);

  const loadGames = async () => {
    try {
      const allGames = await getAllGames();
      setGames(allGames);
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const gameData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        keyboardControls: keyboardControls.length > 0 ? keyboardControls : undefined,
      };

      if (editingGame) {
        await updateGame(editingGame.id, gameData);
      } else {
        await addGame(gameData);
      }

      await loadGames();
      resetForm();
    } catch (error) {
      console.error('Error saving game:', error);
      alert('Error saving game. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setFormData({
      title: game.title,
      description: game.description,
      url: game.url,
      thumbnail: game.thumbnail,
      category: game.category,
      tags: game.tags.join(', '),
      featured: game.featured,
    });
    setKeyboardControls(game.keyboardControls || []);
    setShowAddForm(true);
  };

  const handleDelete = async (gameId: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return;

    try {
      await deleteGame(gameId);
      await loadGames();
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Error deleting game. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      thumbnail: '',
      category: '',
      tags: '',
      featured: false,
    });
    setKeyboardControls([]);
    setShowAddForm(false);
    setEditingGame(null);
  };

  const addKeyboardControl = () => {
    setKeyboardControls([...keyboardControls, { key: '', action: '' }]);
  };

  const removeKeyboardControl = (index: number) => {
    setKeyboardControls(keyboardControls.filter((_, i) => i !== index));
  };

  const updateKeyboardControl = (index: number, field: 'key' | 'action', value: string) => {
    const updated = [...keyboardControls];
    updated[index][field] = value;
    setKeyboardControls(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage games and content</p>
        </div>

        {/* Add Game Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Game</span>
          </button>
        </div>

        {/* Add/Edit Game Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingGame ? 'Edit Game' : 'Add New Game'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Game Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    placeholder="Enter game title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Select category</option>
                    <option value="Action">Action</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Puzzle">Puzzle</option>
                    <option value="Racing">Racing</option>
                    <option value="Sports">Sports</option>
                    <option value="Strategy">Strategy</option>
                    <option value="Arcade">Arcade</option>
                    <option value="Shooting">Shooting</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="Enter game description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Game URL
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="https://example.com/game"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  required
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="fun, multiplayer, 3d"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                  Featured game
                </label>
              </div>

              {/* Keyboard Controls Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Keyboard Controls (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={addKeyboardControl}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Control</span>
                  </button>
                </div>
                
                {keyboardControls.length === 0 ? (
                  <p className="text-gray-500 text-sm">No keyboard controls added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {keyboardControls.map((control, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="flex-1">
                          <select
                            value={control.key}
                            onChange={(e) => updateKeyboardControl(index, 'key', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          >
                            <option value="">Select Key</option>
                            <optgroup label="Arrow Keys">
                              <option value="ArrowUp">↑ Up Arrow</option>
                              <option value="ArrowDown">↓ Down Arrow</option>
                              <option value="ArrowLeft">← Left Arrow</option>
                              <option value="ArrowRight">→ Right Arrow</option>
                            </optgroup>
                            <optgroup label="WASD">
                              <option value="w">W</option>
                              <option value="a">A</option>
                              <option value="s">S</option>
                              <option value="d">D</option>
                            </optgroup>
                            <optgroup label="Letters">
                              {['q', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm'].map(letter => (
                                <option key={letter} value={letter}>{letter.toUpperCase()}</option>
                              ))}
                            </optgroup>
                            <optgroup label="Numbers">
                              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map(num => (
                                <option key={num} value={num}>{num}</option>
                              ))}
                            </optgroup>
                            <optgroup label="Special Keys">
                              <option value="Space">Spacebar</option>
                              <option value="Enter">Enter</option>
                              <option value="Shift">Shift</option>
                              <option value="Ctrl">Ctrl</option>
                              <option value="Alt">Alt</option>
                              <option value="Tab">Tab</option>
                              <option value="Escape">Escape</option>
                            </optgroup>
                          </select>
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Action (e.g., Move up, Jump)"
                            value={control.action}
                            onChange={(e) => updateKeyboardControl(index, 'action', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeKeyboardControl(index)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{submitting ? 'Saving...' : editingGame ? 'Update' : 'Add Game'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Games List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Games ({games.length})
            </h2>
          </div>

          {games.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No games added yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Game
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plays
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Controls
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Featured
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {games.map((game) => (
                    <tr key={game.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-10 w-10 rounded object-cover"
                            src={game.thumbnail}
                            alt={game.title}
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-game.jpg';
                            }}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {game.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {game.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {game.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {game.playCount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {game.keyboardControls && game.keyboardControls.length > 0 ? (
                          <div className="flex items-center space-x-1">
                            <Keyboard className="h-4 w-4 text-blue-600" />
                            <span className="text-xs text-blue-600">
                              {game.keyboardControls.length} controls
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No controls</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {game.featured ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <a
                          href={game.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleEdit(game)}
                          className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(game.id)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}