export interface Figurine {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  universe: string;
  tags: string[];
  image_url: string | null;
  status: string;
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
  subcategory: string;
  universe: string;
  status: string;
  tags: string[];
}

export type SortField = 'name' | 'brand' | 'category' | 'subcategory' | 'universe' | 'status' | 'created_at' | 'updated_at';
export type SortOrder = 'asc' | 'desc';

export interface SortState {
  field: SortField;
  order: SortOrder;
}

export interface StatusPreset {
  value: string;
  label: string;
  color: string;
}

export interface Presets {
  brands: string[];
  categories: string[];
  subcategories: string[];
  universes: string[];
  statuses: StatusPreset[];
  scales: string[];
}

export const DEFAULT_PRESETS: Presets = {
  brands: [
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
  ],
  categories: [
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
  ],
  subcategories: [
    'Humain',
    'Elfe',
    'Nain',
    'Orc',
    'Mort-vivant',
    'Démon',
    'Animal',
    'Dragon',
    'Géant',
    'Robot',
    'Autre',
  ],
  universes: [
    'Warhammer 40K',
    'Age of Sigmar',
    'D&D / Pathfinder',
    'Star Wars',
    'Historique',
    'Science-Fiction',
    'Heroic Fantasy',
    'Horreur',
    'Autre',
  ],
  statuses: [
    { value: 'unpainted', label: 'Non peinte', color: 'bg-gray-400' },
    { value: 'primed', label: 'Sous-couchée', color: 'bg-slate-400' },
    { value: 'wip', label: 'En cours', color: 'bg-yellow-400' },
    { value: 'painted', label: 'Terminée', color: 'bg-green-400' },
    { value: 'based', label: 'Soclée', color: 'bg-emerald-500' },
  ],
  scales: [
    '6mm',
    '10mm',
    '15mm',
    '25mm',
    '28mm',
    '32mm',
    '54mm',
    '75mm',
    'Autre',
  ],
};

export const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'name', label: 'Nom' },
  { value: 'brand', label: 'Marque' },
  { value: 'category', label: 'Catégorie' },
  { value: 'subcategory', label: 'Sous-catégorie' },
  { value: 'universe', label: 'Univers' },
  { value: 'status', label: 'Statut' },
  { value: 'created_at', label: 'Date d\'ajout' },
  { value: 'updated_at', label: 'Dernière modification' },
];

export const GRID_SIZES = [
  { value: 'xs', label: 'Très petit', cols: 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12' },
  { value: 'sm', label: 'Petit', cols: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10' },
  { value: 'md', label: 'Moyen', cols: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' },
  { value: 'lg', label: 'Grand', cols: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' },
  { value: 'xl', label: 'Très grand', cols: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' },
] as const;

export type GridSize = typeof GRID_SIZES[number]['value'];
