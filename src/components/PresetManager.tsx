import { useState } from 'react';
import { X, Plus, RotateCcw, Tag, Palette, Globe, Package, CheckCircle, Ruler, Users, MapPin, Compass, ChevronUp, ChevronDown, SortAsc, Edit2, Check } from 'lucide-react';
import { usePresets } from '../context/PresetContext';
import type { StatusPreset } from '../types';

type PresetField = 'categories' | 'brands' | 'universes' | 'species' | 'sizes' | 'alignments' | 'habitats';

interface PresetManagerProps {
  onClose: () => void;
}

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

interface PresetCardProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
  field: PresetField;
  onAdd: (item: string) => void;
  onRemove: (item: string) => void;
  onEdit: (oldValue: string, newValue: string) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onSortAlpha: () => void;
  placeholder?: string;
}

function PresetCard({ title, icon, items, onAdd, onRemove, onEdit, onMove, onSortAlpha, placeholder }: PresetCardProps) {
  const [newItem, setNewItem] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    const item = newItem.trim();
    if (item) {
      onAdd(item);
      setNewItem('');
    }
  };

  const startEdit = (item: string) => {
    setEditingItem(item);
    setEditValue(item);
  };

  const saveEdit = () => {
    if (editingItem && editValue.trim()) {
      onEdit(editingItem, editValue.trim());
    }
    setEditingItem(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditValue('');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
        <span className="text-primary-500">{icon}</span>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
          {items.length}
        </span>
        <button
          onClick={onSortAlpha}
          className="ml-auto p-1 text-gray-400 hover:text-primary-500 hover:bg-gray-200 rounded transition"
          title="Trier alphabétiquement"
        >
          <SortAsc size={16} />
        </button>
      </div>
      <div className="p-3 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={placeholder || `Ajouter...`}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
          <button
            onClick={handleAdd}
            disabled={!newItem.trim()}
            className="px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {items.map((item, index) => (
            <div
              key={item}
              className="flex items-center gap-1 p-1.5 bg-gray-50 rounded group hover:bg-gray-100 transition"
            >
              {editingItem === item ? (
                <div className="flex-1 flex gap-1">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    autoFocus
                    className="flex-1 px-2 py-1 text-sm border border-primary-300 rounded focus:ring-1 focus:ring-primary-500 outline-none"
                  />
                  <button onClick={saveEdit} className="p-1 text-green-600 hover:bg-green-50 rounded">
                    <Check size={14} />
                  </button>
                  <button onClick={cancelEdit} className="p-1 text-gray-400 hover:bg-gray-200 rounded">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-sm text-gray-700 truncate">{item}</span>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => onMove(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30"
                      title="Monter"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => onMove(index, 'down')}
                      disabled={index === items.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30"
                      title="Descendre"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      onClick={() => startEdit(item)}
                      className="p-1 text-gray-400 hover:text-primary-500 hover:bg-gray-200 rounded"
                      title="Modifier"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onRemove(item)}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                      title="Supprimer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {items.length === 0 && (
            <span className="text-xs text-gray-400 italic">Aucun élément</span>
          )}
        </div>
      </div>
    </div>
  );
}

interface SubspeciesCardProps {
  species: string[];
  subspeciesBySpecies: Record<string, string[]>;
  onAdd: (species: string, subspecies: string) => void;
  onRemove: (species: string, subspecies: string) => void;
}

