import { useFigurines } from '../context/FigurineContext';
import { usePresets } from '../context/PresetContext';
import { PieChart, BarChart3, Tag, Palette } from 'lucide-react';

export function StatsPage() {
  const { figurines, allBrands, allCategories, allTags } = useFigurines();
  const { presets } = usePresets();

  const statusCounts = presets.statuses.map(status => ({
    ...status,
    count: figurines.filter(f => f.status === status.value).length,
  }));

  const brandCounts = allBrands.map(brand => ({
    name: brand,
    count: figurines.filter(f => f.brand === brand).length,
  })).sort((a, b) => b.count - a.count);

  const categoryCounts = allCategories.map(category => ({
    name: category,
    count: figurines.filter(f => f.category === category).length,
  })).sort((a, b) => b.count - a.count);

  const tagCounts = allTags.map(tag => ({
    name: tag,
    count: figurines.filter(f => f.tags.includes(tag)).length,
  })).sort((a, b) => b.count - a.count);

  const maxBrandCount = Math.max(...brandCounts.map(b => b.count), 1);
  const maxCategoryCount = Math.max(...categoryCounts.map(c => c.count), 1);

  // Get painted count for progress
  const paintedCount = figurines.filter(f => f.status === 'painted' || f.status === 'based').length;

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
            <div className="text-3xl font-bold text-primary-600">{figurines.length}</div>
            <div className="text-sm text-gray-500">Total</div>
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
        {figurines.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Progression de peinture</span>
              <span>
                {Math.round(paintedCount / figurines.length * 100)}%
              </span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
              {statusCounts.map(status => (
                status.count > 0 && (
                  <div
                    key={status.value}
                    className={`h-full ${status.color}`}
                    style={{ width: `${(status.count / figurines.length) * 100}%` }}
                    title={`${status.label}: ${status.count}`}
                  />
                )
              ))}
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
                  fontSize: `${Math.max(0.75, Math.min(1.25, 0.75 + (tag.count / figurines.length)))}rem`,
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
