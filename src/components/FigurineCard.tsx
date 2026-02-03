import { STATUSES, type Figurine } from '../types';
import { Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

interface FigurineCardProps {
  figurine: Figurine;
  onEdit: (figurine: Figurine) => void;
  onDelete: (id: string) => void;
}

export function FigurineCard({ figurine, onEdit, onDelete }: FigurineCardProps) {
  const status = STATUSES.find(s => s.value === figurine.status);

  const handleDelete = () => {
    if (window.confirm(`Supprimer "${figurine.name}" ?`)) {
      onDelete(figurine.id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group">
      {/* Image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {figurine.image_url ? (
          <img
            src={figurine.image_url}
            alt={figurine.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageIcon size={48} />
          </div>
        )}

        {/* Status badge */}
        {status && (
          <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-medium text-white ${
            status.value === 'unpainted' ? 'bg-gray-500' :
            status.value === 'wip' ? 'bg-yellow-500' : 'bg-green-500'
          }`}>
            {status.label}
          </div>
        )}

        {/* Action buttons (visible on hover) */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => onEdit(figurine)}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 text-gray-700"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50 text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 truncate" title={figurine.name}>
          {figurine.name}
        </h3>
        <p className="text-sm text-gray-500 truncate">
          {figurine.brand}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {figurine.category} • {figurine.scale}
        </p>

        {/* Tags */}
        {figurine.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {figurine.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {figurine.tags.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                +{figurine.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
