import { useState, useMemo } from 'react';
import { Package, ChevronDown, ChevronUp, Image as ImageIcon, Edit2 } from 'lucide-react';
import { usePresets } from '../context/PresetContext';
import { getGameMetadata } from '../services/gameMetadata';
import type { Figurine } from '../types';

interface GameGroup {
  game: string;
  figurines: Figurine[];
  coverImage: string | null;
  totalQuantity: number;
  brand: string;
  universe: string;
  collection: string;
  totalPrice: number | null;
}

interface GameViewProps {
  figurines: Figurine[];
  loading: boolean;
  onView: (figurine: Figurine) => void;
  onEdit?: (figurine: Figurine) => void;
  selectionMode: boolean;
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onEditGame?: (game: GameGroup) => void;
  metadataVersion?: number;
}

export function GameView({
  figurines,
  loading,
  onView,
  selectionMode,
  selectedIds,
  onSelect,
  onEditGame,
  metadataVersion,
}: GameViewProps) {
  const { presets } = usePresets();
  const [expandedGame, setExpandedGame] = useState<string | null>(null);

  // Group figurines by game, excluding those without a game
  const gameGroups = useMemo(() => {
    const groups = new Map<string, GameGroup>();

    figurines.forEach(fig => {
      // Skip figurines without a game defined
      if (!fig.game || fig.game.trim() === '') {
        return;
      }

      const gameName = fig.game;

      if (!groups.has(gameName)) {
        // Check for game metadata cover image first
        const gameMetadata = getGameMetadata(gameName);
        groups.set(gameName, {
          game: gameName,
          figurines: [],
          coverImage: gameMetadata?.coverImage || null,
          totalQuantity: 0,
          brand: fig.brand || '',
          universe: fig.universe || '',
          collection: fig.collection || '',
          totalPrice: null,
        });
      }

      const group = groups.get(gameName)!;
      group.figurines.push(fig);
      group.totalQuantity += fig.quantity || 1;

      // Accumulate price
      if (fig.price != null) {
        group.totalPrice = (group.totalPrice || 0) + fig.price;
      }

      // Use the first figurine image as fallback if no game cover set
      if (!group.coverImage && fig.image_url) {
        group.coverImage = fig.image_url;
      }
      // Update brand/universe/collection if not set
      if (!group.brand && fig.brand) {
        group.brand = fig.brand;
      }
      if (!group.universe && fig.universe) {
        group.universe = fig.universe;
      }
      if (!group.collection && fig.collection) {
        group.collection = fig.collection;
      }
    });

    // Sort by game name
    return Array.from(groups.values()).sort((a, b) =>
      a.game.localeCompare(b.game, 'fr')
    );
  }, [figurines, metadataVersion]);

  const toggleGame = (gameName: string) => {
    setExpandedGame(prev => prev === gameName ? null : gameName);
  };

  const selectAllInGame = (group: GameGroup, e: React.MouseEvent) => {
    e.stopPropagation();
    group.figurines.forEach(fig => {
      if (!selectedIds.has(fig.id)) {
        onSelect(fig.id);
      }
    });
  };

  const expandedGameData = expandedGame
    ? gameGroups.find(g => g.game === expandedGame)
    : null;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (gameGroups.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto text-gray-300 mb-4" size={48} />
        <p className="text-gray-500">Aucune figurine avec boîte de jeu</p>
        <p className="text-sm text-gray-400 mt-1">Assignez une boîte de jeu à vos figurines pour les voir ici</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Grid of game boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {gameGroups.map(group => {
          const selectedInGroup = group.figurines.filter(f => selectedIds.has(f.id)).length;
          const isExpanded = expandedGame === group.game;

          return (
            <div
              key={group.game}
              onClick={() => toggleGame(group.game)}
              className={`group cursor-pointer ${isExpanded ? 'ring-2 ring-primary-500 rounded-xl' : ''}`}
            >
              {/* Square card */}
              <div className="aspect-square rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition relative">
                {/* Cover image */}
                {group.coverImage ? (
                  <img
                    src={group.coverImage}
                    alt={group.game}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Package className="text-gray-300" size={48} />
                  </div>
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Quantity badge */}
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {group.totalQuantity}
                </div>

                {/* Selection indicator */}
                {selectionMode && selectedInGroup > 0 && (
                  <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {selectedInGroup} sel.
                  </div>
                )}

                {/* Expand indicator */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2">
                  {isExpanded ? (
                    <ChevronUp className="text-white/80" size={20} />
                  ) : (
                    <ChevronDown className="text-white/80 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                  )}
                </div>

                {/* Edit button */}
                {onEditGame && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditGame(group);
                    }}
                    className="absolute top-2 right-10 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition opacity-0 group-hover:opacity-100"
                    title="Modifier les infos du jeu"
                  >
                    <Edit2 size={14} />
                  </button>
                )}

                {/* Game info */}
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <h3 className="font-semibold text-sm truncate">{group.game}</h3>
                  {group.brand && (
                    <p className="text-xs text-white/70 truncate">{group.brand}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded figurines section - full width below grid */}
      {expandedGame && expandedGameData && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-4 p-4 border-b border-gray-100 bg-gray-50">
            {/* Cover thumbnail */}
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
              {expandedGameData.coverImage ? (
                <img
                  src={expandedGameData.coverImage}
                  alt={expandedGameData.game}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="text-gray-400" size={20} />
                </div>
              )}
            </div>

            {/* Game info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{expandedGameData.game}</h3>
              <p className="text-sm text-gray-500">
                {expandedGameData.totalQuantity} figurine{expandedGameData.totalQuantity !== 1 ? 's' : ''}
                {expandedGameData.brand && ` • ${expandedGameData.brand}`}
              </p>
            </div>

            {/* Actions */}
            {selectionMode && (
              <button
                onClick={(e) => selectAllInGame(expandedGameData, e)}
                className="px-3 py-1.5 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition"
              >
                Tout sélectionner
              </button>
            )}

            <button
              onClick={() => setExpandedGame(null)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronUp size={20} />
            </button>
          </div>

          {/* Figurines grid */}
          <div className="p-4">
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
              {expandedGameData.figurines.map(figurine => {
                const status = presets.statuses.find(s => s.value === figurine.status);
                const isSelected = selectedIds.has(figurine.id);

                return (
                  <div
                    key={figurine.id}
                    onClick={() => selectionMode ? onSelect(figurine.id) : onView(figurine)}
                    className={`group cursor-pointer relative ${
                      isSelected ? 'ring-2 ring-primary-500 ring-offset-2 rounded-lg' : ''
                    }`}
                  >
                    {/* Image */}
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-200 mb-1.5">
                      {figurine.image_url ? (
                        <img
                          src={figurine.image_url}
                          alt={figurine.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="text-gray-400" size={24} />
                        </div>
                      )}

                      {/* Status indicator */}
                      <div className={`absolute top-1 right-1 w-3 h-3 rounded-full ${status?.color || 'bg-gray-400'} border-2 border-white shadow`} />

                      {/* Quantity badge */}
                      {figurine.quantity > 1 && (
                        <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                          x{figurine.quantity}
                        </div>
                      )}

                      {/* Selection checkbox */}
                      {selectionMode && (
                        <div className={`absolute bottom-1 left-1 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                          isSelected
                            ? 'bg-primary-500 border-primary-500 text-white'
                            : 'bg-white/90 border-gray-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <p className="text-xs text-gray-700 text-center truncate px-1">
                      {figurine.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
