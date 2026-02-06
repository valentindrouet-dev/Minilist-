import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Presets, StatusPreset, SubspeciesBySpecies } from '../types';
import { DEFAULT_PRESETS, getAllSubspecies } from '../types';

type PresetField = 'categories' | 'brands' | 'universes' | 'species' | 'sizes' | 'alignments' | 'habitats';

interface PresetContextType {
  presets: Presets;
  subspecies: string[]; // Flat list for backward compatibility
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  addBrand: (brand: string) => void;
  removeBrand: (brand: string) => void;
  addUniverse: (universe: string) => void;
  removeUniverse: (universe: string) => void;
  addSpecies: (species: string) => void;
  removeSpecies: (species: string) => void;
  addSubspecies: (species: string, subspecies: string) => void;
  removeSubspecies: (species: string, subspecies: string) => void;
  getSubspeciesForSpecies: (species: string) => string[];
  addSize: (size: string) => void;
  removeSize: (size: string) => void;
  addAlignment: (alignment: string) => void;
  removeAlignment: (alignment: string) => void;
  addHabitat: (habitat: string) => void;
  removeHabitat: (habitat: string) => void;
  addStatus: (status: StatusPreset) => void;
  removeStatus: (value: string) => void;
  updateStatus: (value: string, updates: Partial<StatusPreset>) => void;
  resetPresets: () => void;
  // New: edit and reorder
  editPresetItem: (field: PresetField, oldValue: string, newValue: string) => void;
  reorderPreset: (field: PresetField, items: string[]) => void;
  reorderStatuses: (statuses: StatusPreset[]) => void;
  movePresetItem: (field: PresetField, index: number, direction: 'up' | 'down') => void;
  moveStatus: (index: number, direction: 'up' | 'down') => void;
  sortPresetAlpha: (field: PresetField) => void;
}

const PresetContext = createContext<PresetContextType | undefined>(undefined);

const STORAGE_KEY = 'minilist_presets';

// Migration helper: convert old subspecies array to new subspeciesBySpecies format
function migrateSubspecies(parsed: Record<string, unknown>): SubspeciesBySpecies {
  // If already has new format, use it
  if (parsed.subspeciesBySpecies && typeof parsed.subspeciesBySpecies === 'object') {
    return parsed.subspeciesBySpecies as SubspeciesBySpecies;
  }
  // Return default subspecies by species
  return DEFAULT_PRESETS.subspeciesBySpecies;
}

