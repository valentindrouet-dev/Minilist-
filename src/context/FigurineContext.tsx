import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Figurine, FigurineInput, FilterState, SortState, GridSize, BatchEditInput } from '../types';
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
  batchUpdateFigurines: (ids: string[], input: BatchEditInput) => Promise<void>;
  deleteFigurine: (id: string) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
  refreshFigurines: () => Promise<void>;
  allCategories: string[];
  allBrands: string[];
  allGames: string[];
  allCollections: string[];
  allUniverses: string[];
  allSpecies: string[];
  allSubspecies: string[];
  allHabitats: string[];
  allTags: string[];
}

const FigurineContext = createContext<FigurineContextType | undefined>(undefined);

const initialFilters: FilterState = {
  search: '',
  category: '',
  brand: '',
  universe: '',
  species: '',
  subspecies: '',
  size: '',
  alignment: '',
  habitats: [],
  status: '',
  tags: [],
  onlyOwnImages: false,
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
      // Ensure new fields have default values for old data + migration
      const normalizedData = data.map(f => {
        // Migrate old habitat (string) to habitats (array)
        let habitats: string[] = [];
        if (Array.isArray(f.habitats)) {
          habitats = f.habitats;
        } else if ((f as unknown as { habitat?: string }).habitat) {
          habitats = [(f as unknown as { habitat: string }).habitat];
        }

        return {
          ...f,
          original_name: f.original_name || '',
          category: f.category || '',
          brand: f.brand || '',
          game: f.game || '',
          collection: f.collection || '',
          universe: f.universe || '',
          species: f.species || '',
          subspecies: f.subspecies || '',
          size: f.size || 'Normal',
          alignment: f.alignment || '',
          group: f.group || '',
          habitats,
          price: f.price ?? null,
          quantity: f.quantity || 1,
          is_own_image: f.is_own_image || false,
          statusBreakdown: f.statusBreakdown || [],
        };
      });
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
        (fig.category || '').toLowerCase().includes(searchLower) ||
        (fig.brand || '').toLowerCase().includes(searchLower) ||
        (fig.game || '').toLowerCase().includes(searchLower) ||
        (fig.collection || '').toLowerCase().includes(searchLower) ||
        (fig.group || '').toLowerCase().includes(searchLower) ||
        (fig.universe || '').toLowerCase().includes(searchLower) ||
        (fig.species || '').toLowerCase().includes(searchLower) ||
        (fig.subspecies || '').toLowerCase().includes(searchLower) ||
        (fig.alignment || '').toLowerCase().includes(searchLower) ||
        (fig.notes || '').toLowerCase().includes(searchLower) ||
        fig.tags.some(t => t.toLowerCase().includes(searchLower));

      const matchesCategory = !filters.category || fig.category === filters.category;
      const matchesBrand = !filters.brand || fig.brand === filters.brand;
      const matchesUniverse = !filters.universe || fig.universe === filters.universe;
      const matchesSpecies = !filters.species || fig.species === filters.species;
      const matchesSubspecies = !filters.subspecies || fig.subspecies === filters.subspecies;
      const matchesSize = !filters.size || fig.size === filters.size;
      const matchesAlignment = !filters.alignment || fig.alignment === filters.alignment;
      // Habitats filter: figurine must have at least one of the selected habitats
      const matchesHabitats = filters.habitats.length === 0 ||
        filters.habitats.some(h => fig.habitats.includes(h));
      const matchesStatus = !filters.status || fig.status === filters.status;
      const matchesTags = filters.tags.length === 0 ||
        filters.tags.every(tag => fig.tags.includes(tag));
      const matchesOwnImage = !filters.onlyOwnImages || fig.is_own_image;

      return matchesSearch && matchesCategory && matchesBrand && matchesUniverse &&
             matchesSpecies && matchesSubspecies && matchesSize && matchesAlignment &&
             matchesHabitats && matchesStatus && matchesTags && matchesOwnImage;
    });

    // Sort
    result = [...result].sort((a, b) => {
      let aVal: string | number = (a as unknown as Record<string, unknown>)[sort.field] as string || '';
      let bVal: string | number = (b as unknown as Record<string, unknown>)[sort.field] as string || '';

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

  const allCategories = React.useMemo(() => {
    const items = new Set(figurines.map(f => f.category).filter(Boolean));
    return Array.from(items).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [figurines]);

  const allBrands = React.useMemo(() => {
    const items = new Set(figurines.map(f => f.brand).filter(Boolean));
    return Array.from(items).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [figurines]);

  const allGames = React.useMemo(() => {
    const items = new Set(figurines.map(f => f.game).filter(Boolean));
    return Array.from(items).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [figurines]);

  const allCollections = React.useMemo(() => {
    const items = new Set(figurines.map(f => f.collection).filter(Boolean));
    return Array.from(items).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [figurines]);

  const allUniverses = React.useMemo(() => {
    const items = new Set(figurines.map(f => f.universe).filter(Boolean));
    return Array.from(items).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [figurines]);

  const allSpecies = React.useMemo(() => {
    const items = new Set(figurines.map(f => f.species).filter(Boolean));
    return Array.from(items).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [figurines]);

  const allSubspecies = React.useMemo(() => {
    const items = new Set(figurines.map(f => f.subspecies).filter(Boolean));
    return Array.from(items).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [figurines]);

  const allHabitats = React.useMemo(() => {
    const items = new Set(figurines.flatMap(f => f.habitats || []).filter(Boolean));
    return Array.from(items).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [figurines]);

  const allTags = React.useMemo(() => {
    const tags = new Set(figurines.flatMap(f => f.tags));
    return Array.from(tags).sort((a, b) => a.localeCompare(b, 'fr'));
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

  const batchUpdateFigurines = async (ids: string[], input: BatchEditInput): Promise<void> => {
    // Filter out undefined values
    const cleanInput = Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== undefined && v !== '')
    );

    if (Object.keys(cleanInput).length === 0) return;

    // Use atomic batch update to avoid race conditions with localStorage
    const updatedFigurines = await figurineService.batchUpdate(ids, cleanInput);

    // Update local state
    setFigurines(prev => prev.map(f => {
      const updated = updatedFigurines.find(u => u.id === f.id);
      return updated || f;
    }));
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
        batchUpdateFigurines,
        deleteFigurine,
        uploadImage,
        refreshFigurines,
        allCategories,
        allBrands,
        allGames,
        allCollections,
        allUniverses,
        allSpecies,
        allSubspecies,
        allHabitats,
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
