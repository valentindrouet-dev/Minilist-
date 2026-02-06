import { useState, useRef } from 'react';
import { X, Camera, Link, Package } from 'lucide-react';
import { usePresets } from '../context/PresetContext';

interface GameInfo {
  game: string;
  brand: string;
  universe: string;
  coverImage: string | null;
  figurineIds: string[];
}

interface GameEditModalProps {
  gameInfo: GameInfo;
  onSave: (updates: { brand?: string; universe?: string; image_url?: string | null }) => Promise<void>;
  onClose: () => void;
  onUploadImage: (file: File) => Promise<string>;
}

export function GameEditModal({ gameInfo, onSave, onClose, onUploadImage }: GameEditModalProps) {
  const { presets } = usePresets();
  const [brand, setBrand] = useState(gameInfo.brand);
  const [universe, setUniverse] = useState(gameInfo.universe);
  const [coverImage, setCoverImage] = useState(gameInfo.coverImage);
  const [imageUrlInput, setImageUrlInput] = useState(
    coverImage?.startsWith('http') ? coverImage : ''
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress image
  async function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  }

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const compressedFile = await compressImage(file);
      const url = await onUploadImage(compressedFile);
      setCoverImage(url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Erreur lors de l\'upload de l\'image');
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
      setCoverImage(url);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updates: { brand?: string; universe?: string; image_url?: string | null } = {};

      if (brand !== gameInfo.brand) {
        updates.brand = brand;
      }
      if (universe !== gameInfo.universe) {
        updates.universe = universe;
      }
      if (coverImage !== gameInfo.coverImage) {
        updates.image_url = coverImage;
      }

      if (Object.keys(updates).length > 0) {
        await onSave(updates);
      }
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Package className="text-primary-500" size={20} />
            <h2 className="font-semibold">Modifier le jeu</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Game name (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du jeu</label>
            <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-600">
              {gameInfo.game}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {gameInfo.figurineIds.length} figurine{gameInfo.figurineIds.length !== 1 ? 's' : ''} seront mises à jour
            </p>
          </div>

          {/* Cover image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Couverture de la boîte</label>
            <div className="flex gap-3 items-start">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition ${
                  dragOver
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                }`}
              >
                {coverImage ? (
                  <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                ) : uploading ? (
                  <div className="animate-pulse text-gray-400 text-xs">Upload...</div>
                ) : (
                  <Camera className={dragOver ? 'text-primary-400' : 'text-gray-300'} size={28} />
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
                  <Link size={14} className="text-gray-400 flex-shrink-0" />
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
                    placeholder="URL de l'image..."
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 outline-none"
                  />
                </div>
                {coverImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImage(null);
                      setImageUrlInput('');
                    }}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Supprimer l'image
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Brand */}
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

          {/* Universe */}
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

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
