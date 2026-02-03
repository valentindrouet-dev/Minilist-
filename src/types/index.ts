export interface Figurine {
  id: string;
  name: string;
  brand: string;
  category: string;
  tags: string[];
  image_url: string | null;
  status: 'unpainted' | 'wip' | 'painted';
  scale: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type FigurineInput = Omit<Figurine, 'id' | 'created_at' | 'updated_at'>;

export interface FilterState {
  search: string;
  brand: string;
  category: string;
  status: string;
  tags: string[];
}

export const BRANDS = [
  'Games Workshop',
  'Warhammer 40K',
  'Age of Sigmar',
  'Reaper Miniatures',
  'Wizkids',
  'Impression 3D',
  'Privateer Press',
  'Corvus Belli',
  'Mantic Games',
  'Autre',
] as const;

export const CATEGORIES = [
  'Héros / Personnage',
  'Infanterie',
  'Cavalerie',
  'Monstre / Créature',
  'Véhicule',
  'Décor / Terrain',
  'PNJ',
  'Joueur',
  'Boss',
  'Autre',
] as const;

export const STATUSES = [
  { value: 'unpainted', label: 'Non peinte', color: 'bg-gray-400' },
  { value: 'wip', label: 'En cours', color: 'bg-yellow-400' },
  { value: 'painted', label: 'Terminée', color: 'bg-green-400' },
] as const;

export const SCALES = [
  '6mm',
  '10mm',
  '15mm',
  '25mm',
  '28mm',
  '32mm',
  '54mm',
  '75mm',
  'Autre',
] as const;
