import { useState, useMemo } from 'react';
import { useFigurines } from '../context/FigurineContext';
import { usePresets } from '../context/PresetContext';
import {
  PieChart, BarChart3, Tag, Palette, Users, Globe, Gamepad2, Folder, Trees, Coins, Shield, Swords,
  ChevronDown, ChevronUp, SortAsc, SortDesc, Package, Ruler, Calendar,
  Box, Percent, Hash
} from 'lucide-react';

type SortField = 'name' | 'count';
type SortOrder = 'asc' | 'desc';

interface StatItem {
  name: string;
  count: number;
  value?: number;
  painted?: number;
  total?: number;
}

interface CollapsibleStatSectionProps {
  title: string;
  icon: React.ReactNode;
  items: StatItem[];
  maxCount: number;
  color: string;
  defaultOpen?: boolean;
  showValue?: boolean;
  showProgress?: boolean;
}

function CollapsibleStatSection({
  title,
  icon,
  items,
  maxCount,
  color,
  defaultOpen = false,
  showValue = false,
  showProgress = false,
}: CollapsibleStatSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [sortField, setSortField] = useState<SortField>('count');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (sortField === 'name') {
        const compare = a.name.localeCompare(b.name, 'fr');
        return sortOrder === 'asc' ? compare : -compare;
      } else {
        const compare = a.count - b.count;
        return sortOrder === 'asc' ? compare : -compare;
      }
    });
  }, [items, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'name' ? 'asc' : 'desc');
    }
  };

  const totalCount = items.reduce((sum, item) => sum + item.count, 0);
  const totalValue = showValue ? items.reduce((sum, item) => sum + (item.value || 0), 0) : 0;

  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold">{title}</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{totalCount} figurines</span>
          {showValue && totalValue > 0 && (
            <span className="text-sm text-amber-600 font-medium">{totalValue.toFixed(2)} €</span>
          )}
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-0 border-t border-gray-100">
          {/* Sort controls */}
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <span className="text-xs text-gray-500 mr-2">Trier par:</span>
            <button
              onClick={() => toggleSort('name')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                sortField === 'name'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {sortField === 'name' && (sortOrder === 'asc' ? <SortAsc size={12} /> : <SortDesc size={12} />)}
              Nom
            </button>
            <button
              onClick={() => toggleSort('count')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                sortField === 'count'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {sortField === 'count' && (sortOrder === 'asc' ? <SortAsc size={12} /> : <SortDesc size={12} />)}
              Quantité
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sortedItems.map(item => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium truncate mr-2">{item.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {showProgress && item.painted !== undefined && item.total !== undefined && (
                      <span className="text-xs text-gray-400">
                        {Math.round((item.painted / item.total) * 100)}% peint
                      </span>
                    )}
                    {showValue && item.value !== undefined && item.value > 0 && (
                      <span className="text-xs text-amber-600">{item.value.toFixed(2)} €</span>
                    )}
                    <span className="text-gray-500 font-medium">{item.count}</span>
                    <span className="text-xs text-gray-400">
                      ({((item.count / totalCount) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all duration-300`}
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Detailed Game Box Section with expanded statistics
interface GameBoxDetailProps {
  gameName: string;
  figurines: Array<{
    status: string;
    quantity: number;
    price: number | null;
    species: string;
    name: string;
  }>;
  statuses: Array<{ value: string; label: string; color: string }>;
}

function GameBoxDetail({ gameName, figurines, statuses }: GameBoxDetailProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalFigurines = figurines.reduce((sum, f) => sum + (f.quantity || 1), 0);
  const totalValue = figurines.reduce((sum, f) => {
    if (f.price != null) {
      return sum + f.price * (f.quantity || 1);
    }
    return sum;
  }, 0);

  const statusCounts = statuses.map(status => ({
    ...status,
    count: figurines
      .filter(f => f.status === status.value)
      .reduce((sum, f) => sum + (f.quantity || 1), 0),
  }));

  const paintedCount = figurines
    .filter(f => f.status === 'painted' || f.status === 'based')
    .reduce((sum, f) => sum + (f.quantity || 1), 0);

  const speciesCounts = [...new Set(figurines.map(f => f.species).filter(Boolean))]
    .map(species => ({
      name: species,
      count: figurines
        .filter(f => f.species === species)
        .reduce((sum, f) => sum + (f.quantity || 1), 0),
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Box size={18} className="text-violet-500" />
          <span className="font-medium">{gameName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{totalFigurines}</span>
          {totalValue > 0 && (
            <span className="text-sm text-amber-600">{totalValue.toFixed(2)} €</span>
          )}
          <div className="flex gap-0.5">
            {statusCounts.filter(s => s.count > 0).map(status => (
              <div
                key={status.value}
                className={`w-2 h-4 ${status.color} rounded-sm`}
                title={`${status.label}: ${status.count}`}
                style={{ opacity: 0.3 + (status.count / totalFigurines) * 0.7 }}
              />
            ))}
          </div>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 pt-0 border-t border-gray-100 bg-gray-50">
          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progression</span>
              <span>{paintedCount}/{totalFigurines} ({Math.round(paintedCount / totalFigurines * 100)}%)</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
              {statusCounts.map(status => (
                status.count > 0 && (
                  <div
                    key={status.value}
                    className={`h-full ${status.color}`}
                    style={{ width: `${(status.count / totalFigurines) * 100}%` }}
                    title={`${status.label}: ${status.count}`}
                  />
                )
              ))}
            </div>
          </div>

          {/* Status breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            {statusCounts.filter(s => s.count > 0).map(status => (
              <div key={status.value} className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${status.color}`} />
                <span className="text-gray-600">{status.label}:</span>
                <span className="font-medium">{status.count}</span>
              </div>
            ))}
          </div>

          {/* Species in this game */}
          {speciesCounts.length > 0 && (
            <div className="text-xs text-gray-600">
              <span className="font-medium">Espèces:</span>{' '}
              {speciesCounts.slice(0, 5).map((s, i) => (
                <span key={s.name}>
                  {s.name} ({s.count}){i < Math.min(speciesCounts.length - 1, 4) ? ', ' : ''}
                </span>
              ))}
              {speciesCounts.length > 5 && <span className="text-gray-400"> +{speciesCounts.length - 5} autres</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function StatsPage() {
  const { figurines, allBrands, allCategories, allUniverses, allSpecies, allTags, allGames, allCollections, allHabitats } = useFigurines();
  const { presets } = usePresets();

  // Calculate total with quantities
  const totalFigurines = figurines.reduce((sum, f) => sum + (f.quantity || 1), 0);
  const totalEntries = figurines.length;

  // Sum quantities for each status
  const statusCounts = presets.statuses.map(status => ({
    ...status,
    count: figurines
      .filter(f => f.status === status.value)
      .reduce((sum, f) => sum + (f.quantity || 1), 0),
  }));

  // Sum quantities for each brand with value
  const brandCounts: StatItem[] = allBrands.map(brand => {
    const brandFigurines = figurines.filter(f => f.brand === brand);
    return {
      name: brand,
      count: brandFigurines.reduce((sum, f) => sum + (f.quantity || 1), 0),
      value: brandFigurines.reduce((sum, f) => f.price != null ? sum + f.price * (f.quantity || 1) : sum, 0),
    };
  }).sort((a, b) => b.count - a.count);

  // Sum quantities for each category
  const categoryCounts: StatItem[] = allCategories.map(category => {
    const catFigurines = figurines.filter(f => f.category === category);
    return {
      name: category,
      count: catFigurines.reduce((sum, f) => sum + (f.quantity || 1), 0),
      value: catFigurines.reduce((sum, f) => f.price != null ? sum + f.price * (f.quantity || 1) : sum, 0),
    };
  }).sort((a, b) => b.count - a.count);

  // Sum quantities for each universe
  const universeCounts: StatItem[] = allUniverses.map(universe => {
    const uniFigurines = figurines.filter(f => f.universe === universe);
    return {
      name: universe,
      count: uniFigurines.reduce((sum, f) => sum + (f.quantity || 1), 0),
      value: uniFigurines.reduce((sum, f) => f.price != null ? sum + f.price * (f.quantity || 1) : sum, 0),
    };
  }).sort((a, b) => b.count - a.count);

  // Sum quantities for each species
  const speciesCounts: StatItem[] = allSpecies.map(species => ({
    name: species,
    count: figurines
      .filter(f => f.species === species)
      .reduce((sum, f) => sum + (f.quantity || 1), 0),
  })).sort((a, b) => b.count - a.count);

  // Sum quantities for each subspecies
  const allSubspecies = [...new Set(figurines.map(f => f.subspecies).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
  const subspeciesCounts: StatItem[] = allSubspecies.map(subspecies => ({
    name: subspecies,
    count: figurines
      .filter(f => f.subspecies === subspecies)
      .reduce((sum, f) => sum + (f.quantity || 1), 0),
  })).sort((a, b) => b.count - a.count);

  // Sum quantities for each tag
  const tagCounts: StatItem[] = allTags.map(tag => ({
    name: tag,
    count: figurines
      .filter(f => f.tags.includes(tag))
      .reduce((sum, f) => sum + (f.quantity || 1), 0),
  })).sort((a, b) => b.count - a.count);

  // Sum quantities for each game with detailed stats
  const gameCounts: StatItem[] = allGames.map(game => {
    const gameFigurines = figurines.filter(f => f.game === game);
    const total = gameFigurines.reduce((sum, f) => sum + (f.quantity || 1), 0);
    const painted = gameFigurines
      .filter(f => f.status === 'painted' || f.status === 'based')
      .reduce((sum, f) => sum + (f.quantity || 1), 0);
    return {
      name: game,
      count: total,
      value: gameFigurines.reduce((sum, f) => f.price != null ? sum + f.price * (f.quantity || 1) : sum, 0),
      painted,
      total,
    };
  }).sort((a, b) => b.count - a.count);

  // Sum quantities for each collection
  const collectionCounts: StatItem[] = allCollections.map(collection => {
    const collFigurines = figurines.filter(f => f.collection === collection);
    return {
      name: collection,
      count: collFigurines.reduce((sum, f) => sum + (f.quantity || 1), 0),
      value: collFigurines.reduce((sum, f) => f.price != null ? sum + f.price * (f.quantity || 1) : sum, 0),
    };
  }).sort((a, b) => b.count - a.count);

  // Sum quantities for each habitat
  const habitatCounts: StatItem[] = allHabitats.map(habitat => ({
    name: habitat,
    count: figurines
      .filter(f => f.habitats?.includes(habitat))
      .reduce((sum, f) => sum + (f.quantity || 1), 0),
  })).sort((a, b) => b.count - a.count);

  // Sum quantities for each alignment (from presets)
  const alignmentCounts: StatItem[] = presets.alignments.map(alignment => ({
    name: alignment,
    count: figurines
      .filter(f => f.alignment === alignment)
      .reduce((sum, f) => sum + (f.quantity || 1), 0),
  })).filter(a => a.count > 0).sort((a, b) => b.count - a.count);

  // Sum quantities for each group/army
  const allGroups = [...new Set(figurines.map(f => f.group).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
  const groupCounts: StatItem[] = allGroups.map(group => {
    const groupFigurines = figurines.filter(f => f.group === group);
    return {
      name: group,
      count: groupFigurines.reduce((sum, f) => sum + (f.quantity || 1), 0),
      value: groupFigurines.reduce((sum, f) => f.price != null ? sum + f.price * (f.quantity || 1) : sum, 0),
    };
  }).sort((a, b) => b.count - a.count);

  // Sum quantities for each size
  const allSizes = [...new Set(figurines.map(f => f.size).filter(Boolean))];
  const sizeOrder = ['Minuscule', 'Petit', 'Normal', 'Grand', 'Très Grand', 'Gigantesque'];
  const sizeCounts: StatItem[] = allSizes.map(size => ({
    name: size,
    count: figurines
      .filter(f => f.size === size)
      .reduce((sum, f) => sum + (f.quantity || 1), 0),
  })).sort((a, b) => sizeOrder.indexOf(a.name) - sizeOrder.indexOf(b.name));

  // Calculate total price value
  const totalValue = figurines.reduce((sum, f) => {
    if (f.price != null) {
      return sum + f.price * (f.quantity || 1);
    }
    return sum;
  }, 0);
  const figurinesWithPrice = figurines.filter(f => f.price != null);
  const priceCount = figurinesWithPrice.reduce((sum, f) => sum + (f.quantity || 1), 0);
  const avgPrice = priceCount > 0 ? totalValue / priceCount : 0;

  // Calculate max values for progress bars
  const maxBrandCount = Math.max(...brandCounts.map(b => b.count), 1);
  const maxCategoryCount = Math.max(...categoryCounts.map(c => c.count), 1);
  const maxUniverseCount = Math.max(...universeCounts.map(u => u.count), 1);
  const maxSpeciesCount = Math.max(...speciesCounts.map(s => s.count), 1);
  const maxSubspeciesCount = Math.max(...subspeciesCounts.map(s => s.count), 1);
  const maxGameCount = Math.max(...gameCounts.map(g => g.count), 1);
  const maxCollectionCount = Math.max(...collectionCounts.map(c => c.count), 1);
  const maxHabitatCount = Math.max(...habitatCounts.map(h => h.count), 1);
  const maxAlignmentCount = Math.max(...alignmentCounts.map(a => a.count), 1);
  const maxGroupCount = Math.max(...groupCounts.map(g => g.count), 1);
  const maxSizeCount = Math.max(...sizeCounts.map(s => s.count), 1);
  const maxTagCount = Math.max(...tagCounts.map(t => t.count), 1);

  // Get painted count for progress (sum of quantities)
  const paintedCount = figurines
    .filter(f => f.status === 'painted' || f.status === 'based')
    .reduce((sum, f) => sum + (f.quantity || 1), 0);

  // Calculate monthly statistics
  const monthlyStats = useMemo(() => {
    const stats = new Map<string, { count: number; value: number }>();
    figurines.forEach(f => {
      if (f.created_at) {
        const date = new Date(f.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const current = stats.get(monthKey) || { count: 0, value: 0 };
        current.count += f.quantity || 1;
        if (f.price != null) {
          current.value += f.price * (f.quantity || 1);
        }
        stats.set(monthKey, current);
      }
    });
    return Array.from(stats.entries())
      .map(([month, data]) => ({
        name: month,
        count: data.count,
        value: data.value,
      }))
      .sort((a, b) => b.name.localeCompare(a.name));
  }, [figurines]);

  const maxMonthlyCount = Math.max(...monthlyStats.map(m => m.count), 1);

  if (figurines.length === 0) {
    return (
      <div className="text-center py-16">
        <BarChart3 size={64} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Pas encore de statistiques
        </h3>
        <p className="text-gray-400">
          Ajoutez des figurines pour voir les statistiques de votre collection.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <PieChart size={20} className="text-primary-500" />
          Vue d'ensemble
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-3xl font-bold text-primary-600">{totalFigurines}</div>
            <div className="text-sm text-gray-500">Figurines</div>
            {totalEntries !== totalFigurines && (
              <div className="text-xs text-gray-400">{totalEntries} entrées</div>
            )}
          </div>
          {statusCounts.filter(s => s.count > 0).map(status => (
            <div key={status.value} className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className={`w-3 h-3 rounded-full ${status.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-700">
                {status.count}
              </div>
              <div className="text-xs text-gray-500">{status.label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {totalFigurines > 0 && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Progression de peinture</span>
              <span>
                {paintedCount} / {totalFigurines} ({Math.round(paintedCount / totalFigurines * 100)}%)
              </span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
              {statusCounts.map(status => (
                status.count > 0 && (
                  <div
                    key={status.value}
                    className={`h-full ${status.color}`}
                    style={{ width: `${(status.count / totalFigurines) * 100}%` }}
                    title={`${status.label}: ${status.count}`}
                  />
                )
              ))}
            </div>
          </div>
        )}

        {/* Advanced Stats Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Hash size={16} />
              <span className="text-xs font-medium">Marques</span>
            </div>
            <div className="text-xl font-bold text-blue-700">{allBrands.length}</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <Gamepad2 size={16} />
              <span className="text-xs font-medium">Jeux</span>
            </div>
            <div className="text-xl font-bold text-purple-700">{allGames.length}</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <Users size={16} />
              <span className="text-xs font-medium">Espèces</span>
            </div>
            <div className="text-xl font-bold text-green-700">{allSpecies.length}</div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <Percent size={16} />
              <span className="text-xs font-medium">Progression</span>
            </div>
            <div className="text-xl font-bold text-orange-700">{Math.round(paintedCount / totalFigurines * 100)}%</div>
          </div>
        </div>

        {/* Collection value */}
        {totalValue > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 text-amber-700">
                <Coins size={20} />
                <span className="font-medium">Valeur de la collection</span>
              </div>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="text-right">
                  <div className="text-2xl font-bold text-amber-700">{totalValue.toFixed(2)} €</div>
                  <div className="text-xs text-amber-600">
                    {priceCount} figurine{priceCount !== 1 ? 's' : ''} avec prix
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-amber-600">{avgPrice.toFixed(2)} €</div>
                  <div className="text-xs text-amber-500">Prix moyen</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Game Box Details Section */}
      {gameCounts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Package size={20} className="text-violet-500" />
              Détail par Boîte de Jeu
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {gameCounts.length}
              </span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">Statistiques détaillées pour chaque jeu de votre collection</p>
          </div>
          <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
            {gameCounts.map(game => (
              <GameBoxDetail
                key={game.name}
                gameName={game.name}
                figurines={figurines.filter(f => f.game === game.name)}
                statuses={presets.statuses}
              />
            ))}
          </div>
        </div>
      )}

      {/* Collapsible Statistics Sections */}
      <CollapsibleStatSection
        title="Par jeu"
        icon={<Gamepad2 size={20} className="text-violet-500" />}
        items={gameCounts}
        maxCount={maxGameCount}
        color="bg-violet-500"
        defaultOpen={true}
        showValue={true}
        showProgress={true}
      />

      <CollapsibleStatSection
        title="Par marque"
        icon={<BarChart3 size={20} className="text-primary-500" />}
        items={brandCounts}
        maxCount={maxBrandCount}
        color="bg-primary-500"
        showValue={true}
      />

      <CollapsibleStatSection
        title="Par catégorie"
        icon={<Palette size={20} className="text-green-500" />}
        items={categoryCounts}
        maxCount={maxCategoryCount}
        color="bg-green-500"
        showValue={true}
      />

      <CollapsibleStatSection
        title="Par univers"
        icon={<Globe size={20} className="text-indigo-500" />}
        items={universeCounts}
        maxCount={maxUniverseCount}
        color="bg-indigo-500"
        showValue={true}
      />

      <CollapsibleStatSection
        title="Par collection"
        icon={<Folder size={20} className="text-pink-500" />}
        items={collectionCounts}
        maxCount={maxCollectionCount}
        color="bg-pink-500"
        showValue={true}
      />

      <CollapsibleStatSection
        title="Par groupe / armée"
        icon={<Swords size={20} className="text-red-500" />}
        items={groupCounts}
        maxCount={maxGroupCount}
        color="bg-red-500"
        showValue={true}
      />

      <CollapsibleStatSection
        title="Par espèce"
        icon={<Users size={20} className="text-amber-500" />}
        items={speciesCounts}
        maxCount={maxSpeciesCount}
        color="bg-amber-500"
      />

      {subspeciesCounts.length > 0 && (
        <CollapsibleStatSection
          title="Par sous-espèce"
          icon={<Users size={20} className="text-orange-500" />}
          items={subspeciesCounts}
          maxCount={maxSubspeciesCount}
          color="bg-orange-500"
        />
      )}

      <CollapsibleStatSection
        title="Par taille"
        icon={<Ruler size={20} className="text-teal-500" />}
        items={sizeCounts}
        maxCount={maxSizeCount}
        color="bg-teal-500"
      />

      <CollapsibleStatSection
        title="Par habitat"
        icon={<Trees size={20} className="text-emerald-500" />}
        items={habitatCounts}
        maxCount={maxHabitatCount}
        color="bg-emerald-500"
      />

      <CollapsibleStatSection
        title="Par alignement"
        icon={<Shield size={20} className="text-slate-500" />}
        items={alignmentCounts}
        maxCount={maxAlignmentCount}
        color="bg-slate-500"
      />

      <CollapsibleStatSection
        title="Par tags"
        icon={<Tag size={20} className="text-cyan-500" />}
        items={tagCounts}
        maxCount={maxTagCount}
        color="bg-cyan-500"
      />

      {/* Monthly Statistics */}
      {monthlyStats.length > 0 && (
        <CollapsibleStatSection
          title="Par mois d'ajout"
          icon={<Calendar size={20} className="text-rose-500" />}
          items={monthlyStats}
          maxCount={maxMonthlyCount}
          color="bg-rose-500"
          showValue={true}
        />
      )}
    </div>
  );
}
