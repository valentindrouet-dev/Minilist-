import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Figurine, FigurineInput, FilterState, SortState, GridSize } from '../types';
import { figurineService } from '../services/supabase';

interface FigurineContextType {
  figurines: Figurine[];
  filteredFigurines: Figurine[];
  loading: boolean;
  error: string | null;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  sort: SortState;
  setSort: React.Dispatch<React.SetStateAction<SortState>>;
  gridSize: GridSize;
  setGridSize: React.Dispatch<React.SetStateAction<GridSize>>;
  addFigurine: (input: FigurineInput) => Promise<Figurine>;
  updateFigurine: (id: string, input: Partial<FigurineInput>) => Promise<Figurine>;
  deleteFigurine: (id: string) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
  refreshFigurines: () => Promise<void>;
  allBrands: string[];
  allCategories: string[];
  allSubcategories: string[];
  allUniverses: string[];
  allTags: string[];
}

const FigurineContext = createContext<FigurineContextType | undefined>(undefined);

const initialFilters: FilterState = {
  search: '',
  brand: '',
  category: '',
  subcategory: '',
  universe: '',
  status: '',
  tags: [],
};

const initialSort: SortState = {
  field: 'created_at',
  order: 'desc',
};

const GRID_SIZE_KEY = 'minilist_grid_size';
const SORT_KEY = 'minilist_sort';

export function FigurineProvider({ children }: { children: ReactNode }) {
  const [figurines, setFigurines] = useState<Figurine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const [sort, setSort] = useState<SortState>(() => {
    const stored = localStorage.getItem(SORT_KEY);
    return stored ? JSON.parse(stored) : initialSort;
  });

  const [gridSize, setGridSize] = useState<GridSize>(() => {
    return (localStorage.getItem(GRID_SIZE_KEY) as GridSize) || 'md';
  });

  useEffect(() => {
    localStorage.setItem(GRID_SIZE_KEY, gridSize);
  }, [gridSize]);

  useEffect(() => {
    localStorage.setItem(SORT_KEY, JSON.stringify(sort));
  }, [sort]);

  const refreshFigurines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await figurineService.getAll();
      // Ensure new fields have default values for old data
      const normalizedData = data.map(f => ({
        ...f,
        subcategory: f.subcategory || '',
        universe: f.universe || '',
      }));
      setFigurines(normalizedData);
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
    let result = figurines.filter(fig => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search ||
        fig.name.toLowerCase().includes(searchLower) ||
        fig.brand.toLowerCase().includes(searchLower) ||
        fig.category.toLowerCase().includes(searchLower) ||
        (fig.subcategory || '').toLowerCase().includes(searchLower) ||
        (fig.universe || '').toLowerCase().includes(searchLower) ||
        fig.notes.toLowerCase().includes(searchLower) ||
        fig.tags.some(t => t.toLowerCase().includes(searchLower));

      const matchesBrand = !filters.brand || fig.brand === filters.brand;
      const matchesCategory = !filters.category || fig.category === filters.category;
      const matchesSubcategory = !filters.subcategory || fig.subcategory === filters.subcategory;
      const matchesUniverse = !filters.universe || fig.universe === filters.universe;
      const matchesStatus = !filters.status || fig.status === filters.status;
      const matchesTags = filters.tags.length === 0 ||
        filters.tags.every(tag => fig.tags.includes(tag));

      return matchesSearch && matchesBrand && matchesCategory && matchesSubcategory && matchesUniverse && matchesStatus && matchesTags;
    });

    // Sort
    result = [...result].sort((a, b) => {
      let aVal: string | number = a[sort.field] || '';
      let bVal: string | number = b[sort.field] || '';

      if (sort.field === 'created_at' || sort.field === 'updated_at') {
        aVal = new Date(aVal as string).getTime();
        bVal = new Date(bVal as string).getTime();
        return sort.order === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const comparison = aVal.toString().localeCompare(bVal.toString(), 'fr', { numeric: true });
      return sort.order === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [figurines, filters, sort]);

  const allBrands = React.useMemo(() => {
    const brands = new Set(figurines.map(f => f.brand).filter(Boolean));
    return Array.from(brands).sort();
  }, [figurines]);

  const allCategories = React.useMemo(() => {
    const categories = new Set(figurines.map(f => f.category).filter(Boolean));
    return Array.from(categories).sort();
  }, [figurines]);

  const allSubcategories = React.useMemo(() => {
    const subcategories = new Set(figurines.map(f => f.subcategory).filter(Boolean));
    return Array.from(subcategories).sort();
  }, [figurines]);

  const allUniverses = React.useMemo(() => {
    const universes = new Set(figurines.map(f => f.universe).filter(Boolean));
    return Array.from(universes).sort();
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
        sort,
        setSort,
        gridSize,
        setGridSize,
        addFigurine,
        updateFigurine,
        deleteFigurine,
        uploadImage,
        refreshFigurines,
        allBrands,
        allCategories,
        allSubcategories,
        allUniverses,
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
