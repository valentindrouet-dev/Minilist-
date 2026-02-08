import { useState, useRef, useEffect } from 'react';
import { X, Upload, Camera, Plus, PlusCircle, Link, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePresets } from '../context/PresetContext';
import { compressImage } from '../services/imageCompressor';
import type { Figurine, FigurineInput } from '../types';
import { getSubspeciesForSpecies } from '../types';

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

interface FigurineFormProps {
  figurine?: Figurine | null;
  onSubmit: (data: FigurineInput, figurineId?: string) => Promise<void>;
  onClose: () => void;
  existingTags: string[];
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

type QuickAddField = 'category' | 'brand' | 'universe' | 'species' | 'subspecies' | 'size' | 'alignment' | 'material' | 'habitat' | null;

export function FigurineForm({ figurine, onSubmit, onClose, existingTags, onPrevious, onNext, hasPrevious = false, hasNext = false }: FigurineFormProps) {
  const { presets, addCategory, addBrand, addUniverse, addSpecies, addSubspecies, addSize, addAlignment, addMaterial, addHabitat } = usePresets();
  const [quickAddField, setQuickAddField] = useState<QuickAddField>(null);

  const emptyForm: FigurineInput = {
    name: '',
    original_name: '',
    category: '',
    brand: '',
    game: '',
    collection: '',
    universe: '',
    species: '',
    subspecies: '',
    size: 'Normal',
    alignment: '',
    material: '',
    group: '',
    habitats: [],
    status: presets.statuses[0]?.value || 'unpainted',
    statusBreakdown: [],
    price: null,
    quantity: 1,
    tags: [],
    notes: '',
    image_url: null,
    is_own_image: false,
  };

  const [form, setForm] = useState<FigurineInput>(figurine ? {
    name: figurine.name,
    original_name: figurine.original_name || '',
    category: figurine.category || '',
    brand: figurine.brand || '',
    game: figurine.game || '',
    collection: figurine.collection || '',
    universe: figurine.universe || '',
    species: figurine.species || '',
    subspecies: figurine.subspecies || '',
    size: figurine.size || 'Normal',
    alignment: figurine.alignment || '',
    material: figurine.material || '',
    group: figurine.group || '',
    habitats: figurine.habitats || [],
    status: figurine.status,
    statusBreakdown: figurine.statusBreakdown || [],
    price: figurine.price,
    quantity: figurine.quantity || 1,
    tags: figurine.tags,
    notes: figurine.notes,
    image_url: figurine.image_url,
    is_own_image: figurine.is_own_image || false,
  } : emptyForm);

  // Update form when figurine changes (for navigation)
  useEffect(() => {
    if (figurine) {
      setForm({
        name: figurine.name,
        original_name: figurine.original_name || '',
        category: figurine.category || '',
        brand: figurine.brand || '',
        game: figurine.game || '',
        collection: figurine.collection || '',
        universe: figurine.universe || '',
        species: figurine.species || '',
        subspecies: figurine.subspecies || '',
        size: figurine.size || 'Normal',
        alignment: figurine.alignment || '',
        material: figurine.material || '',
        group: figurine.group || '',
        habitats: figurine.habitats || [],
        status: figurine.status,
        statusBreakdown: figurine.statusBreakdown || [],
        price: figurine.price,
        quantity: figurine.quantity || 1,
        tags: figurine.tags,
        notes: figurine.notes,
        image_url: figurine.image_url,
        is_own_image: figurine.is_own_image || false,
      });
      // Reset image URL input
      setImageUrlInput(
        figurine.image_url && (figurine.image_url.startsWith('http://') || figurine.image_url.startsWith('https://'))
          ? figurine.image_url
          : ''
      );
    }
  }, [figurine?.id]);

  const toggleHabitat = (habitat: string) => {
    setForm(prev => ({
      ...prev,
      habitats: prev.habitats.includes(habitat)
        ? prev.habitats.filter(h => h !== habitat)
        : [...prev.habitats, habitat],
    }));
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
        setForm(prev => ({ ...prev, species: value, subspecies: '' }));
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
        setForm(prev => ({ ...prev, habitats: [...prev.habitats, value] }));
        break;
    }
  };

  const getQuickAddTitle = (): string => {
    switch (quickAddField) {
      case 'category': return 'Ajouter une catégorie';
      case 'brand': return 'Ajouter une marque';
      case 'universe': return 'Ajouter un système';
      case 'species': return 'Ajouter une espèce';
      case 'subspecies': return `Ajouter une sous-espèce (${form.species})`;
      case 'size': return 'Ajouter une taille';
      case 'alignment': return 'Ajouter un alignement';
      case 'material': return 'Ajouter une matière';
      case 'habitat': return 'Ajouter un habitat';
      default: return '';
    }
  };