function SubspeciesCard({ species, subspeciesBySpecies, onAdd, onRemove }: SubspeciesCardProps) {
  const [selectedSpecies, setSelectedSpecies] = useState(species[0] || '');
  const [newItem, setNewItem] = useState('');

  const currentSubspecies = subspeciesBySpecies[selectedSpecies] || [];

  const handleAdd = () => {
    const item = newItem.trim();
    if (item && selectedSpecies) {
      onAdd(selectedSpecies, item);
      setNewItem('');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
        <span className="text-primary-500"><Users size={18} /></span>
        <h3 className="font-semibold text-gray-800">Sous-Espèces</h3>
      </div>
      <div className="p-3 space-y-3">
        <select
          value={selectedSpecies}
          onChange={(e) => setSelectedSpecies(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
        >
          {species.map(sp => (
            <option key={sp} value={sp}>{sp}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={`Sous-espèce pour ${selectedSpecies}...`}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
          <button
            onClick={handleAdd}
            disabled={!newItem.trim() || !selectedSpecies}
            className="px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
          {currentSubspecies.map(item => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm group hover:bg-gray-200 transition"
            >
              {item}
              <button
                onClick={() => onRemove(selectedSpecies, item)}
                className="text-gray-400 hover:text-red-500 ml-0.5"
              >
                <X size={14} />
              </button>
            </span>
          ))}
          {currentSubspecies.length === 0 && (
            <span className="text-xs text-gray-400 italic">Aucune sous-espèce pour {selectedSpecies}</span>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatusCardProps {
  statuses: StatusPreset[];
  onAdd: (status: StatusPreset) => void;
  onRemove: (value: string) => void;
  onUpdate: (value: string, updates: Partial<StatusPreset>) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
}

function StatusCard({ statuses, onAdd, onRemove, onUpdate, onMove }: StatusCardProps) {
  const [newStatus, setNewStatus] = useState<StatusPreset>({ value: '', label: '', color: 'bg-gray-400' });
  const [editingValue, setEditingValue] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  const handleAdd = () => {
    if (newStatus.value.trim() && newStatus.label.trim()) {
      onAdd(newStatus);
      setNewStatus({ value: '', label: '', color: 'bg-gray-400' });
    }
  };

  const startEdit = (status: StatusPreset) => {
    setEditingValue(status.value);
    setEditLabel(status.label);
  };

  const saveEdit = () => {
    if (editingValue && editLabel.trim()) {
      onUpdate(editingValue, { label: editLabel.trim() });
    }
    setEditingValue(null);
    setEditLabel('');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden col-span-1 sm:col-span-2">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
        <span className="text-primary-500"><CheckCircle size={18} /></span>
        <h3 className="font-semibold text-gray-800">Statuts</h3>
        <span className="ml-auto text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
          {statuses.length}
        </span>
      </div>
      <div className="p-3 space-y-3">
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            value={newStatus.value}
            onChange={(e) => setNewStatus(prev => ({ ...prev, value: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
            placeholder="Identifiant (ex: primed)"
            className="flex-1 min-w-[100px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
          <input
            type="text"
            value={newStatus.label}
            onChange={(e) => setNewStatus(prev => ({ ...prev, label: e.target.value }))}
            placeholder="Libellé (ex: Sous-couchée)"
            className="flex-1 min-w-[100px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
          <button
            onClick={handleAdd}
            disabled={!newStatus.value.trim() || !newStatus.label.trim()}
            className="px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {COLOR_OPTIONS.map(color => (
            <button
              key={color}
              onClick={() => setNewStatus(prev => ({ ...prev, color }))}
              className={`w-5 h-5 rounded-full ${color} ${
                newStatus.color === color ? 'ring-2 ring-offset-1 ring-primary-500' : ''
              }`}
            />
          ))}
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {statuses.map((status, index) => (
            <div
              key={status.value}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg group hover:bg-gray-100 transition"
            >
              <div className={`w-4 h-4 rounded-full ${status.color} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                {editingValue === status.value ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') setEditingValue(null);
                      }}
                      autoFocus
                      className="flex-1 px-2 py-0.5 text-sm border border-primary-300 rounded focus:ring-1 focus:ring-primary-500 outline-none"
                    />
                    <button onClick={saveEdit} className="p-1 text-green-600 hover:bg-green-50 rounded">
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="font-medium text-sm truncate">{status.label}</div>
                    <div className="text-xs text-gray-500">{status.value}</div>
                  </>
                )}
              </div>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                <button
                  onClick={() => onMove(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30"
                  title="Monter"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => onMove(index, 'down')}
                  disabled={index === statuses.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30"
                  title="Descendre"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  onClick={() => startEdit(status)}
                  className="p-1 text-gray-400 hover:text-primary-500 hover:bg-gray-200 rounded"
                  title="Modifier"
                >
                  <Edit2 size={14} />
                </button>
              </div>
              <div className="flex gap-0.5 flex-shrink-0">
                {COLOR_OPTIONS.slice(0, 6).map(color => (
                  <button
                    key={color}
                    onClick={() => onUpdate(status.value, { color })}
                    className={`w-3 h-3 rounded-full ${color} ${
                      status.color === color ? 'ring-1 ring-offset-1 ring-gray-400' : ''
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => onRemove(status.value)}
                className="p-1 text-red-500 hover:bg-red-50 rounded transition flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PresetManager({ onClose }: PresetManagerProps) {
  const {
    presets,
    addCategory, removeCategory,
    addBrand, removeBrand,
    addUniverse, removeUniverse,
    addSpecies, removeSpecies,
    addSubspecies, removeSubspecies,
    addSize, removeSize,
    addAlignment, removeAlignment,
    addHabitat, removeHabitat,
    addStatus, removeStatus, updateStatus,
    resetPresets,
    editPresetItem,
    movePresetItem,
    moveStatus,
    sortPresetAlpha,
  } = usePresets();

  const handleReset = () => {
    if (window.confirm('Réinitialiser tous les presets aux valeurs par défaut ?')) {
      resetPresets();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-100 w-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
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

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PresetCard
              title="Catégories"
              icon={<Tag size={18} />}
              items={presets.categories}
              field="categories"
              onAdd={addCategory}
              onRemove={removeCategory}
              onEdit={(oldVal, newVal) => editPresetItem('categories', oldVal, newVal)}
              onMove={(idx, dir) => movePresetItem('categories', idx, dir)}
              onSortAlpha={() => sortPresetAlpha('categories')}
              placeholder="Nouvelle catégorie..."
            />
            <PresetCard
              title="Marques"
              icon={<Package size={18} />}
              items={presets.brands}
              field="brands"
              onAdd={addBrand}
              onRemove={removeBrand}
              onEdit={(oldVal, newVal) => editPresetItem('brands', oldVal, newVal)}
              onMove={(idx, dir) => movePresetItem('brands', idx, dir)}
              onSortAlpha={() => sortPresetAlpha('brands')}
              placeholder="Nouvelle marque..."
            />
            <PresetCard
              title="Univers"
              icon={<Globe size={18} />}
              items={presets.universes}
              field="universes"
              onAdd={addUniverse}
              onRemove={removeUniverse}
              onEdit={(oldVal, newVal) => editPresetItem('universes', oldVal, newVal)}
              onMove={(idx, dir) => movePresetItem('universes', idx, dir)}
              onSortAlpha={() => sortPresetAlpha('universes')}
              placeholder="Nouvel univers..."
            />
            <PresetCard
              title="Espèces"
              icon={<Users size={18} />}
              items={presets.species}
              field="species"
              onAdd={addSpecies}
              onRemove={removeSpecies}
              onEdit={(oldVal, newVal) => editPresetItem('species', oldVal, newVal)}
              onMove={(idx, dir) => movePresetItem('species', idx, dir)}
              onSortAlpha={() => sortPresetAlpha('species')}
              placeholder="Nouvelle espèce..."
            />
            <SubspeciesCard
              species={presets.species}
              subspeciesBySpecies={presets.subspeciesBySpecies}
              onAdd={addSubspecies}
              onRemove={removeSubspecies}
            />
            <PresetCard
              title="Tailles"
              icon={<Ruler size={18} />}
              items={presets.sizes}
              field="sizes"
              onAdd={addSize}
              onRemove={removeSize}
              onEdit={(oldVal, newVal) => editPresetItem('sizes', oldVal, newVal)}
              onMove={(idx, dir) => movePresetItem('sizes', idx, dir)}
              onSortAlpha={() => sortPresetAlpha('sizes')}
              placeholder="Nouvelle taille..."
            />
            <PresetCard
              title="Alignements"
              icon={<Compass size={18} />}
              items={presets.alignments}
              field="alignments"
              onAdd={addAlignment}
              onRemove={removeAlignment}
              onEdit={(oldVal, newVal) => editPresetItem('alignments', oldVal, newVal)}
              onMove={(idx, dir) => movePresetItem('alignments', idx, dir)}
              onSortAlpha={() => sortPresetAlpha('alignments')}
              placeholder="Nouvel alignement..."
            />
            <PresetCard
              title="Habitats"
              icon={<MapPin size={18} />}
              items={presets.habitats}
              field="habitats"
              onAdd={addHabitat}
              onRemove={removeHabitat}
              onEdit={(oldVal, newVal) => editPresetItem('habitats', oldVal, newVal)}
              onMove={(idx, dir) => movePresetItem('habitats', idx, dir)}
              onSortAlpha={() => sortPresetAlpha('habitats')}
              placeholder="Nouvel habitat..."
            />
            <StatusCard
              statuses={presets.statuses}
              onAdd={addStatus}
              onRemove={removeStatus}
              onUpdate={updateStatus}
              onMove={moveStatus}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-white">
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
