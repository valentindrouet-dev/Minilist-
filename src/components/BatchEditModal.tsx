import { useState, useRef, useEffect, useMemo } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { usePresets } from '../context/PresetContext';
import type { BatchEditInput, Figurine } from '../types';
import { getSubspeciesForSpecies } from '../types';

type QuickAddField = 'category' | 'brand' | 'universe' | 'species' | 'subspecies' | 'size' | 'alignment' | 'material' | 'habitat' | null;

// Quick add modal component
interface QuickAddModalProps {
  title: string;
  onAdd: (value: string) => void;
  onClose: () => void;
}

function QuickAddModal({ title, onAdd, onClose }: QuickAddModalProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onAdd(value.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-4 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h3 className="font-semibold text-lg mb-3">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Entrez une valeur..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface BatchEditModalProps {
  selectedCount: number;
  selectedFigurines: Figurine[];
  onSubmit: (data: BatchEditInput) => Promise<void>;
  onClose: () => void;
}

// Helper to find common value across figurines
function getCommonValue<T>(figurines: Figurine[], getter: (f: Figurine) => T): T | undefined {
  if (figurines.length === 0) return undefined;
  const firstValue = getter(figurines[0]);
  const allSame = figurines.every(f => getter(f) === firstValue);
  return allSame ? firstValue : undefined;
}

export function BatchEditModal({ selectedCount, selectedFigurines, onSubmit, onClose }: BatchEditModalProps) {
  const { presets, addCategory, addBrand, addUniverse, addSpecies, addSubspecies, addSize, addAlignment, addMaterial, addHabitat } = usePresets();
  const [submitting, setSubmitting] = useState(false);
  const [quickAddField, setQuickAddField] = useState<QuickAddField>(null);

  // Calculate common values from selected figurines
  const commonValues = useMemo(() => ({
    category: getCommonValue(selectedFigurines, f => f.category) || undefined,
    brand: getCommonValue(selectedFigurines, f => f.brand) || undefined,
    game: getCommonValue(selectedFigurines, f => f.game) || undefined,
    collection: getCommonValue(selectedFigurines, f => f.collection) || undefined,
    group: getCommonValue(selectedFigurines, f => f.group) || undefined,
    universe: getCommonValue(selectedFigurines, f => f.universe) || undefined,
    species: getCommonValue(selectedFigurines, f => f.species) || undefined,
    subspecies: getCommonValue(selectedFigurines, f => f.subspecies) || undefined,
    size: getCommonValue(selectedFigurines, f => f.size) || undefined,
    alignment: getCommonValue(selectedFigurines, f => f.alignment) || undefined,
    material: getCommonValue(selectedFigurines, f => f.material) || undefined,
    status: getCommonValue(selectedFigurines, f => f.status) || undefined,
    price: getCommonValue(selectedFigurines, f => f.price),
  }), [selectedFigurines]);

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
    material: undefined,
    habitats: undefined,
    status: undefined,
    price: undefined,
  });

  const toggleHabitat = (habitat: string) => {
    const current = form.habitats || [];
    const newHabitats = current.includes(habitat)
      ? current.filter(h => h !== habitat)
      : [...current, habitat];
    setForm(prev => ({ ...prev, habitats: newHabitats.length > 0 ? newHabitats : undefined }));
  };

  const handleQuickAdd = (value: string) => {
    switch (quickAddField) {
      case 'category':
        addCategory(value);
        setForm(prev => ({ ...prev, category: value }));
        break;
      case 'brand':
        addBrand(value);
        setForm(prev => ({ ...prev, brand: value }));
        break;
      case 'universe':
        addUniverse(value);
        setForm(prev => ({ ...prev, universe: value }));
        break;
      case 'species':
        addSpecies(value);
        setForm(prev => ({ ...prev, species: value, subspecies: undefined }));
        break;
      case 'subspecies':
        if (form.species) {
          addSubspecies(form.species, value);
          setForm(prev => ({ ...prev, subspecies: value }));
        }
        break;
      case 'size':
        addSize(value);
        setForm(prev => ({ ...prev, size: value }));
        break;
      case 'alignment':
        addAlignment(value);
        setForm(prev => ({ ...prev, alignment: value }));
        break;
      case 'material':
        addMaterial(value);
        setForm(prev => ({ ...prev, material: value }));
        break;
      case 'habitat':
        addHabitat(value);
        const current = form.habitats || [];
        setForm(prev => ({ ...prev, habitats: [...current, value] }));
        break;
    }
  };

  const getQuickAddTitle = (): string => {
    switch (quickAddField) {
      case 'category': return 'Ajouter une catégorie';
      case 'brand': return 'Ajouter une marque';
      case 'universe': return 'Ajouter un univers';
      case 'species': return 'Ajouter une espèce';
      case 'subspecies': return `Ajouter une sous-espèce (${form.species})`;
      case 'size': return 'Ajouter une taille';
      case 'alignment': return 'Ajouter un alignement';
      case 'material': return 'Ajouter une matière';
      case 'habitat': return 'Ajouter un habitat';
      default: return '';
    }
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
      <div className="bg-white w-full sm:w-[550px] sm:max-h-[90vh] max-h-[85vh] sm:rounded-xl rounded-t-xl overflow-hidden flex flex-col">
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
            Seuls les champs remplis seront modifiés. Les valeurs communes sont pré-remplies.
          </p>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
              {commonValues.category && <span className="text-xs text-primary-500 ml-2">(commun: {commonValues.category})</span>}
            </label>
            <div className="flex gap-1">
              <select
                value={form.category || ''}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value || undefined }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">{commonValues.category ? `— Garder: ${commonValues.category} —` : '— Ne pas modifier —'}</option>
                {presets.categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setQuickAddField('category')}
                className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 rounded-lg transition"
                title="Ajouter une catégorie"
              >
                <PlusCircle size={20} />
              </button>
            </div>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marque
              {commonValues.brand && <span className="text-xs text-primary-500 ml-2">(commun: {commonValues.brand})</span>}
            </label>
            <div className="flex gap-1">
              <select
                value={form.brand || ''}
                onChange={(e) => setForm(prev => ({ ...prev, brand: e.target.value || undefined }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">{commonValues.brand ? `— Garder: ${commonValues.brand} —` : '— Ne pas modifier —'}</option>
                {presets.brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setQuickAddField('brand')}
                className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 rounded-lg transition"
                title="Ajouter une marque"
              >
                <PlusCircle size={20} />
              </button>
            </div>
          </div>

          {/* Jeu (champ libre) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Boîte de Jeu
              {commonValues.game && <span className="text-xs text-primary-500 ml-2">(commun: {commonValues.game})</span>}
            </label>
            <input
              type="text"
              value={form.game || ''}
              onChange={(e) => setForm(prev => ({ ...prev, game: e.target.value || undefined }))}
              placeholder={commonValues.game ? `Garder: ${commonValues.game}` : '— Ne pas modifier —'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          {/* Collection (champ libre) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Collection
              {commonValues.collection && <span className="text-xs text-primary-500 ml-2">(commun: {commonValues.collection})</span>}
            </label>
            <input
              type="text"
              value={form.collection || ''}
              onChange={(e) => setForm(prev => ({ ...prev, collection: e.target.value || undefined }))}
              placeholder={commonValues.collection ? `Garder: ${commonValues.collection}` : '— Ne pas modifier —'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          {/* Groupe / Armée (champ libre) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Groupe / Armée
              {commonValues.group && <span className="text-xs text-primary-500 ml-2">(commun: {commonValues.group})</span>}
            </label>
            <input
              type="text"
              value={form.group || ''}
              onChange={(e) => setForm(prev => ({ ...prev, group: e.target.value || undefined }))}
              placeholder={commonValues.group ? `Garder: ${commonValues.group}` : '— Ne pas modifier —'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          {/* Universe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Système
              {commonValues.universe && <span className="text-xs text-primary-500 ml-2">(commun: {commonValues.universe})</span>}
            </label>
            <div className="flex gap-1">
              <select
                value={form.universe || ''}
                onChange={(e) => setForm(prev => ({ ...prev, universe: e.target.value || undefined }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">{commonValues.universe ? `— Garder: ${commonValues.universe} —` : '— Ne pas modifier —'}</option>
                {presets.universes.map(universe => (
                  <option key={universe} value={universe}>{universe}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setQuickAddField('universe')}
                className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 rounded-lg transition"
                title="Ajouter un univers"
              >
                <PlusCircle size={20} />
              </button>
            </div>
          </div>

          {/* Species */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Espèce</label>
            <div className="flex gap-1">
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">— Ne pas modifier —</option>
                {presets.species.map(sp => (
                  <option key={sp} value={sp}>{sp}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setQuickAddField('species')}
                className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 rounded-lg transition"
                title="Ajouter une espèce"
              >
                <PlusCircle size={20} />
              </button>
            </div>
          </div>

          {/* Subspecies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sous-Espèce</label>
            <div className="flex gap-1">
              <select
                value={form.subspecies || ''}
                onChange={(e) => setForm(prev => ({ ...prev, subspecies: e.target.value || undefined }))}
                disabled={!form.species}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">{form.species ? '— Ne pas modifier —' : '— Choisir une espèce —'}</option>
                {form.species && getSubspeciesForSpecies(presets, form.species).map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setQuickAddField('subspecies')}
                disabled={!form.species}
                className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Ajouter une sous-espèce"
              >
                <PlusCircle size={20} />
              </button>
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Taille</label>
            <div className="flex gap-1">
              <select
                value={form.size || ''}
                onChange={(e) => setForm(prev => ({ ...prev, size: e.target.value || undefined }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">— Ne pas modifier —</option>
                {presets.sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setQuickAddField('size')}
                className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 rounded-lg transition"
                title="Ajouter une taille"
              >
                <PlusCircle size={20} />
              </button>
            </div>
          </div>

          {/* Alignement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alignement</label>
            <div className="flex gap-1">
              <select
                value={form.alignment || ''}
                onChange={(e) => setForm(prev => ({ ...prev, alignment: e.target.value || undefined }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">— Ne pas modifier —</option>
                {presets.alignments.map(alignment => (
                  <option key={alignment} value={alignment}>{alignment}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setQuickAddField('alignment')}
                className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 rounded-lg transition"
                title="Ajouter un alignement"
              >
                <PlusCircle size={20} />
              </button>
            </div>
          </div>

          {/* Matière */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Matière
              {commonValues.material && <span className="text-xs text-primary-500 ml-2">(commun: {commonValues.material})</span>}
            </label>
            <div className="flex gap-1">
              <select
                value={form.material || ''}
                onChange={(e) => setForm(prev => ({ ...prev, material: e.target.value || undefined }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">{commonValues.material ? `— Garder: ${commonValues.material} —` : '— Ne pas modifier —'}</option>
                {presets.materials.map(material => (
                  <option key={material} value={material}>{material}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setQuickAddField('material')}
                className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 rounded-lg transition"
                title="Ajouter une matière"
              >
                <PlusCircle size={20} />
              </button>
            </div>
          </div>

          {/* Habitats (multi-select) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">Habitats</label>
              <button
                type="button"
                onClick={() => setQuickAddField('habitat')}
                className="p-1 text-gray-500 hover:text-primary-500 hover:bg-gray-100 rounded-lg transition"
                title="Ajouter un habitat"
              >
                <PlusCircle size={16} />
              </button>
            </div>
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

          {/* Prix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price ?? ''}
              onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value ? parseFloat(e.target.value) : undefined }))}
              placeholder="— Ne pas modifier —"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
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

      {/* Quick add modal */}
      {quickAddField && (
        <QuickAddModal
          title={getQuickAddTitle()}
          onAdd={handleQuickAdd}
          onClose={() => setQuickAddField(null)}
        />
      )}
    </div>
  );
}
