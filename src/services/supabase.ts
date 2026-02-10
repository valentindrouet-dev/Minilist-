import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Figurine, FigurineInput } from '../types';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;

export const isSupabaseConfigured = () => {
  return SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '';
};

export const getSupabase = () => {
  if (!supabase && isSupabaseConfigured()) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabase;
};

// Local storage fallback for when Supabase is not configured
const LOCAL_STORAGE_KEY = 'minilist_figurines';

// Helper to convert file to base64
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const getLocalFigurines = (): Figurine[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveLocalFigurines = (figurines: Figurine[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(figurines));
};

// Convert from database format (snake_case) to app format (camelCase)
const fromDatabase = (row: Record<string, unknown>): Figurine => ({
  id: row.id as string,
  name: row.name as string,
  original_name: row.original_name as string || '',
  category: row.category as string || '',
  brand: row.brand as string || '',
  game: row.game as string || '',
  collection: row.collection as string || '',
  universe: row.universe as string || '',
  species: row.species as string || '',
  subspecies: row.subspecies as string || '',
  size: row.size as string || 'Normal',
  alignment: row.alignment as string || '',
  material: row.material as string || '',
  group: row.group as string || '',
  habitats: row.habitats as string[] || [],
  status: row.status as string || 'unpainted',
  statusBreakdown: row.status_breakdown as Figurine['statusBreakdown'] || [],
  price: row.price as number | null,
  quantity: row.quantity as number || 1,
  tags: row.tags as string[] || [],
  notes: row.notes as string || '',
  image_url: row.image_url as string | null,
  is_own_image: row.is_own_image as boolean || false,
  created_at: row.created_at as string,
  updated_at: row.updated_at as string,
});

// Convert from app format (camelCase) to database format (snake_case)
const toDatabase = (figurine: Partial<FigurineInput> & { id?: string; created_at?: string; updated_at?: string }) => {
  const result: Record<string, unknown> = {};

  if (figurine.id !== undefined) result.id = figurine.id;
  if (figurine.name !== undefined) result.name = figurine.name;
  if (figurine.original_name !== undefined) result.original_name = figurine.original_name;
  if (figurine.category !== undefined) result.category = figurine.category;
  if (figurine.brand !== undefined) result.brand = figurine.brand;
  if (figurine.game !== undefined) result.game = figurine.game;
  if (figurine.collection !== undefined) result.collection = figurine.collection;
  if (figurine.universe !== undefined) result.universe = figurine.universe;
  if (figurine.species !== undefined) result.species = figurine.species;
  if (figurine.subspecies !== undefined) result.subspecies = figurine.subspecies;
  if (figurine.size !== undefined) result.size = figurine.size;
  if (figurine.alignment !== undefined) result.alignment = figurine.alignment;
  if (figurine.material !== undefined) result.material = figurine.material;
  if (figurine.group !== undefined) result.group = figurine.group;
  if (figurine.habitats !== undefined) result.habitats = figurine.habitats;
  if (figurine.status !== undefined) result.status = figurine.status;
  if (figurine.statusBreakdown !== undefined) result.status_breakdown = figurine.statusBreakdown;
  if (figurine.price !== undefined) result.price = figurine.price;
  if (figurine.quantity !== undefined) result.quantity = figurine.quantity;
  if (figurine.tags !== undefined) result.tags = figurine.tags;
  if (figurine.notes !== undefined) result.notes = figurine.notes;
  if (figurine.image_url !== undefined) result.image_url = figurine.image_url;
  if (figurine.is_own_image !== undefined) result.is_own_image = figurine.is_own_image;
  if (figurine.created_at !== undefined) result.created_at = figurine.created_at;
  if (figurine.updated_at !== undefined) result.updated_at = figurine.updated_at;

  return result;
};

export const figurineService = {
  async getAll(): Promise<Figurine[]> {
    const client = getSupabase();

    if (client) {
      const { data, error } = await client
        .from('figurines')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(fromDatabase);
    }

    return getLocalFigurines();
  },

  async getById(id: string): Promise<Figurine | null> {
    const client = getSupabase();

    if (client) {
      const { data, error } = await client
        .from('figurines')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? fromDatabase(data) : null;
    }

    const figurines = getLocalFigurines();
    return figurines.find(f => f.id === id) || null;
  },

  async create(input: FigurineInput): Promise<Figurine> {
    const client = getSupabase();
    const now = new Date().toISOString();

    const figurine: Figurine = {
      ...input,
      id: uuidv4(),
      created_at: now,
      updated_at: now,
    };

    if (client) {
      const dbData = toDatabase(figurine);
      const { data, error } = await client
        .from('figurines')
        .insert(dbData)
        .select()
        .single();

      if (error) throw error;
      return fromDatabase(data);
    }

    const figurines = getLocalFigurines();
    figurines.unshift(figurine);
    try {
      saveLocalFigurines(figurines);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('Espace de stockage local insuffisant. Supprimez des figurines ou exportez vos données.');
      }
      throw error;
    }
    return figurine;
  },

  async update(id: string, input: Partial<FigurineInput>): Promise<Figurine> {
    const client = getSupabase();
    const now = new Date().toISOString();

    if (client) {
      const dbData = toDatabase({ ...input, updated_at: now });
      const { data, error } = await client
        .from('figurines')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return fromDatabase(data);
    }

    const figurines = getLocalFigurines();
    const index = figurines.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Figurine not found');

    figurines[index] = { ...figurines[index], ...input, updated_at: now };
    try {
      saveLocalFigurines(figurines);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('Espace de stockage local insuffisant. Essayez avec une image plus petite ou supprimez des figurines.');
      }
      throw error;
    }
    return figurines[index];
  },

  async batchUpdate(ids: string[], input: Partial<FigurineInput>): Promise<Figurine[]> {
    const client = getSupabase();
    const now = new Date().toISOString();

    if (client) {
      // For Supabase, we can run updates in parallel safely
      const dbData = toDatabase({ ...input, updated_at: now });
      const updatePromises = ids.map(async (id) => {
        const { data, error } = await client
          .from('figurines')
          .update(dbData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return fromDatabase(data);
      });
      return Promise.all(updatePromises);
    }

    // For localStorage, we need to update all figurines atomically to avoid race conditions
    const figurines = getLocalFigurines();
    const updatedFigurines: Figurine[] = [];

    for (const id of ids) {
      const index = figurines.findIndex(f => f.id === id);
      if (index !== -1) {
        figurines[index] = { ...figurines[index], ...input, updated_at: now };
        updatedFigurines.push(figurines[index]);
      }
    }

    try {
      saveLocalFigurines(figurines);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('Espace de stockage local insuffisant.');
      }
      throw error;
    }

    return updatedFigurines;
  },

  async delete(id: string): Promise<void> {
    const client = getSupabase();

    if (client) {
      const { error } = await client
        .from('figurines')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return;
    }

    const figurines = getLocalFigurines();
    const filtered = figurines.filter(f => f.id !== id);
    saveLocalFigurines(filtered);
  },

  async uploadImage(file: File): Promise<string> {
    const client = getSupabase();

    if (client) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `figurines/${fileName}`;

        const { error } = await client.storage
          .from('images')
          .upload(filePath, file);

        if (error) {
          // If bucket not found or storage error, fallback to base64
          console.warn('Supabase storage error, falling back to base64:', error.message);
          return convertToBase64(file);
        }

        const { data } = client.storage
          .from('images')
          .getPublicUrl(filePath);

        return data.publicUrl;
      } catch (err) {
        // On any error, fallback to base64
        console.warn('Storage error, falling back to base64:', err);
        return convertToBase64(file);
      }
    }

    // Local fallback: convert to base64
    return convertToBase64(file);
  },

  async search(query: string): Promise<Figurine[]> {
    const client = getSupabase();
    const lowerQuery = query.toLowerCase();

    if (client) {
      const { data, error } = await client
        .from('figurines')
        .select('*')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%,category.ilike.%${query}%,notes.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }

    const figurines = getLocalFigurines();
    return figurines.filter(f =>
      f.name.toLowerCase().includes(lowerQuery) ||
      f.brand.toLowerCase().includes(lowerQuery) ||
      f.category.toLowerCase().includes(lowerQuery) ||
      f.notes.toLowerCase().includes(lowerQuery) ||
      f.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
  },

  exportData(): string {
    const figurines = getLocalFigurines();
    return JSON.stringify(figurines, null, 2);
  },

  async importData(jsonString: string): Promise<number> {
    const figurines: Figurine[] = JSON.parse(jsonString);
    const client = getSupabase();

    if (client) {
      // Convert to database format and upsert
      const dbData = figurines.map(f => toDatabase(f));
      const { error } = await client
        .from('figurines')
        .upsert(dbData);

      if (error) throw error;
    } else {
      saveLocalFigurines(figurines);
    }

    return figurines.length;
  },

  // Get count of figurines in localStorage
  getLocalCount(): number {
    return getLocalFigurines().length;
  },

  // Check if localStorage has data to migrate
  hasLocalData(): boolean {
    return getLocalFigurines().length > 0;
  },

  // Migrate all data from localStorage to Supabase
  async migrateToSupabase(onProgress?: (current: number, total: number) => void): Promise<{ success: number; errors: string[] }> {
    const client = getSupabase();
    if (!client) {
      throw new Error('Supabase n\'est pas configuré');
    }

    const localFigurines = getLocalFigurines();
    if (localFigurines.length === 0) {
      return { success: 0, errors: [] };
    }

    let success = 0;
    const errors: string[] = [];

    // Process in batches to avoid overwhelming the API
    const batchSize = 50;
    for (let i = 0; i < localFigurines.length; i += batchSize) {
      const batch = localFigurines.slice(i, i + batchSize);
      const dbBatch = batch.map(f => toDatabase(f));

      try {
        const { error } = await client
          .from('figurines')
          .upsert(dbBatch, { onConflict: 'id' });

        if (error) {
          errors.push(`Lot ${Math.floor(i / batchSize) + 1}: ${error.message}`);
        } else {
          success += batch.length;
        }
      } catch (err) {
        errors.push(`Lot ${Math.floor(i / batchSize) + 1}: ${err instanceof Error ? err.message : 'Erreur'}`);
      }

      if (onProgress) {
        onProgress(Math.min(i + batchSize, localFigurines.length), localFigurines.length);
      }
    }

    return { success, errors };
  },

  // Clear localStorage data (after successful migration)
  clearLocalData(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
};
