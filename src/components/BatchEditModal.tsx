import { useState } from 'react';
import { X } from 'lucide-react';
import { usePresets } from '../context/PresetContext';
import type { BatchEditInput } from '../types';
import { getSubspeciesForSpecies } from '../types';

interface BatchEditModalProps {
  selectedCount: number;
  onSubmit: (data: BatchEditInput) => Promise<void>;
  onClose: () => void;
}

export function BatchEditModal({ selectedCount, onSubmit, onClose }: BatchEditModalProps) {
  const { presets } = usePresets();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<BatchEditInput>({
    category: undefined,
    brand: undefined,
    game: undefined,
    collection: undefined,
    group: undefined,
    universe: undefined,
    species: undefined,
    subspecies: undefined,
    size: undefined,
    alignment: undefined,
    habitats: undefined,
    status: undefined,
  });

  const toggleHabitat = (habitat: string) => {
    const current = form.habitats || [];
    const newHabitats = current.includes(habitat)
      ? current.filter(h => h !== habitat)
      : [...current, habitat];
    setForm(prev => ({ ...prev, habitats: newHabitats.length > 0 ? newHabitats : undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if at least one field is set
    const hasChanges = Object.values(form).some(v => v !== undefined && v !== '');
    if (!hasChanges) {
      alert('Sélectionnez au moins un champ à modifier');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(form);
      onClose();
    } catch (error) {
      console.error('Batch update failed:', error);
      alert('Erreur lors de la modification');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:w-[450px] sm:max-h-[90vh] max-h-[85vh] sm:rounded-xl rounded-t-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold">
            Modifier {selectedCount} figurine{selectedCount > 1 ? 's' : ''}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-sm text-gray-500 mb-4">
            Seuls les champs remplis seront modifiés. Laissez vide pour ne pas modifier.
          </p>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select
              value={form.category || ''}
              onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value || undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">— Ne pas modifier —</option>
              {presets.categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
            <select
              value={form.brand || ''}
              onChange={(e) => setForm(prev => ({ ...prev, brand: e.target.value || undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">— Ne pas modifier —</option>
              {presets.brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* Jeu (champ libre) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jeu</label>
            <input
              type="text"
              value={form.game || ''}
              onChange={(e) => setForm(prev => ({ ...prev, game: e.target.value || undefined }))}
              placeholder="— Ne pas modifier —"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          {/* Collection (champ libre) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Collection</label>
            <input
              type="text"
              value={form.collection || ''}
              onChange={(e) => setForm(prev => ({ ...prev, collection: e.target.value || undefined }))}
              placeholder="— Ne pas modifier —"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          {/* Groupe / Armée (champ libre) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Groupe / Armée</label>
            <input
              type="text"
              value={form.group || ''}
              onChange={(e) => setForm(prev => ({ ...prev, group: e.target.value || undefined }))}
              placeholder="— Ne pas modifier —"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          {/* Universe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Univers</label>
            <select
              value={form.universe || ''}
              onChange={(e) => setForm(prev => ({ ...prev, universe: e.target.value || undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">— Ne pas modifier —</option>
              {presets.universes.map(universe => (
                <option key={universe} value={universe}>{universe}</option>
              ))}
            </select>
          </div>

          {/* Species */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Espèce</label>
            <select
              value={form.species || ''}
              onChange={(e) => {
                const newSpecies = e.target.value || undefined;
                // Reset subspecies when species changes
                const availableSubs = newSpecies ? getSubspeciesForSpecies(presets, newSpecies) : [];
                setForm(prev => ({
                  ...prev,
                  species: newSpecies,
                  subspecies: prev.subspecies && availableSubs.includes(prev.subspecies) ? prev.subspecies : undefined,
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">— Ne pas modifier —</option>
              {presets.species.map(sp => (
                <option key={sp} value={sp}>{sp}</option>
              ))}
            </select>
          </div>

          {/* Subspecies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sous-Espèce</label>
            <select
              value={form.subspecies || ''}
              onChange={(e) => setForm(prev => ({ ...prev, subspecies: e.target.value || undefined }))}
              disabled={!form.species}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">{form.species ? '— Ne pas modifier —' : '— Choisir une espèce —'}</option>
              {form.species && getSubspeciesForSpecies(presets, form.species).map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Taille</label>
            <select
              value={form.size || ''}
              onChange={(e) => setForm(prev => ({ ...prev, size: e.target.value || undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">— Ne pas modifier —</option>
              {presets.sizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          {/* Alignement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alignement</label>
            <select
              value={form.alignment || ''}
              onChange={(e) => setForm(prev => ({ ...prev, alignment: e.target.value || undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">— Ne pas modifier —</option>
              {presets.alignments.map(alignment => (
                <option key={alignment} value={alignment}>{alignment}</option>
              ))}
            </select>
          </div>

          {/* Habitats (multi-select) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Habitats</label>
            <p className="text-xs text-gray-500 mb-2">Cliquez pour ajouter aux habitats sélectionnés</p>
            <div className="flex flex-wrap gap-2">
              {presets.habitats.map(habitat => (
                <button
                  key={habitat}
                  type="button"
                  onClick={() => toggleHabitat(habitat)}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    form.habitats?.includes(habitat)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {habitat}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={form.status || ''}
              onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value || undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">— Ne pas modifier —</option>
              {presets.statuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </form>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition disabled:opacity-50"
          >
            {submitting ? 'Modification...' : 'Appliquer'}
          </button>
        </div>
      </div>
    </div>
  );
}
