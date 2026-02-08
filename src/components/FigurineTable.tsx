import { Edit2, Trash2, Image as ImageIcon, Eye, ChevronUp, ChevronDown } from 'lucide-react';
import { usePresets } from '../context/PresetContext';
import type { Figurine, SortState, SortField } from '../types';

interface FigurineTableProps {
  figurines: Figurine[];
  loading: boolean;
  onView: (figurine: Figurine) => void;
  onEdit: (figurine: Figurine) => void;
  onDelete: (id: string) => void;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onSelect?: (id: string, shiftKey?: boolean) => void;
  sort?: SortState;
  onSortChange?: (sort: SortState) => void;
}

interface SortableHeaderProps {
  field: SortField;
  label: string;
  currentSort?: SortState;
  onSort?: (sort: SortState) => void;
  className?: string;
}

function SortableHeader({ field, label, currentSort, onSort, className = '' }: SortableHeaderProps) {
  const isActive = currentSort?.field === field;
  const isAsc = currentSort?.order === 'asc';

  const handleClick = () => {
    if (!onSort) return;
    if (isActive) {
      onSort({ field, order: isAsc ? 'desc' : 'asc' });
    } else {
      onSort({ field, order: 'asc' });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 hover:text-gray-700 transition ${className}`}
    >
      {label}
      {isActive && (
        isAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />
      )}
    </button>
  );
}

export function FigurineTable({
  figurines,
  loading,
  onView,
  onEdit,
  onDelete,
  selectionMode = false,
  selectedIds = new Set(),
  onSelect,
  sort,
  onSortChange,
}: FigurineTableProps) {
  const { presets } = usePresets();

  const handleDelete = (figurine: Figurine) => {
    if (window.confirm(`Supprimer "${figurine.name}" ?`)) {
      onDelete(figurine.id);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100">
              <div className="w-12 h-12 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (figurines.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
        <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="hidden md:grid md:grid-cols-12 gap-3 px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wide">
        {selectionMode && <div className="col-span-1"></div>}
        <div className={selectionMode ? "col-span-1" : "col-span-1"}></div>
        <div className={selectionMode ? "col-span-2" : "col-span-3"}>
          <SortableHeader field="name" label="Nom" currentSort={sort} onSort={onSortChange} />
        </div>
        <div className="col-span-2">
          <SortableHeader field="brand" label="Marque" currentSort={sort} onSort={onSortChange} />
        </div>
        <div className="col-span-2">
          <SortableHeader field="category" label="Catégorie" currentSort={sort} onSort={onSortChange} />
        </div>
        <div className="col-span-1">
          <SortableHeader field="status" label="Statut" currentSort={sort} onSort={onSortChange} />
        </div>
        <div className="col-span-1">Qté</div>
        <div className="col-span-2">Actions</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100">
        {figurines.map(figurine => {
          const status = presets.statuses.find(s => s.value === figurine.status);
          const quantity = figurine.quantity || 1;
          const isSelected = selectedIds.has(figurine.id);

          return (
            <div
              key={figurine.id}
              className={`grid grid-cols-12 gap-3 px-3 py-1.5 items-center hover:bg-gray-50 transition cursor-pointer ${
                isSelected ? 'bg-primary-50' : ''
              }`}
              onClick={(e) => {
                if (selectionMode && onSelect) {
                  onSelect(figurine.id, e.shiftKey);
                } else {
                  onView(figurine);
                }
              }}
            >
              {/* Checkbox */}
              {selectionMode && (
                <div className="col-span-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    onClick={(e) => {
                      onSelect?.(figurine.id, e.shiftKey);
                    }}
                    className="w-4 h-4 text-primary-500 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Thumbnail */}
              <div className={selectionMode ? "col-span-1" : "col-span-1"}>
                <div className="w-8 h-8 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                  {figurine.image_url ? (
                    <img
                      src={figurine.image_url}
                      alt={figurine.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon size={14} />
                    </div>
                  )}
                </div>
              </div>

              {/* Name */}
              <div className={`${selectionMode ? "col-span-2" : "col-span-3"} min-w-0`}>
                <div className="font-medium text-sm text-gray-900 truncate">{figurine.name}</div>
                <div className="text-xs text-gray-500 truncate md:hidden">
                  {figurine.brand} • {figurine.category}
                </div>
              </div>

              {/* Brand */}
              <div className="col-span-2 hidden md:block">
                <span className="text-sm text-gray-600 truncate">{figurine.brand || '—'}</span>
              </div>

              {/* Category */}
              <div className="col-span-2 hidden md:block">
                <span className="text-sm text-gray-600 truncate">
                  {figurine.category || '—'}
                  {figurine.species && <span className="text-gray-400"> / {figurine.species}</span>}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-1 hidden md:block">
                {status && (
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium text-white ${status.color}`}>
                    {status.label}
                  </span>
                )}
              </div>

              {/* Quantity */}
              <div className="col-span-1 hidden md:block">
                <span className="text-sm text-gray-600">{quantity}</span>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-end gap-0.5">
                <button
                  onClick={(e) => { e.stopPropagation(); onView(figurine); }}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition"
                  title="Voir"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(figurine); }}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition"
                  title="Modifier"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(figurine); }}
                  className="p-1.5 hover:bg-red-50 rounded text-red-500 transition"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
