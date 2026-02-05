import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FigurineProvider, useFigurines } from './context/FigurineContext';
import { PresetProvider } from './context/PresetContext';
import { Header, SearchBar, FilterPanel, FigurineGrid, FigurineTable, FigurineForm, FigurineDetailModal, StatsPage, ViewControls, PresetManager, ImportExportModal, BatchEditModal, MultiAddModal } from './components';
import type { Figurine, FigurineInput, BatchEditInput, ViewMode } from './types';
import { isSupabaseConfigured } from './services/supabase';
import { AlertCircle, Download, Upload, CheckSquare, Edit3 } from 'lucide-react';
import { figurineService } from './services/supabase';

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
    uploadImage,
    allBrands,
    allCategories,
    allUniverses,
    allSpecies,
    allSubspecies,
    allHabitats,
    allTags,
  } = useFigurines();

  const [showForm, setShowForm] = useState(false);
  const [showMultiAdd, setShowMultiAdd] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showBatchEdit, setShowBatchEdit] = useState(false);
  const [editingFigurine, setEditingFigurine] = useState<Figurine | null>(null);
  const [viewingFigurine, setViewingFigurine] = useState<Figurine | null>(null);

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

  const handleEdit = (figurine: Figurine) => {
    setEditingFigurine(figurine);
    setShowForm(true);
  };

  const handleSubmit = async (data: FigurineInput) => {
    if (editingFigurine) {
      await updateFigurine(editingFigurine.id, data);
    } else {
      await addFigurine(data);
    }
  };

  const handleMultiAdd = async (items: FigurineInput[]) => {
    for (const item of items) {
      await addFigurine(item);
    }
  };

  const handleExport = () => {
    const data = figurineService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minilist-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        try {
          const count = await figurineService.importData(text);
          alert(`${count} figurines importées avec succès !`);
          window.location.reload();
        } catch {
          alert('Erreur lors de l\'import : fichier invalide');
        }
      }
    };
    input.click();
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
      <Header onAddClick={handleAddClick} onMultiAddClick={() => setShowMultiAdd(true)} onSettingsClick={() => setShowPresets(true)} onImportExportClick={() => setShowImportExport(true)} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Config warning */}
        {!isSupabaseConfigured() && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-yellow-800 font-medium">Mode local activé</p>
              <p className="text-yellow-700 text-sm mt-1">
                Les données sont stockées uniquement sur cet appareil. Pour synchroniser entre appareils,
                configurez Supabase dans le fichier .env
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-sm hover:bg-yellow-200 transition"
                >
                  <Download size={16} />
                  Exporter
                </button>
                <button
                  onClick={handleImport}
                  className="flex items-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-sm hover:bg-yellow-200 transition"
                >
                  <Upload size={16} />
                  Importer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Search & Filters */}
        <div className="space-y-4 mb-6">
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
        </div>

        {/* View controls & Results count */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
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
          <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
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

        {/* Grid or Table view */}
        {viewMode === 'grid' ? (
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
        ) : (
          <FigurineTable
            figurines={filteredFigurines}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={deleteFigurine}
            selectionMode={selectionMode}
            selectedIds={selectedIds}
            onSelect={handleSelect}
          />
        )}
      </main>

      {/* Detail modal */}
      {viewingFigurine && (
        <FigurineDetailModal
          figurine={viewingFigurine}
          onClose={() => setViewingFigurine(null)}
          onEdit={handleEdit}
        />
      )}

      {/* Form modal */}
      {showForm && (
        <FigurineForm
          figurine={editingFigurine}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          onUploadImage={uploadImage}
          existingTags={allTags}
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

      {/* Batch edit modal */}
      {showBatchEdit && (
        <BatchEditModal
          selectedCount={selectedIds.size}
          onSubmit={handleBatchEdit}
          onClose={() => setShowBatchEdit(false)}
        />
      )}

      {/* Multi add modal */}
      {showMultiAdd && (
        <MultiAddModal
          onSubmit={handleMultiAdd}
          onClose={() => setShowMultiAdd(false)}
          onUploadImage={uploadImage}
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
      <main className="max-w-4xl mx-auto px-4 py-6">
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
