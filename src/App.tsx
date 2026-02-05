import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FigurineProvider, useFigurines } from './context/FigurineContext';
import { PresetProvider } from './context/PresetContext';
import { Header, SearchBar, FilterPanel, FigurineGrid, FigurineForm, StatsPage, ViewControls, PresetManager } from './components';
import type { Figurine, FigurineInput } from './types';
import { isSupabaseConfigured } from './services/supabase';
import { AlertCircle, Download, Upload } from 'lucide-react';
import { figurineService } from './services/supabase';

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
    deleteFigurine,
    uploadImage,
    allBrands,
    allCategories,
    allSubcategories,
    allUniverses,
    allTags,
  } = useFigurines();

  const [showForm, setShowForm] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [editingFigurine, setEditingFigurine] = useState<Figurine | null>(null);

  const handleAddClick = () => {
    setEditingFigurine(null);
    setShowForm(true);
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

  return (
    <>
      <Header onAddClick={handleAddClick} onSettingsClick={() => setShowPresets(true)} />

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
            subcategories={allSubcategories}
            universes={allUniverses}
            tags={allTags}
          />
        </div>

        {/* View controls & Results count */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="text-sm text-gray-500">
            {filteredFigurines.length} figurine{filteredFigurines.length !== 1 ? 's' : ''}
            {filters.search && ` pour "${filters.search}"`}
          </div>
          <ViewControls
            gridSize={gridSize}
            onGridSizeChange={setGridSize}
            sort={sort}
            onSortChange={setSort}
          />
        </div>

        {/* Grid */}
        <FigurineGrid
          figurines={filteredFigurines}
          loading={loading}
          gridSize={gridSize}
          onEdit={handleEdit}
          onDelete={deleteFigurine}
        />
      </main>

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
    </>
  );
}

function StatsPageWrapper() {
  const [showPresets, setShowPresets] = useState(false);

  const handleAddClick = () => {
    window.location.href = '/?add=true';
  };

  return (
    <>
      <Header onAddClick={handleAddClick} onSettingsClick={() => setShowPresets(true)} />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <StatsPage />
      </main>
      {showPresets && (
        <PresetManager onClose={() => setShowPresets(false)} />
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
