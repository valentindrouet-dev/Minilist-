export interface StatusCount {
  status: string;
  count: number;
}

export interface Figurine {
  id: string;
  name: string;
  original_name: string;
  category: string;
  brand: string;
  game: string;
  collection: string;
  universe: string;
  species: string;
  subspecies: string;
  size: string;
  alignment: string;
  group: string;
  habitats: string[];
  status: string; // Main/default status
  statusBreakdown: StatusCount[]; // Detailed status breakdown for groups
  price: number | null;
  quantity: number;
  tags: string[];
  notes: string;
  image_url: string | null;
  is_own_image: boolean;
  created_at: string;
  updated_at: string;
}

// Pour la modification par lot (champs optionnels)
export interface BatchEditInput {
  category?: string;
  brand?: string;
  game?: string;
  collection?: string;
  group?: string;
  universe?: string;
  species?: string;
  subspecies?: string;
  size?: string;
  alignment?: string;
  habitats?: string[];
  status?: string;
  price?: number | null;
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
  alignment: string;
  habitats: string[];
  status: string;
  tags: string[];
  onlyOwnImages: boolean;
}

export type SortField = 'name' | 'category' | 'brand' | 'game' | 'collection' | 'universe' | 'species' | 'subspecies' | 'size' | 'alignment' | 'group' | 'habitats' | 'status' | 'price' | 'created_at' | 'updated_at';
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

// Sous-espèces liées aux espèces
export type SubspeciesBySpecies = Record<string, string[]>;

export interface Presets {
  categories: string[];
  brands: string[];
  universes: string[];
  species: string[];
  subspeciesBySpecies: SubspeciesBySpecies;
  sizes: string[];
  alignments: string[];
  habitats: string[];
  statuses: StatusPreset[];
}

const sortAlpha = (arr: string[]) => [...arr].sort((a, b) => a.localeCompare(b, 'fr'));

export const DEFAULT_PRESETS: Presets = {
  categories: sortAlpha([
    'Figurines',
    'Impression 3D',
    'Jeu de Société',
  ]),
  brands: sortAlpha([
    'Archon Studio',
    'Cool Mini Or Not',
    'Corvus Belli',
    'Games Workshop',
    'Mantic Games',
    'Privateer Press',
    'Reaper Miniatures',
    'Wizkids',
    'Autre',
  ]),
  universes: sortAlpha([
    'Age of Sigmar',
    'D&D / Pathfinder',
    'Fantasy',
    'Historique',
    'Horreur',
    'Science-Fiction',
    'Warhammer 40K',
    'Zombicide',
    'Autre',
  ]),
  species: sortAlpha([
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
  ]),
  subspeciesBySpecies: {
    'Animal': sortAlpha(['Loup', 'Ours', 'Aigle', 'Serpent', 'Autre']),
    'Démon': sortAlpha(['Démon Majeur', 'Démon Mineur', 'Diable', 'Succube', 'Autre']),
    'Dragon': sortAlpha(['Dragon Rouge', 'Dragon Noir', 'Dragon Blanc', 'Dragonneau', 'Autre']),
    'Elfe': sortAlpha(['Elfe Noir', 'Elfe Sylvain', 'Haut Elfe', 'Elfe des Mers', 'Autre']),
    'Géant': sortAlpha(['Ogre', 'Troll', 'Géant des Collines', 'Géant de Feu', 'Autre']),
    'Humain': sortAlpha(['Guerrier', 'Mage', 'Prêtre', 'Voleur', 'Noble', 'Paysan', 'Autre']),
    'Hybride': sortAlpha(['Gobelin', 'Skaven', 'Homme-Lézard', 'Minotaure', 'Centaure', 'Autre']),
    'Mort-Vivant': sortAlpha(['Zombie', 'Squelette', 'Fantôme', 'Vampire', 'Liche', 'Goule', 'Autre']),
    'Nain': sortAlpha(['Nain des Montagnes', 'Nain du Chaos', 'Nain Forgeur', 'Autre']),
    'Orc': sortAlpha(['Orc Noir', 'Orc Sauvage', 'Demi-Orc', 'Autre']),
    'Robot': sortAlpha(['Automate', 'Cyborg', 'Droïde', 'Mecha', 'Autre']),
    'Autre': sortAlpha(['Autre']),
  },
  sizes: [
    'Minuscule',
    'Petit',
    'Normal',
    'Grand',
    'Très Grand',
    'Gigantesque',
  ],
  alignments: [
    'Loyal Bon',
    'Neutre Bon',
    'Chaotique Bon',
    'Loyal Neutre',
    'Neutre',
    'Chaotique Neutre',
    'Loyal Mauvais',
    'Neutre Mauvais',
    'Chaotique Mauvais',
  ],
  habitats: sortAlpha([
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
  ]),
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
  { value: 'group', label: 'Groupe / Armée' },
  { value: 'universe', label: 'Univers' },
  { value: 'species', label: 'Espèce' },
  { value: 'subspecies', label: 'Sous-Espèce' },
  { value: 'size', label: 'Taille' },
  { value: 'alignment', label: 'Alignement' },
  { value: 'habitats', label: 'Habitat' },
  { value: 'status', label: 'Statut' },
  { value: 'price', label: 'Prix' },
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

export type ViewMode = 'grid' | 'table' | 'game';

// Helper function to get all subspecies as flat array (for backward compatibility)
export function getAllSubspecies(presets: Presets): string[] {
  const allSubs = new Set<string>();
  Object.values(presets.subspeciesBySpecies).forEach(subs => {
    subs.forEach(s => allSubs.add(s));
  });
  return sortAlpha(Array.from(allSubs));
}

// Helper function to get subspecies for a specific species
export function getSubspeciesForSpecies(presets: Presets, species: string): string[] {
  return presets.subspeciesBySpecies[species] || [];
}
