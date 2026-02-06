import { useState, useRef } from 'react';
import { X, Plus, Trash2, Camera, Link, Package } from 'lucide-react';
import { usePresets } from '../context/PresetContext';
import { compressImage } from '../services/imageCompressor';
import type { FigurineInput } from '../types';

interface GameBoxItem {
  id: string;
  name: string;
  quantity: number;
}

interface GameBoxModalProps {
  onSubmit: (items: FigurineInput[]) => Promise<void>;
  onClose: () => void;
}

export function GameBoxModal({ onSubmit, onClose }: GameBoxModalProps) {
  const { presets } = usePresets();

  // Common fields for all figurines in the box
  const [game, setGame] = useState('');
  const [brand, setBrand] = useState('');
  const [universe, setUniverse] = useState('');
  const [boxImage, setBoxImage] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Figurine items
  const [items, setItems] = useState<GameBoxItem[]>([
    { id: crypto.randomUUID(), name: '', quantity: 1 },
  ]);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      // Compress image for reliable storage
      const compressedBase64 = await compressImage(file);
      setBoxImage(compressedBase64);
    } catch (error) {
      console.error('Image compression failed:', error);
      alert('Erreur lors du traitement de l\'image. Essayez une autre image ou une URL.');
    } finally {
      setUploading(false);
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
    const url = value.trim();
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      setBoxImage(url);
    }
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: crypto.randomUUID(), name: '', quantity: 1 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, updates: Partial<GameBoxItem>) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = items.filter(item => item.name.trim());
    if (validItems.length === 0) {
      alert('Ajoutez au moins une figurine avec un nom');
      return;
    }

    if (!game.trim()) {
      alert('Le nom du jeu est requis');
      return;
    }

    try {
      setSubmitting(true);

      const figurines: FigurineInput[] = validItems.map(item => ({
        name: item.name.trim(),
        original_name: '',
        category: '',
        brand,
        game: game.trim(),
        collection: game.trim(), // Use game name as collection
        universe,
        species: '',
        subspecies: '',
        size: 'Normal',
        alignment: '',
        group: '',
        habitats: [],
        status: presets.statuses[0]?.value || 'unpainted',
        statusBreakdown: [],
        price: null,
        quantity: item.quantity,
        tags: [],
        notes: '',
        image_url: boxImage, // All figurines share the box image
        is_own_image: false,
      }));

      await onSubmit(figurines);
      onClose();
    } catch (error) {
      console.error('Submit failed:', error);
      alert('Erreur lors de l\'ajout');
    } finally {
      setSubmitting(false);
    }
  };

  const totalQuantity = items.reduce((sum, item) => sum + (item.name.trim() ? item.quantity : 0), 0);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:w-[550px] sm:max-h-[90vh] max-h-[85vh] sm:rounded-xl rounded-t-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Package className="text-primary-500" size={22} />
            <h2 className="text-lg font-semibold">Ajouter une boîte de jeu</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Box image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Couverture de la boîte</label>
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
                {boxImage ? (
                  <img src={boxImage} alt="Box cover" className="w-full h-full object-cover" />
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
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <Link size={16} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    onPaste={(e) => {
                      const pastedText = e.clipboardData.getData('text');
                      if (pastedText) {
                        setTimeout(() => handleUrlChange(pastedText), 0);
                      }
                    }}
                    placeholder="Coller une URL d'image..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                  />
                </div>
                {boxImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setBoxImage(null);
                      setImageUrlInput('');
                    }}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Supprimer l'image
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Game name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du jeu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={game}
              onChange={(e) => setGame(e.target.value)}
              placeholder="Ex: Zombicide, Warhammer 40K..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              required
            />
          </div>

          {/* Brand & Universe */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">Sélectionner</option>
                {presets.brands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Univers</label>
              <select
                value={universe}
                onChange={(e) => setUniverse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">Sélectionner</option>
                {presets.universes.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Figurines list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Figurines de la boîte
              </label>
              <span className="text-xs text-gray-500">
                {totalQuantity} figurine{totalQuantity !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={item.id} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, { name: e.target.value })}
                    placeholder={`Figurine ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    autoFocus={index === items.length - 1 && items.length > 1}
                  />
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-16 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-center"
                    title="Quantité"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition"
            >
              <Plus size={18} />
              Ajouter une figurine
            </button>
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
            disabled={submitting || !game.trim() || items.filter(i => i.name.trim()).length === 0}
            className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition disabled:opacity-50"
          >
            {submitting ? 'Ajout...' : `Ajouter ${totalQuantity} figurine${totalQuantity !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
