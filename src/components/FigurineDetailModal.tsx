import { X, Image as ImageIcon, Edit2 } from 'lucide-react';
import { usePresets } from '../context/PresetContext';
import type { Figurine } from '../types';

interface FigurineDetailModalProps {
  figurine: Figurine;
  onClose: () => void;
  onEdit: (figurine: Figurine) => void;
}

export function FigurineDetailModal({ figurine, onClose, onEdit }: FigurineDetailModalProps) {
  const { presets } = usePresets();
  const status = presets.statuses.find(s => s.value === figurine.status);
  const quantity = figurine.quantity || 1;

  const handleEdit = () => {
    onClose();
    onEdit(figurine);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg max-h-[90vh] rounded-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="truncate pr-4">
            <h2 className="text-lg font-semibold">{figurine.name}</h2>
            {figurine.original_name && (
              <p className="text-sm text-gray-500 italic">{figurine.original_name}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleEdit}
              className="p-2 hover:bg-gray-200 rounded-lg transition text-gray-600"
              title="Modifier"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Image */}
          <div className="bg-gray-100 relative min-h-[200px] max-h-[50vh] flex items-center justify-center">
            {figurine.image_url ? (
              <img
                src={figurine.image_url}
                alt={figurine.name}
                className="max-w-full max-h-[50vh] object-contain"
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center text-gray-300">
                <ImageIcon size={64} />
              </div>
            )}

            {/* Quantity badge */}
            {quantity > 1 && (
              <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 text-white rounded-lg font-bold text-lg">
                x{quantity}
              </div>
            )}

            {/* Status badge */}
            {status && (
              <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-lg text-sm font-medium text-white ${status.color}`}>
                {status.label}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4 space-y-4">
            {/* Main info grid */}
            <div className="grid grid-cols-2 gap-4">
              {figurine.category && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Catégorie</div>
                  <div className="font-medium">{figurine.category}</div>
                </div>
              )}
              {figurine.brand && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Marque</div>
                  <div className="font-medium">{figurine.brand}</div>
                </div>
              )}
              {figurine.game && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Jeu</div>
                  <div className="font-medium">{figurine.game}</div>
                </div>
              )}
              {figurine.collection && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Collection</div>
                  <div className="font-medium">{figurine.collection}</div>
                </div>
              )}
              {figurine.group && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Groupe / Armée</div>
                  <div className="font-medium">{figurine.group}</div>
                </div>
              )}
              {figurine.universe && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Univers</div>
                  <div className="font-medium">{figurine.universe}</div>
                </div>
              )}
              {figurine.species && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Espèce</div>
                  <div className="font-medium">{figurine.species}</div>
                </div>
              )}
              {figurine.subspecies && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Sous-Espèce</div>
                  <div className="font-medium">{figurine.subspecies}</div>
                </div>
              )}
              {figurine.size && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Taille</div>
                  <div className="font-medium">{figurine.size}</div>
                </div>
              )}
              {figurine.alignment && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Alignement</div>
                  <div className="font-medium">{figurine.alignment}</div>
                </div>
              )}
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Quantité</div>
                <div className="font-medium">{quantity}</div>
              </div>
              {figurine.price != null && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Prix</div>
                  <div className="font-medium">{figurine.price.toFixed(2)} €</div>
                </div>
              )}
            </div>

            {/* Status breakdown */}
            {figurine.statusBreakdown && figurine.statusBreakdown.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Répartition des statuts</div>
                <div className="space-y-1.5">
                  {figurine.statusBreakdown.map((sb, idx) => {
                    const statusInfo = presets.statuses.find(s => s.value === sb.status);
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${statusInfo?.color || 'bg-gray-400'}`} />
                        <span className="text-sm flex-1">{statusInfo?.label || sb.status}</span>
                        <span className="text-sm font-medium">{sb.count}</span>
                      </div>
                    );
                  })}
                  <div className="text-xs text-gray-400 pt-1 border-t border-gray-200">
                    Total: {figurine.statusBreakdown.reduce((sum, sb) => sum + sb.count, 0)} / {quantity}
                  </div>
                </div>
              </div>
            )}

            {/* Habitats */}
            {figurine.habitats && figurine.habitats.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Habitats</div>
                <div className="flex flex-wrap gap-2">
                  {figurine.habitats.map(habitat => (
                    <span
                      key={habitat}
                      className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                    >
                      {habitat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {figurine.tags.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Tags</div>
                <div className="flex flex-wrap gap-2">
                  {figurine.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {figurine.notes && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Notes</div>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 text-sm">
                  {figurine.notes}
                </p>
              </div>
            )}

            {/* Dates */}
            <div className="pt-3 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
              <span>Ajoutée le {new Date(figurine.created_at).toLocaleDateString('fr-FR')}</span>
              {figurine.updated_at !== figurine.created_at && (
                <span>Modifiée le {new Date(figurine.updated_at).toLocaleDateString('fr-FR')}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
