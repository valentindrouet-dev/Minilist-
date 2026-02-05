import { useFigurines } from '../context/FigurineContext';
import { usePresets } from '../context/PresetContext';
import { PieChart, BarChart3, Tag, Palette, Users, Globe, Gamepad2, Folder, Trees, Coins, Shield, Swords } from 'lucide-react';

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

  // Sum quantities for each brand
  const brandCounts = allBrands.map(brand => ({
    name: brand,
    count: figurines
      .filter(f => f.brand === brand)
      .reduce((sum, f) => sum + (f.quantity || 1), 0),
  })).sort((a, b) => b.count - a.count);

  // Sum quantities for each category
  const categoryCounts = allCategories.map(category => ({
    name: category,
    count: figurines
      .filter(f => f.category === category)
      .reduce((sum, f) => sum + (f.quantity || 1), 0),
  })).sort((a, b) => b.count - a.count);

  // Sum quantities for each universe
  const universeCounts = allUniverses.map(universe => ({
    name: universe,
    count: figurines
      .filter(f => f.universe === universe)
      .reduce((sum, f) => sum + (f.quantity || 1), 0),
  })).sort((a, b) => b.count - a.count);

  // Sum quantities for each species
  const speciesCounts = allSpecies.map(species => ({
    name: species,
    count: figurines
      .filter(f => f.species === species)
      .reduce((sum, f) => sum + (f.quantity || 1), 0),
  })).sort((a, b) => b.count - a.count);

  // Sum quantities for each tag
  const tagCounts = allTags.map(tag => ({
    name: tag,
    count: figurines
      .filter(f => f.tags.includes(tag))
      .reduce((sum, f) => sum + (f.quantity || 1), 0),
  })).sort((a, b) => b.count - a.count);

  // Sum quantities for each game
  const gameCounts = allGames.map(game => ({
    name: game,
    count: figurines
      .filter(f => f.game === game)
      .reduce((sum, f) => sum + (f.quantity || 1), 0),
  })).sort((a, b) => b.count - a.count);

  // Sum quantities for each collection
  const collectionCounts = allCollections.map(collection => ({
    name: collection,
    count: figurines
      .filter(f => f.collection === collection)
      .reduce((sum, f) => sum + (f.quantity || 1), 0),
  })).sort((a, b) => b.count - a.count);

  // Sum quantities for each habitat
  const habitatCounts = allHabitats.map(habitat => ({
    name: habitat,
    count: figurines
      .filter(f => f.habitats?.includes(habitat))
      .reduce((sum, f) => sum + (f.quantity || 1), 0),
  })).sort((a, b) => b.count - a.count);

  // Sum quantities for each alignment (from presets)
  const alignmentCounts = presets.alignments.map(alignment => ({
    name: alignment,
    count: figurines
      .filter(f => f.alignment === alignment)
      .reduce((sum, f) => sum + (f.quantity || 1), 0),
  })).filter(a => a.count > 0).sort((a, b) => b.count - a.count);

  // Sum quantities for each group/army
  const allGroups = [...new Set(figurines.map(f => f.group).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
  const groupCounts = allGroups.map(group => ({
    name: group,
    count: figurines
      .filter(f => f.group === group)
      .reduce((sum, f) => sum + (f.quantity || 1), 0),
  })).sort((a, b) => b.count - a.count);

  // Calculate total price value
  const totalValue = figurines.reduce((sum, f) => {
    if (f.price != null) {
      return sum + f.price * (f.quantity || 1);
    }
    return sum;
  }, 0);
  const figurinesWithPrice = figurines.filter(f => f.price != null);
  const priceCount = figurinesWithPrice.reduce((sum, f) => sum + (f.quantity || 1), 0);

  const maxBrandCount = Math.max(...brandCounts.map(b => b.count), 1);
  const maxCategoryCount = Math.max(...categoryCounts.map(c => c.count), 1);
  const maxUniverseCount = Math.max(...universeCounts.map(u => u.count), 1);
  const maxSpeciesCount = Math.max(...speciesCounts.map(s => s.count), 1);
  const maxGameCount = Math.max(...gameCounts.map(g => g.count), 1);
  const maxCollectionCount = Math.max(...collectionCounts.map(c => c.count), 1);
  const maxHabitatCount = Math.max(...habitatCounts.map(h => h.count), 1);
  const maxAlignmentCount = Math.max(...alignmentCounts.map(a => a.count), 1);
  const maxGroupCount = Math.max(...groupCounts.map(g => g.count), 1);

  // Get painted count for progress (sum of quantities)
  const paintedCount = figurines
    .filter(f => f.status === 'painted' || f.status === 'based')
    .reduce((sum, f) => sum + (f.quantity || 1), 0);

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
    <div className="space-y-6">
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

        {/* Collection value */}
        {totalValue > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-700">
                <Coins size={20} />
                <span className="font-medium">Valeur de la collection</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-700">{totalValue.toFixed(2)} €</div>
                <div className="text-xs text-amber-600">
                  {priceCount} figurine{priceCount !== 1 ? 's' : ''} avec prix renseigné
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* By Brand */}
      {brandCounts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-primary-500" />
            Par marque
          </h2>
          <div className="space-y-3">
            {brandCounts.slice(0, 10).map(brand => (
              <div key={brand.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{brand.name}</span>
                  <span className="text-gray-500">{brand.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${(brand.count / maxBrandCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Category */}
      {categoryCounts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Palette size={20} className="text-primary-500" />
            Par catégorie
          </h2>
          <div className="space-y-3">
            {categoryCounts.slice(0, 10).map(category => (
              <div key={category.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-gray-500">{category.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${(category.count / maxCategoryCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Universe */}
      {universeCounts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe size={20} className="text-primary-500" />
            Par univers
          </h2>
          <div className="space-y-3">
            {universeCounts.slice(0, 10).map(universe => (
              <div key={universe.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{universe.name}</span>
                  <span className="text-gray-500">{universe.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${(universe.count / maxUniverseCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Species */}
      {speciesCounts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users size={20} className="text-primary-500" />
            Par espèce
          </h2>
          <div className="space-y-3">
            {speciesCounts.slice(0, 10).map(species => (
              <div key={species.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{species.name}</span>
                  <span className="text-gray-500">{species.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(species.count / maxSpeciesCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Game */}
      {gameCounts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Gamepad2 size={20} className="text-primary-500" />
            Par jeu
          </h2>
          <div className="space-y-3">
            {gameCounts.slice(0, 10).map(game => (
              <div key={game.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{game.name}</span>
                  <span className="text-gray-500">{game.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full"
                    style={{ width: `${(game.count / maxGameCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Collection */}
      {collectionCounts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Folder size={20} className="text-primary-500" />
            Par collection
          </h2>
          <div className="space-y-3">
            {collectionCounts.slice(0, 10).map(collection => (
              <div key={collection.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{collection.name}</span>
                  <span className="text-gray-500">{collection.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-pink-500 rounded-full"
                    style={{ width: `${(collection.count / maxCollectionCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Group/Army */}
      {groupCounts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Swords size={20} className="text-primary-500" />
            Par groupe / armée
          </h2>
          <div className="space-y-3">
            {groupCounts.slice(0, 10).map(group => (
              <div key={group.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{group.name}</span>
                  <span className="text-gray-500">{group.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${(group.count / maxGroupCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Habitat */}
      {habitatCounts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trees size={20} className="text-primary-500" />
            Par habitat
          </h2>
          <div className="space-y-3">
            {habitatCounts.slice(0, 10).map(habitat => (
              <div key={habitat.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{habitat.name}</span>
                  <span className="text-gray-500">{habitat.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(habitat.count / maxHabitatCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Alignment */}
      {alignmentCounts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield size={20} className="text-primary-500" />
            Par alignement
          </h2>
          <div className="space-y-3">
            {alignmentCounts.map(alignment => (
              <div key={alignment.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{alignment.name}</span>
                  <span className="text-gray-500">{alignment.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-500 rounded-full"
                    style={{ width: `${(alignment.count / maxAlignmentCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags cloud */}
      {tagCounts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Tag size={20} className="text-primary-500" />
            Tags populaires
          </h2>
          <div className="flex flex-wrap gap-2">
            {tagCounts.map(tag => (
              <span
                key={tag.name}
                className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm"
                style={{
                  fontSize: `${Math.max(0.75, Math.min(1.25, 0.75 + (tag.count / totalFigurines)))}rem`,
                }}
              >
                {tag.name} ({tag.count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
