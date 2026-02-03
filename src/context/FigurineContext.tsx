import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Figurine, FigurineInput, FilterState } from '../types';
import { figurineService } from '../services/supabase';

interface FigurineContextType {
  figurines: Figurine[];
  filteredFigurines: Figurine[];
  loading: boolean;
  error: string | null;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  addFigurine: (input: FigurineInput) => Promise<Figurine>;
  updateFigurine: (id: string, input: Partial<FigurineInput>) => Promise<Figurine>;
  deleteFigurine: (id: string) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
  refreshFigurines: () => Promise<void>;
  allBrands: string[];
  allCategories: string[];
  allTags: string[];
}

const FigurineContext = createContext<FigurineContextType | undefined>(undefined);

const initialFilters: FilterState = {
  search: '',
  brand: '',
  category: '',
  status: '',
  tags: [],
};

export function FigurineProvider({ children }: { children: ReactNode }) {
  const [figurines, setFigurines] = useState<Figurine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const refreshFigurines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await figurineService.getAll();
      setFigurines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFigurines();
  }, [refreshFigurines]);

  const filteredFigurines = React.useMemo(() => {
    return figurines.filter(fig => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search ||
        fig.name.toLowerCase().includes(searchLower) ||
        fig.brand.toLowerCase().includes(searchLower) ||
        fig.category.toLowerCase().includes(searchLower) ||
        fig.notes.toLowerCase().includes(searchLower) ||
        fig.tags.some(t => t.toLowerCase().includes(searchLower));

      const matchesBrand = !filters.brand || fig.brand === filters.brand;
      const matchesCategory = !filters.category || fig.category === filters.category;
      const matchesStatus = !filters.status || fig.status === filters.status;
      const matchesTags = filters.tags.length === 0 ||
        filters.tags.every(tag => fig.tags.includes(tag));

      return matchesSearch && matchesBrand && matchesCategory && matchesStatus && matchesTags;
    });
  }, [figurines, filters]);

  const allBrands = React.useMemo(() => {
    const brands = new Set(figurines.map(f => f.brand).filter(Boolean));
    return Array.from(brands).sort();
  }, [figurines]);

  const allCategories = React.useMemo(() => {
    const categories = new Set(figurines.map(f => f.category).filter(Boolean));
    return Array.from(categories).sort();
  }, [figurines]);

  const allTags = React.useMemo(() => {
    const tags = new Set(figurines.flatMap(f => f.tags));
    return Array.from(tags).sort();
  }, [figurines]);

  const addFigurine = async (input: FigurineInput): Promise<Figurine> => {
    const newFigurine = await figurineService.create(input);
    setFigurines(prev => [newFigurine, ...prev]);
    return newFigurine;
  };

  const updateFigurine = async (id: string, input: Partial<FigurineInput>): Promise<Figurine> => {
    const updated = await figurineService.update(id, input);
    setFigurines(prev => prev.map(f => f.id === id ? updated : f));
    return updated;
  };

  const deleteFigurine = async (id: string): Promise<void> => {
    await figurineService.delete(id);
    setFigurines(prev => prev.filter(f => f.id !== id));
  };

  const uploadImage = async (file: File): Promise<string> => {
    return figurineService.uploadImage(file);
  };

  return (
    <FigurineContext.Provider
      value={{
        figurines,
        filteredFigurines,
        loading,
        error,
        filters,
        setFilters,
        addFigurine,
        updateFigurine,
        deleteFigurine,
        uploadImage,
        refreshFigurines,
        allBrands,
        allCategories,
        allTags,
      }}
    >
      {children}
    </FigurineContext.Provider>
  );
}

export function useFigurines() {
  const context = useContext(FigurineContext);
  if (context === undefined) {
    throw new Error('useFigurines must be used within a FigurineProvider');
  }
  return context;
}
