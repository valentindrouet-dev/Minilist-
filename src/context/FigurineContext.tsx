import React, { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { Figurine, FigurineInput, FilterState, SortState, GridSize, BatchEditInput } from '../types';
import { figurineService, isSupabaseConfigured } from '../services/supabase';

interface FigurineContextType {
  figurines: Figurine[];
  filteredFigurines: Figurine[];
  loading: boolean;
  syncing: boolean;
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
const KEEPALIVE_KEY = 'minilist_keepalive_last';
const KEEPALIVE_INTERVAL_MS = 5 * 24 * 60 * 60 * 1000; // 5 days
const CACHE_KEY = 'minilist_figurines_cache';

// Normalize a figurine from DB/cache to ensure all fields have defaults
const normalizeFigurine = (f: Figurine): Figurine => {
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
    material: f.material || '',
    group: f.group || '',
    habitats,
    price: f.price ?? null,
    quantity: f.quantity || 1,
    is_own_image: f.is_own_image || false,
    statusBreakdown: f.statusBreakdown || [],
  };
};

// Save figurines to cache, ignoring quota errors
const saveCache = (data: Figurine[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Quota exceeded (likely due to base64 images) — cache unavailable, not critical
  }
};

// Load figurines from cache
const loadCache = (): Figurine[] | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Figurine[];
  } catch {
    return null;
  }
};

export function FigurineProvider({ children }: { children: ReactNode }) {
  const [figurines, setFigurines] = useState<Figurine[]>([]);
  const [loading, setLoading] = useState(true);   // true only on first load with no cache
  const [syncing, setSyncing] = useState(false);   // true during background refresh
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const isMounted = useRef(true);

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

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Core fetch function — fetches from Supabase (or localStorage) and normalizes
  const fetchFromSource = useCallback(async (): Promise<Figurine[]> => {
    const data = await figurineService.getAll();
    return data.map(normalizeFigurine);
  }, []);

  // Full refresh (called manually by user via "Réessayer" button)
  const refreshFigurines = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFromSource();
      if (!isMounted.current) return;
      setFigurines(data);
      saveCache(data);
    } catch (err) {
      if (!isMounted.current) return;
      const msg = err instanceof Error ? err.message : 'Erreur lors du chargement';
      if (msg.includes('timeout') || msg.includes('canceling statement')) {
        setError('Connexion lente à la base de données. Cliquez sur "Réessayer" pour recharger.');
      } else {
        setError(msg);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [fetchFromSource]);

  // Background refresh (stale-while-revalidate) — never shows loading spinner
  const backgroundRefresh = useCallback(async () => {
    if (!isMounted.current) return;
    setSyncing(true);
    try {
      const data = await fetchFromSource();
      if (!isMounted.current) return;
      setFigurines(data);
      saveCache(data);
      setError(null);
    } catch (err) {
      // Background errors are silent — user already sees cached data
      console.warn('[background refresh] failed:', err instanceof Error ? err.message : err);
    } finally {
      if (isMounted.current) setSyncing(false);
    }
  }, [fetchFromSource]);

  // On mount: show cache immediately, then refresh in background (Option 1 + 2)
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Local mode: just load directly, no cache needed
      refreshFigurines();
      return;
    }

    const cached = loadCache();
    if (cached && cached.length > 0) {
      // Show cached data instantly — no spinner
      setFigurines(cached.map(normalizeFigurine));
      setLoading(false);
      // Refresh from Supabase silently in background
      backgroundRefresh();
    } else {
      // No cache yet — show spinner and load normally
      refreshFigurines();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep-alive: ping Supabase every 5 days to prevent automatic project pausing
  useEffect(() => {
    const runKeepAlive = async () => {
      const lastPing = localStorage.getItem(KEEPALIVE_KEY);
      const now = Date.now();

      if (lastPing && now - parseInt(lastPing, 10) < KEEPALIVE_INTERVAL_MS) {
        return;
      }

      try {
        const result = await figurineService.testConnection();
        if (result.ok) {
          localStorage.setItem(KEEPALIVE_KEY, String(now));
          console.log('[keep-alive] Supabase ping OK, projet actif.');
        }
      } catch {
        // Silently ignore keep-alive errors
      }
    };

    runKeepAlive();
    const interval = setInterval(runKeepAlive, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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

      // Put empty/undefined values last (regardless of sort order)
      const aEmpty = aVal === '' || aVal === null || aVal === undefined;
      const bEmpty = bVal === '' || bVal === null || bVal === undefined;
      if (aEmpty && !bEmpty) return 1;
      if (!aEmpty && bEmpty) return -1;
      if (aEmpty && bEmpty) return 0;

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
    setFigurines(prev => {
      const updated = [newFigurine, ...prev];
      saveCache(updated);
      return updated;
    });
    return newFigurine;
  };

  const updateFigurine = async (id: string, input: Partial<FigurineInput>): Promise<Figurine> => {
    const updated = await figurineService.update(id, input);
    setFigurines(prev => {
      const next = prev.map(f => f.id === id ? updated : f);
      saveCache(next);
      return next;
    });
    return updated;
  };

  const batchUpdateFigurines = async (ids: string[], input: BatchEditInput): Promise<void> => {
    const cleanInput = Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== undefined && v !== '')
    );

    if (Object.keys(cleanInput).length === 0) return;

    const updatedFigurines = await figurineService.batchUpdate(ids, cleanInput);

    setFigurines(prev => {
      const next = prev.map(f => {
        const updated = updatedFigurines.find(u => u.id === f.id);
        return updated || f;
      });
      saveCache(next);
      return next;
    });
  };

  const deleteFigurine = async (id: string): Promise<void> => {
    await figurineService.delete(id);
    setFigurines(prev => {
      const next = prev.filter(f => f.id !== id);
      saveCache(next);
      return next;
    });
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
        syncing,
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
