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

const getLocalFigurines = (): Figurine[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveLocalFigurines = (figurines: Figurine[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(figurines));
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
      return data || [];
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
      return data;
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
      const { data, error } = await client
        .from('figurines')
        .insert(figurine)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { data, error } = await client
        .from('figurines')
        .update({ ...input, updated_at: now })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `figurines/${fileName}`;

      const { error } = await client.storage
        .from('images')
        .upload(filePath, file);

      if (error) throw error;

      const { data } = client.storage
        .from('images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    }

    // Local fallback: convert to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
      const { error } = await client
        .from('figurines')
        .upsert(figurines);

      if (error) throw error;
    } else {
      saveLocalFigurines(figurines);
    }

    return figurines.length;
  }
};
