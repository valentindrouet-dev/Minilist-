import { useState, useMemo } from 'react';
import { Package, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import { usePresets } from '../context/PresetContext';
import type { Figurine } from '../types';

interface GameGroup {
  game: string;
  figurines: Figurine[];
  coverImage: string | null;
  totalQuantity: number;
}

interface GameViewProps {
  figurines: Figurine[];
  loading: boolean;
  onView: (figurine: Figurine) => void;
  onEdit?: (figurine: Figurine) => void;
  selectionMode: boolean;
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
}

export function GameView({
  figurines,
  loading,
  onView,
  selectionMode,
  selectedIds,
  onSelect,
}: GameViewProps) {
  const { presets } = usePresets();
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set());

  // Group figurines by game
  const gameGroups = useMemo(() => {
    const groups = new Map<string, GameGroup>();

    figurines.forEach(fig => {
      const gameName = fig.game || 'Sans jeu';

      if (!groups.has(gameName)) {
        groups.set(gameName, {
          game: gameName,
          figurines: [],
          coverImage: null,
          totalQuantity: 0,
        });
      }

      const group = groups.get(gameName)!;
      group.figurines.push(fig);
      group.totalQuantity += fig.quantity || 1;

      // Use the first image found as cover (ideally all figurines from the same box share the box image)
      if (!group.coverImage && fig.image_url) {
        group.coverImage = fig.image_url;
      }
    });

    // Sort by game name
    return Array.from(groups.values()).sort((a, b) =>
      a.game.localeCompare(b.game, 'fr')
    );
  }, [figurines]);

  const toggleGame = (game: string) => {
    setExpandedGames(prev => {
      const next = new Set(prev);
      if (next.has(game)) {
        next.delete(game);
      } else {
        next.add(game);
      }
      return next;
    });
  };

  const selectAllInGame = (group: GameGroup) => {
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
        <p className="text-gray-500">Aucune figurine trouvée</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {gameGroups.map(group => {
        const isExpanded = expandedGames.has(group.game);
        const selectedInGroup = group.figurines.filter(f => selectedIds.has(f.id)).length;

        return (
          <div key={group.game} className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Game header - clickable */}
            <button
              onClick={() => toggleGame(group.game)}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition text-left"
            >
              {/* Cover image */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                {group.coverImage ? (
                  <img
                    src={group.coverImage}
                    alt={group.game}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="text-gray-300" size={32} />
                  </div>
                )}
              </div>

              {/* Game info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 truncate">
                  {group.game}
                </h3>
                <p className="text-sm text-gray-500">
                  {group.totalQuantity} figurine{group.totalQuantity !== 1 ? 's' : ''}
                  {group.figurines.length !== group.totalQuantity && ` (${group.figurines.length} entrées)`}
                </p>
                {selectionMode && selectedInGroup > 0 && (
                  <p className="text-xs text-primary-600 mt-1">
                    {selectedInGroup} sélectionnée{selectedInGroup !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Selection button for the group */}
              {selectionMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selectAllInGame(group);
                  }}
                  className="px-3 py-1.5 text-xs bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition"
                >
                  Tout sélectionner
                </button>
              )}

              {/* Expand/collapse icon */}
              <div className="text-gray-400">
                {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </div>
            </button>

            {/* Expanded content - figurine grid */}
            {isExpanded && (
              <div className="border-t border-gray-100 p-4 bg-gray-50">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
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
            )}
          </div>
        );
      })}
    </div>
  );
}
