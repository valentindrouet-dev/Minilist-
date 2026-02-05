import { Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { usePresets } from '../context/PresetContext';
import type { Figurine, GridSize } from '../types';

interface FigurineCardProps {
  figurine: Figurine;
  gridSize: GridSize;
  onEdit: (figurine: Figurine) => void;
  onDelete: (id: string) => void;
}

export function FigurineCard({ figurine, gridSize, onEdit, onDelete }: FigurineCardProps) {
  const { presets } = usePresets();
  const status = presets.statuses.find(s => s.value === figurine.status);

  const isCompact = gridSize === 'xs' || gridSize === 'sm';
  const isMedium = gridSize === 'md';

  const handleDelete = () => {
    if (window.confirm(`Supprimer "${figurine.name}" ?`)) {
      onDelete(figurine.id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group">
      {/* Image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {figurine.image_url ? (
          <img
            src={figurine.image_url}
            alt={figurine.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageIcon size={isCompact ? 24 : 48} />
          </div>
        )}

        {/* Status badge */}
        {status && (
          <div className={`absolute top-1 left-1 ${isCompact ? 'w-3 h-3' : 'px-2 py-1'} rounded-lg text-xs font-medium text-white ${status.color}`}>
            {!isCompact && status.label}
          </div>
        )}

        {/* Action buttons (visible on hover) */}
        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => onEdit(figurine)}
            className={`${isCompact ? 'p-1' : 'p-2'} bg-white rounded-lg shadow-md hover:bg-gray-50 text-gray-700`}
          >
            <Edit2 size={isCompact ? 12 : 16} />
          </button>
          <button
            onClick={handleDelete}
            className={`${isCompact ? 'p-1' : 'p-2'} bg-white rounded-lg shadow-md hover:bg-red-50 text-red-500`}
          >
            <Trash2 size={isCompact ? 12 : 16} />
          </button>
        </div>
      </div>

      {/* Info - hidden on compact mode */}
      {!isCompact && (
        <div className={isMedium ? 'p-2' : 'p-3'}>
          <h3 className={`font-semibold text-gray-900 truncate ${isMedium ? 'text-sm' : ''}`} title={figurine.name}>
            {figurine.name}
          </h3>
          <p className={`text-gray-500 truncate ${isMedium ? 'text-xs' : 'text-sm'}`}>
            {figurine.brand}
          </p>
          {!isMedium && (
            <>
              <p className="text-xs text-gray-400 mt-1">
                {figurine.category}
                {figurine.subcategory && ` • ${figurine.subcategory}`}
              </p>
              {figurine.universe && (
                <p className="text-xs text-gray-400">
                  {figurine.universe}
                </p>
              )}

              {/* Tags */}
              {figurine.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {figurine.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {figurine.tags.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                      +{figurine.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Compact mode - just show name on hover */}
      {isCompact && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition">
          <p className="text-white text-xs truncate font-medium">{figurine.name}</p>
        </div>
      )}
    </div>
  );
}
