import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Presets, StatusPreset } from '../types';
import { DEFAULT_PRESETS } from '../types';

interface PresetContextType {
  presets: Presets;
  addBrand: (brand: string) => void;
  removeBrand: (brand: string) => void;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  addSubcategory: (subcategory: string) => void;
  removeSubcategory: (subcategory: string) => void;
  addUniverse: (universe: string) => void;
  removeUniverse: (universe: string) => void;
  addStatus: (status: StatusPreset) => void;
  removeStatus: (value: string) => void;
  updateStatus: (value: string, updates: Partial<StatusPreset>) => void;
  addScale: (scale: string) => void;
  removeScale: (scale: string) => void;
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

  const addBrand = (brand: string) => {
    if (!presets.brands.includes(brand)) {
      setPresets(prev => ({ ...prev, brands: [...prev.brands, brand] }));
    }
  };

  const removeBrand = (brand: string) => {
    setPresets(prev => ({ ...prev, brands: prev.brands.filter(b => b !== brand) }));
  };

  const addCategory = (category: string) => {
    if (!presets.categories.includes(category)) {
      setPresets(prev => ({ ...prev, categories: [...prev.categories, category] }));
    }
  };

  const removeCategory = (category: string) => {
    setPresets(prev => ({ ...prev, categories: prev.categories.filter(c => c !== category) }));
  };

  const addSubcategory = (subcategory: string) => {
    if (!presets.subcategories.includes(subcategory)) {
      setPresets(prev => ({ ...prev, subcategories: [...prev.subcategories, subcategory] }));
    }
  };

  const removeSubcategory = (subcategory: string) => {
    setPresets(prev => ({ ...prev, subcategories: prev.subcategories.filter(s => s !== subcategory) }));
  };

  const addUniverse = (universe: string) => {
    if (!presets.universes.includes(universe)) {
      setPresets(prev => ({ ...prev, universes: [...prev.universes, universe] }));
    }
  };

  const removeUniverse = (universe: string) => {
    setPresets(prev => ({ ...prev, universes: prev.universes.filter(u => u !== universe) }));
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

  const addScale = (scale: string) => {
    if (!presets.scales.includes(scale)) {
      setPresets(prev => ({ ...prev, scales: [...prev.scales, scale] }));
    }
  };

  const removeScale = (scale: string) => {
    setPresets(prev => ({ ...prev, scales: prev.scales.filter(s => s !== scale) }));
  };

  const resetPresets = () => {
    setPresets(DEFAULT_PRESETS);
  };

  return (
    <PresetContext.Provider
      value={{
        presets,
        addBrand,
        removeBrand,
        addCategory,
        removeCategory,
        addSubcategory,
        removeSubcategory,
        addUniverse,
        removeUniverse,
        addStatus,
        removeStatus,
        updateStatus,
        addScale,
        removeScale,
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
