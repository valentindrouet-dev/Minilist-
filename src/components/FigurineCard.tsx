import { Edit2, Trash2, Image as ImageIcon, Check } from 'lucide-react';
import { usePresets } from '../context/PresetContext';
import type { Figurine, GridSize, SortField } from '../types';

interface FigurineCardProps {
  figurine: Figurine;
  gridSize: GridSize;
  sortField?: SortField;
  onView: (figurine: Figurine) => void;
  onEdit: (figurine: Figurine) => void;
  onDelete: (id: string) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, shiftKey?: boolean) => void;
}

export function FigurineCard({
  figurine,
  gridSize,
  sortField = 'name',
  onView,
  onEdit,
  onDelete,
  selectionMode = false,
  isSelected = false,
  onSelect,
}: FigurineCardProps) {
  const { presets } = usePresets();
  const status = presets.statuses.find(s => s.value === figurine.status);
  const quantity = figurine.quantity || 1;

  const isCompact = gridSize === 'xs' || gridSize === 'sm';
  const isMedium = gridSize === 'md';

  // Get secondary text based on sort field
  const getSecondaryText = (): string => {
    switch (sortField) {
      case 'category':
        return figurine.category || '—';
      case 'brand':
        return figurine.brand || '—';
      case 'game':
        return figurine.game || '—';
      case 'collection':
        return figurine.collection || '—';
      case 'group':
        return figurine.group || '—';
      case 'universe':
        return figurine.universe || '—';
      case 'species':
        return figurine.species || '—';
      case 'size':
        return figurine.size || '—';
      case 'alignment':
        return figurine.alignment || '—';
      case 'material':
        return figurine.material || '—';
      case 'habitats':
        return figurine.habitats?.length > 0 ? figurine.habitats.join(', ') : '—';
      case 'status':
        return status?.label || '—';
      case 'price':
        return figurine.price != null ? `${figurine.price.toFixed(2)} €` : '—';
      case 'created_at':
        return new Date(figurine.created_at).toLocaleDateString('fr-FR');
      case 'updated_at':
        return new Date(figurine.updated_at).toLocaleDateString('fr-FR');
      default:
        return figurine.brand || '—';
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Supprimer "${figurine.name}" ?`)) {
      onDelete(figurine.id);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (selectionMode && onSelect) {
      onSelect(figurine.id, e.shiftKey);
    } else {
      onView(figurine);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition group relative cursor-pointer
        ${isSelected ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200'}
      `}
      onClick={handleClick}
    >
      {/* Selection checkbox */}
      {selectionMode && (
        <div
          className={`absolute top-1 left-1 z-10 w-6 h-6 rounded-full flex items-center justify-center transition
            ${isSelected ? 'bg-primary-500 text-white' : 'bg-white/80 border border-gray-300'}
          `}
        >
          {isSelected && <Check size={14} strokeWidth={3} />}
        </div>
      )}

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

        {/* Quantity badge - only show if quantity > 1 */}
        {quantity > 1 && (
          <div className={`absolute bottom-1 right-1 ${isCompact ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm'} bg-black/70 text-white rounded-lg font-bold`}>
            x{quantity}
          </div>
        )}

        {/* Status badge */}
        {status && !selectionMode && (
          <div className={`absolute top-1 ${selectionMode ? 'left-8' : 'left-1'} ${isCompact ? 'w-3 h-3' : 'px-2 py-1'} rounded-lg text-xs font-medium text-white ${status.color}`}>
            {!isCompact && status.label}
          </div>
        )}

        {/* Status badge in selection mode - repositioned */}
        {status && selectionMode && (
          <div className={`absolute top-1 left-8 ${isCompact ? 'w-3 h-3' : 'px-2 py-1'} rounded-lg text-xs font-medium text-white ${status.color}`}>
            {!isCompact && status.label}
          </div>
        )}

        {/* Action buttons (visible on hover, hidden in selection mode) */}
        {!selectionMode && (
          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(figurine); }}
              className={`${isCompact ? 'p-1' : 'p-2'} bg-white rounded-lg shadow-md hover:bg-gray-50 text-gray-700`}
            >
              <Edit2 size={isCompact ? 12 : 16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              className={`${isCompact ? 'p-1' : 'p-2'} bg-white rounded-lg shadow-md hover:bg-red-50 text-red-500`}
            >
              <Trash2 size={isCompact ? 12 : 16} />
            </button>
          </div>
        )}
      </div>

      {/* Info - hidden on compact mode */}
      {!isCompact && (
        <div className={isMedium ? 'p-2' : 'p-3'}>
          <h3 className={`font-semibold text-gray-900 truncate ${isMedium ? 'text-sm' : ''}`} title={figurine.name}>
            {figurine.name}
          </h3>
          <p className={`text-gray-500 truncate ${isMedium ? 'text-xs' : 'text-sm'}`}>
            {getSecondaryText()}
          </p>
          {!isMedium && (
            <>
              <p className="text-xs text-gray-400 mt-1">
                {figurine.category}
                {figurine.species && ` • ${figurine.species}`}
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
