import { ZoomIn, ZoomOut, ArrowUpDown, ArrowUp, ArrowDown, LayoutGrid, List } from 'lucide-react';
import { GRID_SIZES, SORT_OPTIONS, type GridSize, type SortState, type ViewMode } from '../types';

interface ViewControlsProps {
  gridSize: GridSize;
  onGridSizeChange: (size: GridSize) => void;
  sort: SortState;
  onSortChange: (sort: SortState) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewControls({
  gridSize,
  onGridSizeChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
}: ViewControlsProps) {
  const currentSizeIndex = GRID_SIZES.findIndex(s => s.value === gridSize);

  const zoomIn = () => {
    if (currentSizeIndex < GRID_SIZES.length - 1) {
      onGridSizeChange(GRID_SIZES[currentSizeIndex + 1].value);
    }
  };

  const zoomOut = () => {
    if (currentSizeIndex > 0) {
      onGridSizeChange(GRID_SIZES[currentSizeIndex - 1].value);
    }
  };

  const toggleSortOrder = () => {
    onSortChange({ ...sort, order: sort.order === 'asc' ? 'desc' : 'asc' });
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
      {/* View mode toggle */}
      <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
        <button
          onClick={() => onViewModeChange('grid')}
          className={`p-2 rounded-md transition ${
            viewMode === 'grid'
              ? 'bg-primary-100 text-primary-600'
              : 'hover:bg-gray-100 text-gray-500'
          }`}
          title="Vue grille"
        >
          <LayoutGrid size={18} />
        </button>
        <button
          onClick={() => onViewModeChange('table')}
          className={`p-2 rounded-md transition ${
            viewMode === 'table'
              ? 'bg-primary-100 text-primary-600'
              : 'hover:bg-gray-100 text-gray-500'
          }`}
          title="Vue liste"
        >
          <List size={18} />
        </button>
      </div>

      {/* Zoom controls - only show in grid mode */}
      {viewMode === 'grid' && (
        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
          <button
            onClick={zoomOut}
            disabled={currentSizeIndex === 0}
            className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Réduire"
          >
            <ZoomOut size={18} />
          </button>

          <div className="hidden sm:flex gap-1 px-2">
            {GRID_SIZES.map((size, index) => (
              <button
                key={size.value}
                onClick={() => onGridSizeChange(size.value)}
                className={`w-2 h-2 rounded-full transition ${
                  index === currentSizeIndex
                    ? 'bg-primary-500'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                title={size.label}
              />
            ))}
          </div>

          <button
            onClick={zoomIn}
            disabled={currentSizeIndex === GRID_SIZES.length - 1}
            className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Agrandir"
          >
            <ZoomIn size={18} />
          </button>
        </div>
      )}

      {/* Sort controls */}
      <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
        <ArrowUpDown size={18} className="text-gray-400 ml-2" />
        <select
          value={sort.field}
          onChange={(e) => onSortChange({ ...sort, field: e.target.value as SortState['field'] })}
          className="bg-transparent border-none outline-none py-2 pr-2 text-sm cursor-pointer"
        >
          {SORT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          onClick={toggleSortOrder}
          className="p-2 hover:bg-gray-100 rounded-md transition"
          title={sort.order === 'asc' ? 'Croissant' : 'Décroissant'}
        >
          {sort.order === 'asc' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
        </button>
      </div>
    </div>
  );
}
