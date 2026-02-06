import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { usePresets } from '../context/PresetContext';
import type { FilterState } from '../types';
import { getSubspeciesForSpecies } from '../types';

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  brands: string[];
  categories: string[];
  universes: string[];
  species: string[];
  subspecies: string[];
  habitats: string[];
  tags: string[];
}

export function FilterPanel({
  filters,
  onChange,
  brands,
  categories,
  universes,
  species,
  subspecies,
  habitats,
  tags
}: FilterPanelProps) {
  const { presets } = usePresets();
  const [isOpen, setIsOpen] = useState(false);

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

  const clearFilters = () => {
    onChange({
      ...filters,
      brand: '',
      category: '',
      universe: '',
      species: '',
      subspecies: '',
      size: '',
      alignment: '',
      habitats: [],
      status: '',
      tags: [],
      onlyOwnImages: false,
    });
  };

  const toggleHabitat = (habitat: string) => {
    const newHabitats = filters.habitats.includes(habitat)
      ? filters.habitats.filter(h => h !== habitat)
      : [...filters.habitats, habitat];
    onChange({ ...filters, habitats: newHabitats });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onChange({ ...filters, tags: newTags });
  };

  // Build list of active filter items for display
  const getActiveFilterItems = () => {
    const items: { key: string; label: string; onRemove: () => void }[] = [];

    if (filters.status) {
      const statusLabel = presets.statuses.find(s => s.value === filters.status)?.label || filters.status;
      items.push({
        key: 'status',
        label: `Statut: ${statusLabel}`,
        onRemove: () => onChange({ ...filters, status: '' }),
      });
    }
    if (filters.category) {
      items.push({
        key: 'category',
        label: `Catégorie: ${filters.category}`,
        onRemove: () => onChange({ ...filters, category: '' }),
      });
    }
    if (filters.brand) {
      items.push({
        key: 'brand',
        label: `Marque: ${filters.brand}`,
        onRemove: () => onChange({ ...filters, brand: '' }),
      });
    }
    if (filters.universe) {
      items.push({
        key: 'universe',
        label: `Univers: ${filters.universe}`,
        onRemove: () => onChange({ ...filters, universe: '' }),
      });
    }
    if (filters.species) {
      items.push({
        key: 'species',
        label: `Espèce: ${filters.species}`,
        onRemove: () => onChange({ ...filters, species: '', subspecies: '' }),
      });
    }
    if (filters.subspecies) {
      items.push({
        key: 'subspecies',
        label: `Sous-Espèce: ${filters.subspecies}`,
        onRemove: () => onChange({ ...filters, subspecies: '' }),
      });
    }
    if (filters.size) {
      items.push({
        key: 'size',
        label: `Taille: ${filters.size}`,
        onRemove: () => onChange({ ...filters, size: '' }),
      });
    }
    if (filters.alignment) {
      items.push({
        key: 'alignment',
        label: `Alignement: ${filters.alignment}`,
        onRemove: () => onChange({ ...filters, alignment: '' }),
      });
    }
    for (const habitat of filters.habitats) {
      items.push({
        key: `habitat-${habitat}`,
        label: `Habitat: ${habitat}`,
        onRemove: () => toggleHabitat(habitat),
      });
    }
    for (const tag of filters.tags) {
      items.push({
        key: `tag-${tag}`,
        label: `Tag: ${tag}`,
        onRemove: () => toggleTag(tag),
      });
    }
    if (filters.onlyOwnImages) {
      items.push({
        key: 'onlyOwnImages',
        label: 'Mes photos',
        onRemove: () => onChange({ ...filters, onlyOwnImages: false }),
      });
    }

    return items;
  };

  const activeFilterItems = getActiveFilterItems();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-500" />
          <span className="font-medium">Filtres</span>
          {activeFiltersCount > 0 && (
            <span className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {/* Active filters display */}
      {activeFilterItems.length > 0 && !isOpen && (
        <div className="px-4 pb-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
          {activeFilterItems.map(item => (
            <span
              key={item.key}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
            >
              {item.label}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  item.onRemove();
                }}
                className="hover:text-primary-900 ml-0.5"
              >
                <X size={14} />
              </button>
            </span>
          ))}
          {activeFilterItems.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFilters();
              }}
              className="text-sm text-red-500 hover:text-red-600 px-2"
            >
              Tout effacer
            </button>
          )}
        </div>
      )}

      {isOpen && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
          {/* Clear filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="mt-3 flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
            >
              <X size={16} />
              Effacer les filtres
            </button>
          )}

          {/* Own images filter */}
          <div className="mt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.onlyOwnImages}
                onChange={(e) => onChange({ ...filters, onlyOwnImages: e.target.checked })}
                className="w-4 h-4 text-primary-500 rounded border-gray-300 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">Mes photos uniquement</span>
            </label>
          </div>

          {/* Status filter */}
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <div className="flex flex-wrap gap-2">
              {presets.statuses.map(status => (
                <button
                  key={status.value}
                  onClick={() => onChange({
                    ...filters,
                    status: filters.status === status.value ? '' : status.value
                  })}
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition ${
                    filters.status === status.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${status.color}`} />
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Catégorie & Marque filters */}
          <div className="grid grid-cols-2 gap-3">
            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                <select
                  value={filters.category}
                  onChange={(e) => onChange({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                >
                  <option value="">Toutes</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            {brands.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marque</label>
                <select
                  value={filters.brand}
                  onChange={(e) => onChange({ ...filters, brand: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                >
                  <option value="">Toutes</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Univers & Espèce filters */}
          <div className="grid grid-cols-2 gap-3">
            {universes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Univers</label>
                <select
                  value={filters.universe}
                  onChange={(e) => onChange({ ...filters, universe: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                >
                  <option value="">Tous</option>
                  {universes.map(universe => (
                    <option key={universe} value={universe}>{universe}</option>
                  ))}
                </select>
              </div>
            )}

            {species.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Espèce</label>
                <select
                  value={filters.species}
                  onChange={(e) => {
                    const newSpecies = e.target.value;
                    // Reset subspecies when species changes
                    const availableSubs = getSubspeciesForSpecies(presets, newSpecies);
                    onChange({
                      ...filters,
                      species: newSpecies,
                      subspecies: availableSubs.includes(filters.subspecies) ? filters.subspecies : '',
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                >
                  <option value="">Toutes</option>
                  {species.map(sp => (
                    <option key={sp} value={sp}>{sp}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Sous-Espèce & Taille filters */}
          <div className="grid grid-cols-2 gap-3">
            {(filters.species ? getSubspeciesForSpecies(presets, filters.species).length > 0 : subspecies.length > 0) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sous-Espèce</label>
                <select
                  value={filters.subspecies}
                  onChange={(e) => onChange({ ...filters, subspecies: e.target.value })}
                  disabled={!filters.species}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{filters.species ? 'Toutes' : 'Choisir une espèce'}</option>
                  {(filters.species ? getSubspeciesForSpecies(presets, filters.species) : subspecies).map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Taille</label>
              <select
                value={filters.size}
                onChange={(e) => onChange({ ...filters, size: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
              >
                <option value="">Toutes</option>
                {presets.sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Alignement filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alignement</label>
            <select
              value={filters.alignment}
              onChange={(e) => onChange({ ...filters, alignment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            >
              <option value="">Tous</option>
              {presets.alignments.map(alignment => (
                <option key={alignment} value={alignment}>{alignment}</option>
              ))}
            </select>
          </div>

          {/* Habitats filter (multi-select) */}
          {habitats.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Habitats</label>
              <div className="flex flex-wrap gap-2">
                {habitats.map(habitat => (
                  <button
                    key={habitat}
                    onClick={() => toggleHabitat(habitat)}
                    className={`px-3 py-1 rounded-full text-sm transition ${
                      filters.habitats.includes(habitat)
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {habitat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags filter */}
          {tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition ${
                      filters.tags.includes(tag)
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
