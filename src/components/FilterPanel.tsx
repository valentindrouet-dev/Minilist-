import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { usePresets } from '../context/PresetContext';
import type { FilterState } from '../types';

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
    filters.habitat,
    filters.status,
    filters.tags.length > 0,
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
      habitat: '',
      status: '',
      tags: [],
    });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onChange({ ...filters, tags: newTags });
  };

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
                  onChange={(e) => onChange({ ...filters, species: e.target.value })}
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
            {subspecies.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sous-Espèce</label>
                <select
                  value={filters.subspecies}
                  onChange={(e) => onChange({ ...filters, subspecies: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                >
                  <option value="">Toutes</option>
                  {subspecies.map(sub => (
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

          {/* Habitat filter */}
          {habitats.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Habitat</label>
              <select
                value={filters.habitat}
                onChange={(e) => onChange({ ...filters, habitat: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
              >
                <option value="">Tous</option>
                {habitats.map(habitat => (
                  <option key={habitat} value={habitat}>{habitat}</option>
                ))}
              </select>
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