export function PresetProvider({ children }: { children: ReactNode }) {
  const [presets, setPresets] = useState<Presets>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all fields exist, with migration
        return {
          ...DEFAULT_PRESETS,
          ...parsed,
          subspeciesBySpecies: migrateSubspecies(parsed),
        };
      } catch {
        return DEFAULT_PRESETS;
      }
    }
    return DEFAULT_PRESETS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  }, [presets]);

  // Helper to sort alphabetically (French locale)
  const sortAlpha = (arr: string[]) => [...arr].sort((a, b) => a.localeCompare(b, 'fr'));

  const addCategory = (category: string) => {
    if (!presets.categories.includes(category)) {
      setPresets(prev => ({ ...prev, categories: sortAlpha([...prev.categories, category]) }));
    }
  };

  const removeCategory = (category: string) => {
    setPresets(prev => ({ ...prev, categories: prev.categories.filter(c => c !== category) }));
  };

  const addBrand = (brand: string) => {
    if (!presets.brands.includes(brand)) {
      setPresets(prev => ({ ...prev, brands: sortAlpha([...prev.brands, brand]) }));
    }
  };

  const removeBrand = (brand: string) => {
    setPresets(prev => ({ ...prev, brands: prev.brands.filter(b => b !== brand) }));
  };

  const addUniverse = (universe: string) => {
    if (!presets.universes.includes(universe)) {
      setPresets(prev => ({ ...prev, universes: sortAlpha([...prev.universes, universe]) }));
    }
  };

  const removeUniverse = (universe: string) => {
    setPresets(prev => ({ ...prev, universes: prev.universes.filter(u => u !== universe) }));
  };

  const addSpecies = (species: string) => {
    if (!presets.species.includes(species)) {
      setPresets(prev => ({ ...prev, species: sortAlpha([...prev.species, species]) }));
    }
  };

  const removeSpecies = (species: string) => {
    setPresets(prev => ({ ...prev, species: prev.species.filter(s => s !== species) }));
  };

  const addSubspecies = (species: string, subspecies: string) => {
    setPresets(prev => {
      const currentSubs = prev.subspeciesBySpecies[species] || [];
      if (currentSubs.includes(subspecies)) return prev;
      return {
        ...prev,
        subspeciesBySpecies: {
          ...prev.subspeciesBySpecies,
          [species]: sortAlpha([...currentSubs, subspecies]),
        },
      };
    });
  };

  const removeSubspecies = (species: string, subspecies: string) => {
    setPresets(prev => {
      const currentSubs = prev.subspeciesBySpecies[species] || [];
      return {
        ...prev,
        subspeciesBySpecies: {
          ...prev.subspeciesBySpecies,
          [species]: currentSubs.filter(s => s !== subspecies),
        },
      };
    });
  };

  const getSubspeciesForSpecies = (species: string): string[] => {
    return presets.subspeciesBySpecies[species] || [];
  };

  const addSize = (size: string) => {
    if (!presets.sizes.includes(size)) {
      setPresets(prev => ({ ...prev, sizes: [...prev.sizes, size] }));
    }
  };

  const removeSize = (size: string) => {
    setPresets(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== size) }));
  };

  const addAlignment = (alignment: string) => {
    if (!presets.alignments.includes(alignment)) {
      setPresets(prev => ({ ...prev, alignments: [...prev.alignments, alignment] }));
    }
  };

  const removeAlignment = (alignment: string) => {
    setPresets(prev => ({ ...prev, alignments: prev.alignments.filter(a => a !== alignment) }));
  };

  const addHabitat = (habitat: string) => {
    if (!presets.habitats.includes(habitat)) {
      setPresets(prev => ({ ...prev, habitats: sortAlpha([...prev.habitats, habitat]) }));
    }
  };

  const removeHabitat = (habitat: string) => {
    setPresets(prev => ({ ...prev, habitats: prev.habitats.filter(h => h !== habitat) }));
  };

  const addStatus = (status: StatusPreset) => {
    if (!presets.statuses.find(s => s.value === status.value)) {
      setPresets(prev => ({ ...prev, statuses: [...prev.statuses, status] }));
    }
  };

  const removeStatus = (value: string) => {
    setPresets(prev => ({ ...prev, statuses: prev.statuses.filter(s => s.value !== value) }));
  };

  const updateStatus = (value: string, updates: Partial<StatusPreset>) => {
    setPresets(prev => ({
      ...prev,
      statuses: prev.statuses.map(s => s.value === value ? { ...s, ...updates } : s),
    }));
  };

  const resetPresets = () => {
    setPresets(DEFAULT_PRESETS);
  };

  // Edit a preset item (rename)
  const editPresetItem = (field: PresetField, oldValue: string, newValue: string) => {
    if (oldValue === newValue || !newValue.trim()) return;
    setPresets(prev => {
      const items = prev[field] as string[];
      if (items.includes(newValue)) return prev; // Don't allow duplicates
      return {
        ...prev,
        [field]: items.map(item => item === oldValue ? newValue.trim() : item),
      };
    });
  };

  // Reorder preset items (set entire list)
  const reorderPreset = (field: PresetField, items: string[]) => {
    setPresets(prev => ({ ...prev, [field]: items }));
  };

  // Reorder statuses
  const reorderStatuses = (statuses: StatusPreset[]) => {
    setPresets(prev => ({ ...prev, statuses }));
  };

  // Move a preset item up or down
  const movePresetItem = (field: PresetField, index: number, direction: 'up' | 'down') => {
    setPresets(prev => {
      const items = [...(prev[field] as string[])];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= items.length) return prev;
      [items[index], items[newIndex]] = [items[newIndex], items[index]];
      return { ...prev, [field]: items };
    });
  };

  // Move a status up or down
  const moveStatus = (index: number, direction: 'up' | 'down') => {
    setPresets(prev => {
      const items = [...prev.statuses];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= items.length) return prev;
      [items[index], items[newIndex]] = [items[newIndex], items[index]];
      return { ...prev, statuses: items };
    });
  };

  // Sort preset alphabetically
  const sortPresetAlpha = (field: PresetField) => {
    setPresets(prev => {
      const items = [...(prev[field] as string[])];
      return { ...prev, [field]: sortAlpha(items) };
    });
  };

  // Flat list of all subspecies for backward compatibility
  const subspeciesList = getAllSubspecies(presets);

  return (
    <PresetContext.Provider
      value={{
        presets,
        subspecies: subspeciesList,
        addCategory,
        removeCategory,
        addBrand,
        removeBrand,
        addUniverse,
        removeUniverse,
        addSpecies,
        removeSpecies,
        addSubspecies,
        removeSubspecies,
        getSubspeciesForSpecies,
        addSize,
        removeSize,
        addAlignment,
        removeAlignment,
        addHabitat,
        removeHabitat,
        addStatus,
        removeStatus,
        updateStatus,
        resetPresets,
        editPresetItem,
        reorderPreset,
        reorderStatuses,
        movePresetItem,
        moveStatus,
        sortPresetAlpha,
      }}
    >
      {children}
    </PresetContext.Provider>
  );
}

export function usePresets() {
  const context = useContext(PresetContext);
  if (context === undefined) {
    throw new Error('usePresets must be used within a PresetProvider');
  }
  return context;
}
