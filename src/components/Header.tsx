import { Plus, Menu, X, Settings, FileSpreadsheet, PlusSquare } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  onAddClick: () => void;
  onMultiAddClick?: () => void;
  onSettingsClick: () => void;
  onImportExportClick: () => void;
}

export function Header({ onAddClick, onMultiAddClick, onSettingsClick, onImportExportClick }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="bg-primary-600 text-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🎨</span>
            <h1 className="text-xl font-bold">Minilist</h1>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg transition ${
                location.pathname === '/' ? 'bg-primary-700' : 'hover:bg-primary-500'
              }`}
            >
              Collection
            </Link>
            <Link
              to="/stats"
              className={`px-3 py-2 rounded-lg transition ${
                location.pathname === '/stats' ? 'bg-primary-700' : 'hover:bg-primary-500'
              }`}
            >
              Statistiques
            </Link>
            <button
              onClick={onImportExportClick}
              className="p-2 hover:bg-primary-500 rounded-lg transition"
              title="Import / Export"
            >
              <FileSpreadsheet size={20} />
            </button>
            <button
              onClick={onSettingsClick}
              className="p-2 hover:bg-primary-500 rounded-lg transition"
              title="Gérer les presets"
            >
              <Settings size={20} />
            </button>
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={onAddClick}
                className="flex items-center gap-2 bg-white text-primary-600 px-4 py-2 rounded-l-lg font-medium hover:bg-primary-50 transition"
              >
                <Plus size={20} />
                Ajouter
              </button>
              {onMultiAddClick && (
                <button
                  onClick={onMultiAddClick}
                  className="flex items-center gap-1 bg-white/90 text-primary-600 px-3 py-2 rounded-r-lg font-medium hover:bg-primary-50 transition border-l border-primary-200"
                  title="Ajouts multiples"
                >
                  <PlusSquare size={20} />
                </button>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={onImportExportClick}
              className="p-2 hover:bg-primary-500 rounded-lg"
              title="Import / Export"
            >
              <FileSpreadsheet size={22} />
            </button>
            <button
              onClick={onSettingsClick}
              className="p-2 hover:bg-primary-500 rounded-lg"
              title="Paramètres"
            >
              <Settings size={22} />
            </button>
            <div className="flex items-center">
              <button
                onClick={onAddClick}
                className="p-2 bg-white text-primary-600 rounded-l-lg"
                title="Ajouter"
              >
                <Plus size={24} />
              </button>
              {onMultiAddClick && (
                <button
                  onClick={onMultiAddClick}
                  className="p-2 bg-white/90 text-primary-600 rounded-r-lg border-l border-primary-200"
                  title="Ajouts multiples"
                >
                  <PlusSquare size={22} />
                </button>
              )}
            </div>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-primary-500 rounded-lg"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="md:hidden py-4 border-t border-primary-500">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 rounded-lg hover:bg-primary-500"
            >
              Collection
            </Link>
            <Link
              to="/stats"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 rounded-lg hover:bg-primary-500"
            >
              Statistiques
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
