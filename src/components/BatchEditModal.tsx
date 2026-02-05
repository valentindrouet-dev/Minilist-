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
    universe: undefined,
    species: undefined,
    subspecies: undefined,
    size: undefined,
    habitat: undefined,
    status: undefined,
  });

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

          {/* Habitat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Habitat</label>
            <select
              value={form.habitat || ''}
              onChange={(e) => setForm(prev => ({ ...prev, habitat: e.target.value || undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">— Ne pas modifier —</option>
              {presets.habitats.map(habitat => (
                <option key={habitat} value={habitat}>{habitat}</option>
              ))}
            </select>
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
