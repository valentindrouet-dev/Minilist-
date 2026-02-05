import { useState, useRef } from 'react';
import { X, Plus, Trash2, Camera } from 'lucide-react';
import type { FigurineInput } from '../types';

interface MultiAddItem {
  id: string;
  name: string;
  image_url: string | null;
  imageFile?: File;
}

interface MultiAddModalProps {
  onSubmit: (items: FigurineInput[]) => Promise<void>;
  onClose: () => void;
  onUploadImage: (file: File) => Promise<string>;
}

export function MultiAddModal({ onSubmit, onClose, onUploadImage }: MultiAddModalProps) {
  const [items, setItems] = useState<MultiAddItem[]>([
    { id: crypto.randomUUID(), name: '', image_url: null },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const addItem = () => {
    setItems(prev => [...prev, { id: crypto.randomUUID(), name: '', image_url: null }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, updates: Partial<MultiAddItem>) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handleImageSelect = (id: string, file: File) => {
    const previewUrl = URL.createObjectURL(file);
    updateItem(id, { image_url: previewUrl, imageFile: file });
  };

  const handleFileInput = (id: string) => {
    const input = fileInputRefs.current.get(id);
    if (input) {
      input.click();
    }
  };

  const handleSubmit = async () => {
    const validItems = items.filter(item => item.name.trim());
    if (validItems.length === 0) {
      alert('Ajoutez au moins une figurine avec un nom');
      return;
    }

    try {
      setSubmitting(true);

      // Upload images and create figurines
      const figurines: FigurineInput[] = await Promise.all(
        validItems.map(async (item) => {
          let imageUrl: string | null = null;

          if (item.imageFile) {
            try {
              imageUrl = await onUploadImage(item.imageFile);
            } catch (error) {
              console.error('Failed to upload image:', error);
            }
          }

          return {
            name: item.name.trim(),
            category: '',
            brand: '',
            game: '',
            collection: '',
            group: '',
            universe: '',
            species: '',
            subspecies: '',
            size: 'Normal',
            alignment: '',
            habitats: [],
            status: 'unpainted',
            price: null,
            quantity: 1,
            tags: [],
            notes: '',
            image_url: imageUrl,
          };
        })
      );

      await onSubmit(figurines);
      onClose();
    } catch (error) {
      console.error('Failed to add figurines:', error);
      alert('Erreur lors de l\'ajout des figurines');
    } finally {
      setSubmitting(false);
    }
  };

  const validCount = items.filter(item => item.name.trim()).length;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:w-[500px] sm:max-h-[90vh] max-h-[85vh] sm:rounded-xl rounded-t-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold">Ajouts multiples</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-sm text-gray-500 mb-4">
            Ajoutez rapidement plusieurs figurines. Vous pourrez compléter les détails plus tard via la modification par lot.
          </p>

          {items.map((item, index) => (
            <div key={item.id} className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl">
              {/* Image preview / upload */}
              <div className="flex-shrink-0">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={(el) => {
                    if (el) fileInputRefs.current.set(item.id, el);
                  }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageSelect(item.id, file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleFileInput(item.id)}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-primary-400 hover:bg-primary-50 transition"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera size={24} className="text-gray-400" />
                  )}
                </button>
              </div>

              {/* Name input */}
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">
                  Figurine #{index + 1}
                </label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, { name: e.target.value })}
                  placeholder="Nom de la figurine"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  autoFocus={index === items.length - 1}
                />
              </div>

              {/* Remove button */}
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

          {/* Add more button */}
          <button
            type="button"
            onClick={addItem}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Ajouter une figurine
          </button>
        </div>

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
            disabled={submitting || validCount === 0}
            className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition disabled:opacity-50"
          >
            {submitting ? 'Ajout...' : `Ajouter ${validCount} figurine${validCount !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
