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
      {gameGroups.map(group => {
        const isExpanded = expandedGame === group.game;
        const selectedInGroup = group.figurines.filter(f => selectedIds.has(f.id)).length;

        return (
          <div key={group.game} className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Game header - clickable to expand */}
            <div
              onClick={() => toggleGame(group.game)}
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition"
            >
              {/* Cover thumbnail */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                {group.coverImage ? (
                  <img
                    src={group.coverImage}
                    alt={group.game}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="text-gray-400" size={24} />
                  </div>
                )}
              </div>

              {/* Game info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{group.game}</h3>
                <p className="text-sm text-gray-500">
                  {group.totalQuantity} figurine{group.totalQuantity !== 1 ? 's' : ''}
                  {group.brand && ` • ${group.brand}`}
                  {group.universe && ` • ${group.universe}`}
                </p>
              </div>

              {/* Selection count */}
              {selectionMode && selectedInGroup > 0 && (
                <div className="bg-primary-100 text-primary-700 text-sm px-2 py-1 rounded-full">
                  {selectedInGroup} sel.
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {onEditGame && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditGame(group);
                    }}
                    className="p-2 text-gray-400 hover:text-primary-500 hover:bg-gray-100 rounded-lg transition"
                    title="Modifier les infos du jeu"
                  >
                    <Edit2 size={18} />
                  </button>
                )}
                {selectionMode && (
                  <button
                    onClick={(e) => selectAllInGame(group, e)}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition"
                  >
                    Tout
                  </button>
                )}
                {isExpanded ? (
                  <ChevronUp className="text-gray-400" size={20} />
                ) : (
                  <ChevronDown className="text-gray-400" size={20} />
                )}
              </div>
            </div>

            {/* Expanded figurines grid */}
            {isExpanded && (
              <div className="border-t border-gray-100 p-4 bg-gray-50">
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                  {group.figurines.map(figurine => {
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
                              <ImageIcon className="text-gray-400" size={20} />
                            </div>
                          )}

                          {/* Status indicator */}
                          <div className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ${status?.color || 'bg-gray-400'} border border-white shadow`} />

                          {/* Quantity badge */}
                          {figurine.quantity > 1 && (
                            <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded-full font-medium">
                              x{figurine.quantity}
                            </div>
                          )}

                          {/* Selection checkbox */}
                          {selectionMode && (
                            <div className={`absolute bottom-1 left-1 w-4 h-4 rounded border-2 flex items-center justify-center transition ${
                              isSelected
                                ? 'bg-primary-500 border-primary-500 text-white'
                                : 'bg-white/90 border-gray-300'
                            }`}>
                              {isSelected && (
                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Name */}
                        <p className="text-xs text-gray-700 text-center truncate px-0.5">
                          {figurine.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