  const [newTag, setNewTag] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState(() => {
    // Initialize with existing URL if it's not a base64 image
    const url = figurine?.image_url;
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      return url;
    }
    return '';
  });
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
      // Always compress the image first for reliability
      const compressedBase64 = await compressImage(file);
      setForm(prev => ({ ...prev, image_url: compressedBase64 }));
    } catch (error) {
      console.error('Image compression failed:', error);
      alert('Erreur lors du traitement de l\'image. Essayez une autre image ou une URL.');
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const handleUrlChange = (value: string) => {
    setImageUrlInput(value);
    // Auto-apply URL if it looks like a valid image URL
    const url = value.trim();
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      setForm(prev => ({ ...prev, image_url: url }));
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
      // Pass figurine ID to ensure we update the correct figurine
      await onSubmit(form, figurine?.id);
      onClose();
    } catch (error) {
      console.error('Submit failed:', error);
      const message = error instanceof Error ? error.message : 'Erreur lors de l\'enregistrement';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Save and navigate to previous/next figurine
  const handleSaveAndNavigate = async (direction: 'previous' | 'next') => {
    if (!form.name.trim()) {
      alert('Le nom est requis');
      return;
    }

    // Capture the current figurine ID before any state changes
    const currentFigurineId = figurine?.id;

    try {
      setSubmitting(true);
      // Pass the captured ID explicitly to avoid closure issues
      await onSubmit(form, currentFigurineId);
      if (direction === 'previous' && onPrevious) {
        onPrevious();
      } else if (direction === 'next' && onNext) {
        onNext();
      }
    } catch (error) {
      console.error('Submit failed:', error);
      const message = error instanceof Error ? error.message : 'Erreur lors de l\'enregistrement';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      {/* Previous button (only in edit mode) */}
      {figurine && hasPrevious && onPrevious && (
        <button
          onClick={() => handleSaveAndNavigate('previous')}
          disabled={submitting}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition z-10 disabled:opacity-50"
          title="Enregistrer et voir la précédente"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </button>
      )}

      {/* Next button (only in edit mode) */}
      {figurine && hasNext && onNext && (
        <button
          onClick={() => handleSaveAndNavigate('next')}
          disabled={submitting}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition z-10 disabled:opacity-50"
          title="Enregistrer et voir la suivante"
        >
          <ChevronRight size={24} className="text-gray-700" />
        </button>
      )}

      <div
        ref={formRef}
        className="bg-white w-full sm:w-[600px] sm:max-h-[90vh] max-h-[85vh] sm:rounded-xl rounded-t-xl overflow-hidden flex flex-col"
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
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition ${
                  dragOver
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                }`}
              >
                {form.image_url ? (
                  <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                ) : uploading ? (
                  <div className="animate-pulse text-gray-400 text-xs">Upload...</div>
                ) : (
                  <Camera className={dragOver ? 'text-primary-400' : 'text-gray-300'} size={32} />
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
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 text-sm"
                >
                  <Upload size={16} />
                  {uploading ? 'Upload...' : 'Choisir un fichier'}
                </button>
                <div className="flex items-center gap-2">
                  <Link size={16} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    onPaste={(e) => {
                      // Get pasted text and apply immediately
                      const pastedText = e.clipboardData.getData('text');
                      if (pastedText) {
                        setTimeout(() => handleUrlChange(pastedText), 0);
                      }
                    }}
                    placeholder="Coller une URL d'image..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                  />
                </div>
                <p className="text-xs text-gray-400">Glissez-déposez ou collez une URL</p>
                {form.image_url && (
                  <>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.is_own_image}
                        onChange={(e) => setForm(prev => ({ ...prev, is_own_image: e.target.checked }))}
                        className="w-4 h-4 text-primary-500 rounded border-gray-300 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Ma photo</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForm(prev => ({ ...prev, image_url: null, is_own_image: false }));
                        setImageUrlInput('');
                      }}
                      className="w-full text-sm text-red-500 hover:text-red-600"
                    >
                      Supprimer l'image
                    </button>
                  </>
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

          {/* Nom original (anglais) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom original (anglais)
            </label>
            <input
              type="text"
              value={form.original_name}
              onChange={(e) => setForm(prev => ({ ...prev, original_name: e.target.value }))}
              placeholder="Ex: Space Marine Intercessor (English name)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          {/* Marque & Système */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
              <div className="flex gap-1">
                <select
                  value={form.brand}
                  onChange={(e) => setForm(prev => ({ ...prev, brand: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="">Sélectionner</option>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Système</label>
              <div className="flex gap-1">
                <select
                  value={form.universe}
                  onChange={(e) => setForm(prev => ({ ...prev, universe: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="">Sélectionner</option>
                  {presets.universes.map(universe => (
                    <option key={universe} value={universe}>{universe}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setQuickAddField('universe')}
                  className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 rounded-lg transition"
                  title="Ajouter un système"
                >
                  <PlusCircle size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Boîte de Jeu & Collection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Boîte de Jeu</label>
              <input
                type="text"
                value={form.game}
                onChange={(e) => setForm(prev => ({ ...prev, game: e.target.value }))}
                placeholder="Ex: Kill Team Starter Set"
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

          {/* Groupe / Armée & Catégorie */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Groupe / Armée</label>
              <input
                type="text"
                value={form.group}
                onChange={(e) => setForm(prev => ({ ...prev, group: e.target.value }))}
                placeholder="Ex: Ultramarines..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <div className="flex gap-1">
                <select
                  value={form.category}
                  onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="">Sélectionner</option>
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
          </div>

          {/* Espèce & Sous-Espèce */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Espèce</label>
              <div className="flex gap-1">
                <select
                  value={form.species}
                  onChange={(e) => {
                    const newSpecies = e.target.value;
                    const newSubspecies = getSubspeciesForSpecies(presets, newSpecies);
                    setForm(prev => ({
                      ...prev,
                      species: newSpecies,
                      subspecies: newSubspecies.includes(prev.subspecies) ? prev.subspecies : '',
                    }));
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="">Sélectionner</option>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sous-Espèce</label>
              <div className="flex gap-1">
                <select
                  value={form.subspecies}
                  onChange={(e) => setForm(prev => ({ ...prev, subspecies: e.target.value }))}
                  disabled={!form.species}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{form.species ? 'Sélectionner' : 'Choisir une espèce d\'abord'}</option>
                  {getSubspeciesForSpecies(presets, form.species).map(sub => (
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
          </div>

          {/* Taille & Alignement */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taille</label>
              <div className="flex gap-1">
                <select
                  value={form.size}
                  onChange={(e) => setForm(prev => ({ ...prev, size: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alignement</label>
              <div className="flex gap-1">
                <select
                  value={form.alignment}
                  onChange={(e) => setForm(prev => ({ ...prev, alignment: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="">Sélectionner</option>
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
          </div>

          {/* Matière */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
            <div className="flex gap-1">
              <select
                value={form.material}
                onChange={(e) => setForm(prev => ({ ...prev, material: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">Sélectionner</option>
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

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut principal</label>
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

          {/* Status breakdown for groups (when quantity > 1) */}
          {form.quantity > 1 && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Répartition des statuts</label>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({
                    ...prev,
                    statusBreakdown: [...prev.statusBreakdown, { status: prev.status, count: 1 }]
                  }))}
                  className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1"
                >
                  <Plus size={14} />
                  Ajouter
                </button>
              </div>
              {form.statusBreakdown.length > 0 ? (
                <div className="space-y-2">
                  {form.statusBreakdown.map((sb, idx) => {
                    const statusInfo = presets.statuses.find(s => s.value === sb.status);
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${statusInfo?.color || 'bg-gray-400'} flex-shrink-0`} />
                        <select
                          value={sb.status}
                          onChange={(e) => setForm(prev => ({
                            ...prev,
                            statusBreakdown: prev.statusBreakdown.map((item, i) =>
                              i === idx ? { ...item, status: e.target.value } : item
                            )
                          }))}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 outline-none"
                        >
                          {presets.statuses.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={sb.count}
                          onChange={(e) => setForm(prev => ({
                            ...prev,
                            statusBreakdown: prev.statusBreakdown.map((item, i) =>
                              i === idx ? { ...item, count: Math.max(1, parseInt(e.target.value) || 1) } : item
                            )
                          }))}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({
                            ...prev,
                            statusBreakdown: prev.statusBreakdown.filter((_, i) => i !== idx)
                          }))}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                  <div className="text-xs text-gray-500">
                    Total: {form.statusBreakdown.reduce((sum, sb) => sum + sb.count, 0)} / {form.quantity}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">
                  Ajoutez une répartition pour suivre différents statuts (ex: 10 sous-couchées, 5 peintes)
                </p>
              )}
            </div>
          )}

          {/* Quantité & Prix */}
          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price ?? ''}
                onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value ? parseFloat(e.target.value) : null }))}
                placeholder="Ex: 29.99"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>

          {/* Habitats (multi-select checkboxes) */}
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
