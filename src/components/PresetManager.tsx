import { useState } from 'react';
import { X, Plus, Trash2, RotateCcw, Tag, Palette, Globe, Package, CheckCircle, Ruler } from 'lucide-react';
import { usePresets } from '../context/PresetContext';
import type { StatusPreset } from '../types';

interface PresetManagerProps {
  onClose: () => void;
}

type Tab = 'brands' | 'categories' | 'subcategories' | 'universes' | 'statuses' | 'scales';

const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: 'brands', label: 'Marques', icon: <Package size={18} /> },
  { value: 'categories', label: 'Catégories', icon: <Tag size={18} /> },
  { value: 'subcategories', label: 'Sous-catégories', icon: <Tag size={18} /> },
  { value: 'universes', label: 'Univers', icon: <Globe size={18} /> },
  { value: 'statuses', label: 'Statuts', icon: <CheckCircle size={18} /> },
  { value: 'scales', label: 'Échelles', icon: <Ruler size={18} /> },
];

const COLOR_OPTIONS = [
  'bg-gray-400',
  'bg-slate-400',
  'bg-red-400',
  'bg-orange-400',
  'bg-amber-400',
  'bg-yellow-400',
  'bg-lime-400',
  'bg-green-400',
  'bg-emerald-400',
  'bg-teal-400',
  'bg-cyan-400',
  'bg-sky-400',
  'bg-blue-400',
  'bg-indigo-400',
  'bg-violet-400',
  'bg-purple-400',
  'bg-fuchsia-400',
  'bg-pink-400',
  'bg-rose-400',
];

export function PresetManager({ onClose }: PresetManagerProps) {
  const {
    presets,
    addBrand, removeBrand,
    addCategory, removeCategory,
    addSubcategory, removeSubcategory,
    addUniverse, removeUniverse,
    addStatus, removeStatus, updateStatus,
    addScale, removeScale,
    resetPresets,
  } = usePresets();

  const [activeTab, setActiveTab] = useState<Tab>('brands');
  const [newItem, setNewItem] = useState('');
  const [newStatus, setNewStatus] = useState<StatusPreset>({ value: '', label: '', color: 'bg-gray-400' });

  const handleAddItem = () => {
    const item = newItem.trim();
    if (!item) return;

    switch (activeTab) {
      case 'brands': addBrand(item); break;
      case 'categories': addCategory(item); break;
      case 'subcategories': addSubcategory(item); break;
      case 'universes': addUniverse(item); break;
      case 'scales': addScale(item); break;
    }
    setNewItem('');
  };

  const handleAddStatus = () => {
    if (!newStatus.value.trim() || !newStatus.label.trim()) return;
    addStatus(newStatus);
    setNewStatus({ value: '', label: '', color: 'bg-gray-400' });
  };

  const handleRemoveItem = (item: string) => {
    switch (activeTab) {
      case 'brands': removeBrand(item); break;
      case 'categories': removeCategory(item); break;
      case 'subcategories': removeSubcategory(item); break;
      case 'universes': removeUniverse(item); break;
      case 'scales': removeScale(item); break;
    }
  };

  const handleReset = () => {
    if (window.confirm('Réinitialiser tous les presets aux valeurs par défaut ?')) {
      resetPresets();
    }
  };

  const getCurrentItems = (): string[] => {
    switch (activeTab) {
      case 'brands': return presets.brands;
      case 'categories': return presets.categories;
      case 'subcategories': return presets.subcategories;
      case 'universes': return presets.universes;
      case 'scales': return presets.scales;
      default: return [];
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Palette size={20} className="text-primary-500" />
            <h2 className="text-lg font-semibold">Gérer les presets</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition"
              title="Réinitialiser"
            >
              <RotateCcw size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 ${
                activeTab === tab.value
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'statuses' ? (
            /* Status management */
            <div className="space-y-4">
              {/* Add new status */}
              <div className="flex gap-2 flex-wrap">
                <input
                  type="text"
                  value={newStatus.value}
                  onChange={(e) => setNewStatus(prev => ({ ...prev, value: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                  placeholder="Identifiant (ex: primed)"
                  className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                />
                <input
                  type="text"
                  value={newStatus.label}
                  onChange={(e) => setNewStatus(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Libellé (ex: Sous-couchée)"
                  className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                />
                <button
                  onClick={handleAddStatus}
                  disabled={!newStatus.value.trim() || !newStatus.label.trim()}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Color picker for new status */}
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewStatus(prev => ({ ...prev, color }))}
                    className={`w-6 h-6 rounded-full ${color} ${
                      newStatus.color === color ? 'ring-2 ring-offset-2 ring-primary-500' : ''
                    }`}
                  />
                ))}
              </div>

              {/* Existing statuses */}
              <div className="space-y-2 mt-4">
                {presets.statuses.map(status => (
                  <div
                    key={status.value}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className={`w-4 h-4 rounded-full ${status.color}`} />
                    <div className="flex-1">
                      <div className="font-medium">{status.label}</div>
                      <div className="text-xs text-gray-500">{status.value}</div>
                    </div>
                    <div className="flex gap-1">
                      {COLOR_OPTIONS.slice(0, 10).map(color => (
                        <button
                          key={color}
                          onClick={() => updateStatus(status.value, { color })}
                          className={`w-4 h-4 rounded-full ${color} ${
                            status.color === color ? 'ring-1 ring-offset-1 ring-gray-400' : ''
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => removeStatus(status.value)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Simple list management */
            <div className="space-y-4">
              {/* Add new item */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                  placeholder={`Ajouter ${TABS.find(t => t.value === activeTab)?.label.toLowerCase().slice(0, -1)}...`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
                <button
                  onClick={handleAddItem}
                  disabled={!newItem.trim()}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Existing items */}
              <div className="flex flex-wrap gap-2">
                {getCurrentItems().map(item => (
                  <div
                    key={item}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg group"
                  >
                    <span>{item}</span>
                    <button
                      onClick={() => handleRemoveItem(item)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {getCurrentItems().length === 0 && (
                <p className="text-center text-gray-400 py-8">
                  Aucun élément. Ajoutez-en un ci-dessus.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
