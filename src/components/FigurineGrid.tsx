import { GRID_SIZES, type Figurine, type GridSize } from '../types';
import { FigurineCard } from './FigurineCard';
import { Package } from 'lucide-react';

interface FigurineGridProps {
  figurines: Figurine[];
  loading: boolean;
  gridSize: GridSize;
  onEdit: (figurine: Figurine) => void;
  onDelete: (id: string) => void;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onSelect?: (id: string) => void;
}

export function FigurineGrid({
  figurines,
  loading,
  gridSize,
  onEdit,
  onDelete,
  selectionMode = false,
  selectedIds = new Set(),
  onSelect,
}: FigurineGridProps) {
  const gridCols = GRID_SIZES.find(s => s.value === gridSize)?.cols || GRID_SIZES[2].cols;

  if (loading) {
    return (
      <div className={`grid ${gridCols} gap-4`}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
          >
            <div className="aspect-square bg-gray-200" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (figurines.length === 0) {
    return (
      <div className="text-center py-16">
        <Package size={64} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Aucune figurine trouvée
        </h3>
        <p className="text-gray-400">
          Ajoutez votre première figurine pour commencer votre collection !
        </p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {figurines.map(figurine => (
        <FigurineCard
          key={figurine.id}
          figurine={figurine}
          gridSize={gridSize}
          onEdit={onEdit}
          onDelete={onDelete}
          selectionMode={selectionMode}
          isSelected={selectedIds.has(figurine.id)}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
