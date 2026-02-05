import { useState, useRef, useEffect } from 'react';
import { X, Upload, Camera, Plus } from 'lucide-react';
import { usePresets } from '../context/PresetContext';
import type { Figurine, FigurineInput } from '../types';
import { getSubspeciesForSpecies } from '../types';

interface FigurineFormProps {
  figurine?: Figurine | null;
  onSubmit: (data: FigurineInput) => Promise<void>;
  onClose: () => void;
  onUploadImage: (file: File) => Promise<string>;
  existingTags: string[];
}

export function FigurineForm({ figurine, onSubmit, onClose, onUploadImage, existingTags }: FigurineFormProps) {
  const { presets } = usePresets();

  const emptyForm: FigurineInput = {
    name: '',
    category: '',
    brand: '',
    game: '',
    collection: '',
    universe: '',
    species: '',
    subspecies: '',
    size: 'Normal',
    alignment: '',
    group: '',
    habitats: [],
    status: presets.statuses[0]?.value || 'unpainted',
    quantity: 1,
    tags: [],
    notes: '',
    image_url: null,
  };

  const [form, setForm] = useState<FigurineInput>(figurine ? {
    name: figurine.name,
    category: figurine.category || '',
    brand: figurine.brand || '',
    game: figurine.game || '',
    collection: figurine.collection || '',
    universe: figurine.universe || '',
    species: figurine.species || '',
    subspecies: figurine.subspecies || '',
    size: figurine.size || 'Normal',
    alignment: figurine.alignment || '',
    group: figurine.group || '',
    habitats: figurine.habitats || [],
    status: figurine.status,
    quantity: figurine.quantity || 1,
    tags: figurine.tags,
    notes: figurine.notes,
    image_url: figurine.image_url,
  } : emptyForm);

  const toggleHabitat = (habitat: string) => {
    setForm(prev => ({
      ...prev,
      habitats: prev.habitats.includes(habitat)
        ? prev.habitats.filter(h => h !== habitat)
        : [...prev.habitats, habitat],
    }));
  };

  const [newTag, setNewTag] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const url = await onUploadImage(file);
      setForm(prev => ({ ...prev, image_url: url }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Le nom est requis');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(form);
      onClose();
    } catch (error) {
      console.error('Submit failed:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div
        ref={formRef}
        className="bg-white w-full sm:w-[500px] sm:max-h-[90vh] max-h-[85vh] sm:rounded-xl rounded-t-xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold">
            {figurine ? 'Modifier la figurine' : 'Ajouter une figurine'}
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
          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
            <div className="flex gap-3 items-start">
              <div
                className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50"
              >
                {form.image_url ? (
                  <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="text-gray-300" size={32} />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  <Upload size={18} />
                  {uploading ? 'Upload...' : 'Choisir une image'}
                </button>
                {form.image_url && (
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, image_url: null }))}
                    className="w-full text-sm text-red-500 hover:text-red-600"
                  >
                    Supprimer l'image
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Space Marine Intercessor"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              required
            />
          </div>

          {/* Catégorie & Marque */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">Sélectionner</option>
                {presets.categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marque / Créateur</label>
              <select
                value={form.brand}
                onChange={(e) => setForm(prev => ({ ...prev, brand: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">Sélectionner</option>
                {presets.brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Jeu & Collection (champs libres) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jeu</label>
              <input
                type="text"
                value={form.game}
                onChange={(e) => setForm(prev => ({ ...prev, game: e.target.value }))}
                placeholder="Ex: Warhammer 40K"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Collection</label>
              <input
                type="text"
                value={form.collection}
                onChange={(e) => setForm(prev => ({ ...prev, collection: e.target.value }))}
                placeholder="Ex: Kill Team"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>

          {/* Groupe / Armée (champ libre) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Groupe / Armée</label>
            <input
              type="text"
              value={form.group}
              onChange={(e) => setForm(prev => ({ ...prev, group: e.target.value }))}
              placeholder="Ex: Ultramarines, Légion des Damnés..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          {/* Univers & Espèce */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Univers</label>
              <select
                value={form.universe}
                onChange={(e) => setForm(prev => ({ ...prev, universe: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">Sélectionner</option>
                {presets.universes.map(universe => (
                  <option key={universe} value={universe}>{universe}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Espèce</label>
              <select
                value={form.species}
                onChange={(e) => {
                  const newSpecies = e.target.value;
                  // Reset subspecies when species changes
                  const newSubspecies = getSubspeciesForSpecies(presets, newSpecies);
                  setForm(prev => ({
                    ...prev,
                    species: newSpecies,
                    subspecies: newSubspecies.includes(prev.subspecies) ? prev.subspecies : '',
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">Sélectionner</option>
                {presets.species.map(sp => (
                  <option key={sp} value={sp}>{sp}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sous-Espèce & Taille */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sous-Espèce</label>
              <select
                value={form.subspecies}
                onChange={(e) => setForm(prev => ({ ...prev, subspecies: e.target.value }))}
                disabled={!form.species}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">{form.species ? 'Sélectionner' : 'Choisir une espèce d\'abord'}</option>
                {getSubspeciesForSpecies(presets, form.species).map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taille</label>
              <select
                value={form.size}
                onChange={(e) => setForm(prev => ({ ...prev, size: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                {presets.sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Alignement, Statut & Quantité */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alignement</label>
              <select
                value={form.alignment}
                onChange={(e) => setForm(prev => ({ ...prev, alignment: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">Sélectionner</option>
                {presets.alignments.map(alignment => (
                  <option key={alignment} value={alignment}>{alignment}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={form.status}
                onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                {presets.statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm(prev => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>

          {/* Habitats (multi-select checkboxes) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Habitats</label>
            <div className="flex flex-wrap gap-2">
              {presets.habitats.map(habitat => (
                <label
                  key={habitat}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition text-sm ${
                    form.habitats.includes(habitat)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.habitats.includes(habitat)}
                    onChange={() => toggleHabitat(habitat)}
                    className="sr-only"
                  />
                  {habitat}
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Ajouter un tag"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                list="existing-tags"
              />
              <datalist id="existing-tags">
                {existingTags.map(tag => (
                  <option key={tag} value={tag} />
                ))}
              </datalist>
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
              >
                <Plus size={20} />
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-primary-900"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes additionnelles..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
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
            disabled={submitting || !form.name.trim()}
            className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition disabled:opacity-50"
          >
            {submitting ? 'Enregistrement...' : figurine ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}
