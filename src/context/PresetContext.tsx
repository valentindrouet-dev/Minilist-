import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Presets, StatusPreset } from '../types';
import { DEFAULT_PRESETS } from '../types';

interface PresetContextType {
  presets: Presets;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  addBrand: (brand: string) => void;
  removeBrand: (brand: string) => void;
  addUniverse: (universe: string) => void;
  removeUniverse: (universe: string) => void;
  addSpecies: (species: string) => void;
  removeSpecies: (species: string) => void;
  addSubspecies: (subspecies: string) => void;
  removeSubspecies: (subspecies: string) => void;
  addSize: (size: string) => void;
  removeSize: (size: string) => void;
  addHabitat: (habitat: string) => void;
  removeHabitat: (habitat: string) => void;
  addStatus: (status: StatusPreset) => void;
  removeStatus: (value: string) => void;
  updateStatus: (value: string, updates: Partial<StatusPreset>) => void;
  resetPresets: () => void;
}

const PresetContext = createContext<PresetContextType | undefined>(undefined);

const STORAGE_KEY = 'minilist_presets';

export function PresetProvider({ children }: { children: ReactNode }) {
  const [presets, setPresets] = useState<Presets>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all fields exist
        return {
          ...DEFAULT_PRESETS,
          ...parsed,
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

  const addSubspecies = (subspecies: string) => {
    if (!presets.subspecies.includes(subspecies)) {
      setPresets(prev => ({ ...prev, subspecies: sortAlpha([...prev.subspecies, subspecies]) }));
    }
  };

  const removeSubspecies = (subspecies: string) => {
    setPresets(prev => ({ ...prev, subspecies: prev.subspecies.filter(s => s !== subspecies) }));
  };

  const addSize = (size: string) => {
    if (!presets.sizes.includes(size)) {
      setPresets(prev => ({ ...prev, sizes: [...prev.sizes, size] }));
    }
  };

  const removeSize = (size: string) => {
    setPresets(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== size) }));
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

  return (
    <PresetContext.Provider
      value={{
        presets,
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
        addSize,
        removeSize,
        addHabitat,
        removeHabitat,
        addStatus,
        removeStatus,
        updateStatus,
        resetPresets,
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
