export interface Figurine {
  id: string;
  name: string;
  category: string;
  brand: string;
  game: string;
  collection: string;
  universe: string;
  species: string;
  subspecies: string;
  size: string;
  habitat: string;
  status: string;
  quantity: number;
  tags: string[];
  notes: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// Pour la modification par lot (champs optionnels)
export interface BatchEditInput {
  category?: string;
  brand?: string;
  universe?: string;
  species?: string;
  subspecies?: string;
  size?: string;
  habitat?: string;
  status?: string;
}

export type FigurineInput = Omit<Figurine, 'id' | 'created_at' | 'updated_at'>;

export interface FilterState {
  search: string;
  category: string;
  brand: string;
  universe: string;
  species: string;
  subspecies: string;
  size: string;
  habitat: string;
  status: string;
  tags: string[];
}

export type SortField = 'name' | 'category' | 'brand' | 'game' | 'collection' | 'universe' | 'species' | 'size' | 'status' | 'created_at' | 'updated_at';
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
  categories: string[];
  brands: string[];
  universes: string[];
  species: string[];
  subspecies: string[];
  sizes: string[];
  habitats: string[];
  statuses: StatusPreset[];
}

export const DEFAULT_PRESETS: Presets = {
  categories: [
    'Figurines',
    'Impression 3D',
    'Jeu de Société',
  ].sort((a, b) => a.localeCompare(b, 'fr')),
  brands: [
    'Archon Studio',
    'Cool Mini Or Not',
    'Corvus Belli',
    'Games Workshop',
    'Mantic Games',
    'Privateer Press',
    'Reaper Miniatures',
    'Wizkids',
    'Autre',
  ].sort((a, b) => a.localeCompare(b, 'fr')),
  universes: [
    'Age of Sigmar',
    'D&D / Pathfinder',
    'Fantasy',
    'Historique',
    'Horreur',
    'Science-Fiction',
    'Warhammer 40K',
    'Zombicide',
    'Autre',
  ].sort((a, b) => a.localeCompare(b, 'fr')),
  species: [
    'Animal',
    'Démon',
    'Dragon',
    'Elfe',
    'Géant',
    'Humain',
    'Hybride',
    'Mort-Vivant',
    'Nain',
    'Orc',
    'Robot',
    'Autre',
  ].sort((a, b) => a.localeCompare(b, 'fr')),
  subspecies: [
    'Elfe Noir',
    'Gobelin',
    'Ogre',
    'Skaven',
    'Squelette',
    'Troll',
    'Vampire',
    'Zombie',
    'Autre',
  ].sort((a, b) => a.localeCompare(b, 'fr')),
  sizes: [
    'Minuscule',
    'Petit',
    'Normal',
    'Grand',
    'Très Grand',
    'Gigantesque',
  ],
  habitats: [
    'Aquatique',
    'Désert',
    'Forêt',
    'Grotte',
    'Marais',
    'Montagne',
    'Plaine',
    'Urbain',
    'Volant',
    'Autre',
  ].sort((a, b) => a.localeCompare(b, 'fr')),
  statuses: [
    { value: 'unpainted', label: 'Non peinte', color: 'bg-gray-400' },
    { value: 'primed', label: 'Sous-couchée', color: 'bg-slate-400' },
    { value: 'wip', label: 'En cours', color: 'bg-yellow-400' },
    { value: 'painted', label: 'Terminée', color: 'bg-green-400' },
    { value: 'based', label: 'Soclée', color: 'bg-emerald-500' },
  ],
};

export const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'name', label: 'Nom' },
  { value: 'category', label: 'Catégorie' },
  { value: 'brand', label: 'Marque' },
  { value: 'game', label: 'Jeu' },
  { value: 'collection', label: 'Collection' },
  { value: 'universe', label: 'Univers' },
  { value: 'species', label: 'Espèce' },
  { value: 'size', label: 'Taille' },
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

export type ViewMode = 'grid' | 'table';
