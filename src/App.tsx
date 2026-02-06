import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FigurineProvider, useFigurines } from './context/FigurineContext';
import { PresetProvider } from './context/PresetContext';
import { Header, SearchBar, FilterPanel, FigurineGrid, FigurineTable, FigurineForm, FigurineDetailModal, StatsPage, ViewControls, PresetManager, ImportExportModal, BatchEditModal, MultiAddModal, GameBoxModal, GameView, GameEditModal, ImageMigrationModal } from './components';
import type { Figurine, FigurineInput, BatchEditInput, ViewMode } from './types';
import { isSupabaseConfigured } from './services/supabase';
import { CheckSquare, Edit3 } from 'lucide-react';

const VIEW_MODE_KEY = 'minilist_view_mode';

function CollectionPage() {
  const {
    filteredFigurines,
    loading,
    error,
    filters,
    setFilters,
    sort,
    setSort,
    gridSize,
    setGridSize,
    addFigurine,
    updateFigurine,
    batchUpdateFigurines,
    deleteFigurine,
    allBrands,
    allCategories,
    allUniverses,
    allSpecies,
    allSubspecies,
    allHabitats,
    allTags,
  } = useFigurines();

  // Count active filters (excluding search)
  const activeFiltersCount = [
    filters.brand,
    filters.category,
    filters.universe,
    filters.species,
    filters.subspecies,
    filters.size,
    filters.alignment,
    filters.habitats.length > 0,
    filters.status,
    filters.tags.length > 0,
    filters.onlyOwnImages,
  ].filter(Boolean).length;

  const [showForm, setShowForm] = useState(false);
  const [showMultiAdd, setShowMultiAdd] = useState(false);
  const [showGameBox, setShowGameBox] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showImageMigration, setShowImageMigration] = useState(false);
  const [showBatchEdit, setShowBatchEdit] = useState(false);
  const [editingFigurine, setEditingFigurine] = useState<Figurine | null>(null);
  const [viewingFigurine, setViewingFigurine] = useState<Figurine | null>(null);
  const [editingGame, setEditingGame] = useState<{ game: string; brand: string; universe: string; collection: string; price: number | null; coverImage: string | null; figurineIds: string[] } | null>(null);
  const [gameMetadataVersion, setGameMetadataVersion] = useState(0);

  // View mode (grid vs table)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem(VIEW_MODE_KEY) as ViewMode) || 'grid';
  });

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  };

  // Selection mode
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleAddClick = () => {
    setEditingFigurine(null);
    setShowForm(true);
  };

  const handleView = (figurine: Figurine) => {
    setViewingFigurine(figurine);
  };

  // Navigation in detail modal
  const viewingIndex = viewingFigurine ? filteredFigurines.findIndex(f => f.id === viewingFigurine.id) : -1;
  const hasPreviousFigurine = viewingIndex > 0;
  const hasNextFigurine = viewingIndex >= 0 && viewingIndex < filteredFigurines.length - 1;

  const handlePreviousFigurine = () => {
    if (hasPreviousFigurine) {
      setViewingFigurine(filteredFigurines[viewingIndex - 1]);
    }
  };

  const handleNextFigurine = () => {
    if (hasNextFigurine) {
      setViewingFigurine(filteredFigurines[viewingIndex + 1]);
    }
  };

  // Navigation in edit mode
  const editingIndex = editingFigurine ? filteredFigurines.findIndex(f => f.id === editingFigurine.id) : -1;
  const hasPreviousEdit = editingIndex > 0;
  const hasNextEdit = editingIndex >= 0 && editingIndex < filteredFigurines.length - 1;

  const handlePreviousEdit = () => {
    if (hasPreviousEdit) {
      setEditingFigurine(filteredFigurines[editingIndex - 1]);
    }
  };

  const handleNextEdit = () => {
    if (hasNextEdit) {
      setEditingFigurine(filteredFigurines[editingIndex + 1]);
    }
  };

  const handleEdit = (figurine: Figurine) => {
    setEditingFigurine(figurine);
    setShowForm(true);
  };

  const handleSubmit = async (data: FigurineInput, figurineId?: string) => {
    // Use the passed figurineId if provided, fall back to editingFigurine.id
    const idToUpdate = figurineId || editingFigurine?.id;
    if (idToUpdate) {
      await updateFigurine(idToUpdate, data);
    } else {
      await addFigurine(data);
    }
  };

  const handleMultiAdd = async (items: FigurineInput[]) => {
    for (const item of items) {
      await addFigurine(item);
    }
  };

  const handleGameBoxAdd = async (items: FigurineInput[]) => {
    for (const item of items) {
      await addFigurine(item);
    }
  };

  const handleEditGame = (gameGroup: { game: string; brand: string; universe: string; collection: string; totalPrice: number | null; coverImage: string | null; figurines: Figurine[] }) => {
    setEditingGame({
      game: gameGroup.game,
      brand: gameGroup.brand,
      universe: gameGroup.universe,
      collection: gameGroup.collection,
      price: gameGroup.totalPrice,
      coverImage: gameGroup.coverImage,
      figurineIds: gameGroup.figurines.map(f => f.id),
    });
  };

  const handleDeleteGame = async (figurineIds: string[]) => {
    for (const id of figurineIds) {
      await deleteFigurine(id);
    }
  };

  const handleSaveGameInfo = async (updates: { brand?: string; universe?: string; collection?: string; price?: number | null }) => {
    if (!editingGame) return;

    // Update all figurines in the game with the new info (not images, those are stored separately)
    for (const id of editingGame.figurineIds) {
      await updateFigurine(id, updates);
    }
  };

  // Selection handlers
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedIds(new Set());
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredFigurines.map(f => f.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleBatchEdit = async (data: BatchEditInput) => {
    await batchUpdateFigurines(Array.from(selectedIds), data);
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  // Calculate total with quantities
  const totalFigurines = filteredFigurines.reduce((sum, f) => sum + (f.quantity || 1), 0);

  return (
    <>
      {/* Fixed header section */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gray-50">
        <Header
          onAddClick={handleAddClick}
          onMultiAddClick={() => setShowMultiAdd(true)}
          onGameBoxClick={() => setShowGameBox(true)}
          onSettingsClick={() => setShowPresets(true)}
          onImportExportClick={() => setShowImportExport(true)}
          isLocalMode={!isSupabaseConfigured()}
        />

        <div className="max-w-7xl mx-auto px-4 pt-4 pb-3 space-y-3">
          {/* Search & Filters */}
          <SearchBar
            value={filters.search}
            onChange={(search) => setFilters(prev => ({ ...prev, search }))}
            placeholder="Rechercher par nom, marque, catégorie, univers, tag..."
          />
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            brands={allBrands}
            categories={allCategories}
            universes={allUniverses}
            species={allSpecies}
            subspecies={allSubspecies}
            habitats={allHabitats}
            tags={allTags}
          />

          {/* View controls & Results count */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                {totalFigurines} figurine{totalFigurines !== 1 ? 's' : ''}
                {filteredFigurines.length !== totalFigurines && ` (${filteredFigurines.length} entrées)`}
                {filters.search && ` pour "${filters.search}"`}
              </div>
              {/* Selection mode toggle */}
              <button
                onClick={toggleSelectionMode}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  selectionMode
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <CheckSquare size={16} />
                {selectionMode ? 'Annuler' : 'Sélectionner'}
              </button>
            </div>
            <ViewControls
              gridSize={gridSize}
              onGridSizeChange={setGridSize}
              sort={sort}
              onSortChange={setSort}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
            />
          </div>

          {/* Selection bar */}
          {selectionMode && (
            <div className="p-3 bg-primary-50 border border-primary-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-primary-800">
                  {selectedIds.size} sélectionnée{selectedIds.size !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={selectAll}
                  className="text-sm text-primary-600 hover:text-primary-800 underline"
                >
                  Tout sélectionner
                </button>
                {selectedIds.size > 0 && (
                  <button
                    onClick={deselectAll}
                    className="text-sm text-primary-600 hover:text-primary-800 underline"
                  >
                    Désélectionner
                  </button>
                )}
              </div>
              {selectedIds.size > 0 && (
                <button
                  onClick={() => setShowBatchEdit(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition"
                >
                  <Edit3 size={16} />
                  Modifier la sélection
                </button>
              )}
            </div>
          )}
        </div>
        {/* Shadow at bottom of fixed header */}
        <div className="h-px bg-gray-200 shadow-sm" />
      </div>

      {/* Spacer to push content below fixed header - height depends on selection mode and active filters */}
      <div className={
        selectionMode
          ? 'h-[400px] sm:h-[360px]'
          : activeFiltersCount > 0
            ? 'h-[390px] sm:h-[340px]'
            : 'h-[340px] sm:h-[300px]'
      } />

      <main className="max-w-7xl mx-auto px-4 pb-6">
        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Grid, Table, or Game view */}
        {viewMode === 'grid' && (
          <FigurineGrid
            figurines={filteredFigurines}
            loading={loading}
            gridSize={gridSize}
            sortField={sort.field}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={deleteFigurine}
            selectionMode={selectionMode}
            selectedIds={selectedIds}
            onSelect={handleSelect}
          />
        )}
        {viewMode === 'table' && (
          <FigurineTable
            figurines={filteredFigurines}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={deleteFigurine}
            selectionMode={selectionMode}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            sort={sort}
            onSortChange={setSort}
          />
        )}
        {viewMode === 'game' && (
          <GameView
            figurines={filteredFigurines}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            selectionMode={selectionMode}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onEditGame={handleEditGame}
            onDeleteGame={handleDeleteGame}
            metadataVersion={gameMetadataVersion}
          />
        )}
      </main>

      {/* Detail modal */}
      {viewingFigurine && (
        <FigurineDetailModal
          figurine={viewingFigurine}
          onClose={() => setViewingFigurine(null)}
          onEdit={handleEdit}
          onPrevious={handlePreviousFigurine}
          onNext={handleNextFigurine}
          hasPrevious={hasPreviousFigurine}
          hasNext={hasNextFigurine}
        />
      )}

      {/* Form modal */}
      {showForm && (
        <FigurineForm
          figurine={editingFigurine}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          existingTags={allTags}
          onPrevious={handlePreviousEdit}
          onNext={handleNextEdit}
          hasPrevious={hasPreviousEdit}
          hasNext={hasNextEdit}
        />
      )}

      {/* Preset manager modal */}
      {showPresets && (
        <PresetManager onClose={() => setShowPresets(false)} />
      )}

      {/* Import/Export modal */}
      {showImportExport && (
        <ImportExportModal onClose={() => setShowImportExport(false)} />
      )}

      {/* Image migration modal */}
      {showImageMigration && (
        <ImageMigrationModal onClose={() => setShowImageMigration(false)} />
      )}

      {/* Batch edit modal */}
      {showBatchEdit && (
        <BatchEditModal
          selectedCount={selectedIds.size}
          selectedFigurines={filteredFigurines.filter(f => selectedIds.has(f.id))}
          onSubmit={handleBatchEdit}
          onClose={() => setShowBatchEdit(false)}
        />
      )}

      {/* Multi add modal */}
      {showMultiAdd && (
        <MultiAddModal
          onSubmit={handleMultiAdd}
          onClose={() => setShowMultiAdd(false)}
        />
      )}

      {/* Game box add modal */}
      {showGameBox && (
        <GameBoxModal
          onSubmit={handleGameBoxAdd}
          onClose={() => setShowGameBox(false)}
        />
      )}

      {/* Game edit modal */}
      {editingGame && (
        <GameEditModal
          gameInfo={editingGame}
          onSave={handleSaveGameInfo}
          onClose={() => {
            setEditingGame(null);
            setGameMetadataVersion(v => v + 1);
          }}
        />
      )}
    </>
  );
}

function StatsPageWrapper() {
  const [showPresets, setShowPresets] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);

  const handleAddClick = () => {
    window.location.href = '/?add=true';
  };

  return (
    <>
      <Header onAddClick={handleAddClick} onSettingsClick={() => setShowPresets(true)} onImportExportClick={() => setShowImportExport(true)} />
      <main className="max-w-4xl mx-auto px-4 py-6 pt-20">
        <StatsPage />
      </main>
      {showPresets && (
        <PresetManager onClose={() => setShowPresets(false)} />
      )}
      {showImportExport && (
        <ImportExportModal onClose={() => setShowImportExport(false)} />
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <PresetProvider>
        <FigurineProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<CollectionPage />} />
              <Route path="/stats" element={<StatsPageWrapper />} />
            </Routes>
          </div>
        </FigurineProvider>
      </PresetProvider>
    </BrowserRouter>
  );
}

export default App;
