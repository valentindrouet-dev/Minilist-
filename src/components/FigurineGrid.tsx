import { GRID_SIZES, type Figurine, type GridSize, type SortField } from '../types';
import { FigurineCard } from './FigurineCard';
import { Package, CheckSquare, Square } from 'lucide-react';
import { usePresets } from '../context/PresetContext';

interface FigurineGridProps {
  figurines: Figurine[];
  loading: boolean;
  gridSize: GridSize;
  sortField?: SortField;
  onView: (figurine: Figurine) => void;
  onEdit: (figurine: Figurine) => void;
  onDelete: (id: string) => void;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onSelect?: (id: string, shiftKey?: boolean) => void;
  onSelectGroup?: (ids: string[]) => void;
}

// Fields that should show separators when sorting
const GROUPED_FIELDS: SortField[] = ['category', 'brand', 'game', 'collection', 'group', 'universe', 'species', 'subspecies', 'size', 'alignment', 'material', 'habitats', 'status', 'price'];

export function FigurineGrid({
  figurines,
  loading,
  gridSize,
  sortField = 'name',
  onView,
  onEdit,
  onDelete,
  selectionMode = false,
  selectedIds = new Set(),
  onSelect,
  onSelectGroup,
}: FigurineGridProps) {
  const { presets } = usePresets();
  const gridCols = GRID_SIZES.find(s => s.value === gridSize)?.cols || GRID_SIZES[2].cols;
  const showSeparators = GROUPED_FIELDS.includes(sortField);

  // Get the group value for a figurine based on sort field
  const getGroupValue = (fig: Figurine): string => {
    switch (sortField) {
      case 'category': return fig.category || 'Non défini';
      case 'brand': return fig.brand || 'Non défini';
      case 'game': return fig.game || 'Non défini';
      case 'collection': return fig.collection || 'Non défini';
      case 'group': return fig.group || 'Non défini';
      case 'universe': return fig.universe || 'Non défini';
      case 'species': return fig.species || 'Non défini';
      case 'subspecies': return fig.subspecies || 'Non défini';
      case 'size': return fig.size || 'Non défini';
      case 'alignment': return fig.alignment || 'Non défini';
      case 'material': return fig.material || 'Non défini';
      case 'habitats': return fig.habitats?.length > 0 ? fig.habitats[0] : 'Non défini';
      case 'status': {
        const status = presets.statuses.find(s => s.value === fig.status);
        return status?.label || 'Non défini';
      }
      case 'price': {
        if (fig.price == null) return 'Prix non défini';
        if (fig.price === 0) return 'Gratuit';
        if (fig.price < 10) return 'Moins de 10 €';
        if (fig.price < 25) return '10 € - 25 €';
        if (fig.price < 50) return '25 € - 50 €';
        if (fig.price < 100) return '50 € - 100 €';
        return 'Plus de 100 €';
      }
      default: return '';
    }
  };

  // Group figurines by the sort field
  const groupedFigurines = showSeparators
    ? figurines.reduce<{ group: string; items: Figurine[] }[]>((acc, fig) => {
        const groupValue = getGroupValue(fig);
        const existingGroup = acc.find(g => g.group === groupValue);
        if (existingGroup) {
          existingGroup.items.push(fig);
        } else {
          acc.push({ group: groupValue, items: [fig] });
        }
        return acc;
      }, [])
    : [{ group: '', items: figurines }];

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
    <div className="space-y-6">
      {groupedFigurines.map(({ group, items }) => {
        const groupIds = items.map(f => f.id);
        const allSelected = selectionMode && groupIds.length > 0 && groupIds.every(id => selectedIds.has(id));
        const someSelected = selectionMode && groupIds.some(id => selectedIds.has(id));

        return (
        <div key={group || 'all'}>
          {/* Section header */}
          {showSeparators && group && (
            <div className="flex items-center gap-3 mb-4">
              {selectionMode && onSelectGroup && (
                <button
                  onClick={() => onSelectGroup(groupIds)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm transition ${
                    allSelected
                      ? 'bg-primary-500 text-white'
                      : someSelected
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={allSelected ? 'Désélectionner le groupe' : 'Sélectionner le groupe'}
                >
                  {allSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                </button>
              )}
              <h3 className="text-lg font-semibold text-gray-800">{group}</h3>
              <span className="text-sm text-gray-500">
                ({items.reduce((sum, f) => sum + (f.quantity || 1), 0)} figurine{items.reduce((sum, f) => sum + (f.quantity || 1), 0) !== 1 ? 's' : ''})
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          )}
          {/* Grid of cards */}
          <div className={`grid ${gridCols} gap-4`}>
            {items.map(figurine => (
              <FigurineCard
                key={figurine.id}
                figurine={figurine}
                gridSize={gridSize}
                sortField={sortField}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                selectionMode={selectionMode}
                isSelected={selectedIds.has(figurine.id)}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
        );
      })}
    </div>
  );
}
