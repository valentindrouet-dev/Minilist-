import { useState, useRef } from 'react';
import { X, Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle, FileDown } from 'lucide-react';
import { useFigurines } from '../context/FigurineContext';
import { generateCSVTemplate, exportToCSV, parseCSV, downloadFile, importFigurinesFromCSV } from '../services/csvService';

interface ImportExportModalProps {
  onClose: () => void;
}

type Tab = 'import' | 'export';

export function ImportExportModal({ onClose }: ImportExportModalProps) {
  const { figurines, addFigurine, refreshFigurines } = useFigurines();
  const [activeTab, setActiveTab] = useState<Tab>('import');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(null);
  const [previewData, setPreviewData] = useState<{ name: string; brand: string; category: string }[] | null>(null);
  const [csvContent, setCsvContent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate();
    downloadFile(template, 'minilist-template.csv');
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(figurines);
    const date = new Date().toISOString().split('T')[0];
    downloadFile(csv, `minilist-export-${date}.csv`);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      setCsvContent(content);

      // Parse and show preview
      const parsed = parseCSV(content);
      setPreviewData(parsed.slice(0, 5).map(f => ({
        name: f.name,
        brand: f.brand,
        category: f.category,
      })));
      setImportResult(null);
    } catch (error) {
      setPreviewData(null);
      setImportResult({
        success: 0,
        errors: [error instanceof Error ? error.message : 'Erreur lors de la lecture du fichier'],
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (!csvContent) return;

    setImporting(true);
    try {
      const result = await importFigurinesFromCSV(csvContent, addFigurine);
      setImportResult(result);
      setPreviewData(null);
      setCsvContent(null);

      if (result.success > 0) {
        await refreshFigurines();
      }
    } catch (error) {
      setImportResult({
        success: 0,
        errors: [error instanceof Error ? error.message : 'Erreur lors de l\'import'],
      });
    } finally {
      setImporting(false);
    }
  };

  const handleCancelPreview = () => {
    setPreviewData(null);
    setCsvContent(null);
    setImportResult(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-primary-500" />
            <h2 className="text-lg font-semibold">Import / Export</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition border-b-2 ${
              activeTab === 'import'
                ? 'border-primary-500 text-primary-600 bg-primary-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Upload size={18} />
            Importer
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition border-b-2 ${
              activeTab === 'export'
                ? 'border-primary-500 text-primary-600 bg-primary-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Download size={18} />
            Exporter
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'import' ? (
            <div className="space-y-4">
              {/* Download template */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="font-medium text-blue-800 mb-2">1. Télécharger le template</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Téléchargez le fichier CSV type, remplissez-le avec vos figurines, puis importez-le.
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  <FileDown size={18} />
                  Télécharger le template CSV
                </button>
              </div>

              {/* Column info */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <h3 className="font-medium text-gray-800 mb-2">Colonnes du fichier</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>name</strong> (requis) : Nom de la figurine</p>
                  <p><strong>brand</strong> : Marque (Games Workshop, Reaper...)</p>
                  <p><strong>category</strong> : Catégorie (Héros, Infanterie...)</p>
                  <p><strong>subcategory</strong> : Sous-catégorie (Humain, Elfe...)</p>
                  <p><strong>universe</strong> : Univers (D&D, Warhammer 40K...)</p>
                  <p><strong>status</strong> : unpainted, primed, wip, painted, based</p>
                  <p><strong>scale</strong> : Échelle (28mm, 32mm...)</p>
                  <p><strong>tags</strong> : Tags séparés par des point-virgules</p>
                  <p><strong>notes</strong> : Notes additionnelles</p>
                  <p><strong>image_url</strong> : URL de l'image (optionnel)</p>
                </div>
              </div>

              {/* File upload */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <h3 className="font-medium text-green-800 mb-2">2. Importer votre fichier</h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                >
                  <Upload size={18} />
                  Sélectionner un fichier CSV
                </button>
              </div>

              {/* Preview */}
              {previewData && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <h3 className="font-medium text-yellow-800 mb-2">Aperçu ({previewData.length} premières figurines)</h3>
                  <div className="space-y-2 mb-4">
                    {previewData.map((item, index) => (
                      <div key={index} className="text-sm text-yellow-700 bg-yellow-100 px-3 py-2 rounded-lg">
                        <strong>{item.name}</strong>
                        {item.brand && <span> • {item.brand}</span>}
                        {item.category && <span> • {item.category}</span>}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleImport}
                      disabled={importing}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                    >
                      {importing ? 'Import en cours...' : 'Confirmer l\'import'}
                    </button>
                    <button
                      onClick={handleCancelPreview}
                      disabled={importing}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Result */}
              {importResult && (
                <div className={`p-4 rounded-xl ${
                  importResult.success > 0 && importResult.errors.length === 0
                    ? 'bg-green-50 border border-green-200'
                    : importResult.errors.length > 0
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  {importResult.success > 0 && (
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <CheckCircle size={18} />
                      <span className="font-medium">{importResult.success} figurine(s) importée(s) avec succès</span>
                    </div>
                  )}
                  {importResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle size={18} />
                        <span className="font-medium">{importResult.errors.length} erreur(s)</span>
                      </div>
                      <ul className="text-sm text-red-600 list-disc list-inside">
                        {importResult.errors.slice(0, 5).map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                        {importResult.errors.length > 5 && (
                          <li>... et {importResult.errors.length - 5} autres erreurs</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Export info */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <h3 className="font-medium text-gray-800 mb-2">Exporter votre collection</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Exportez toutes vos figurines dans un fichier CSV compatible avec Excel et Google Sheets.
                </p>
                <div className="text-sm text-gray-500">
                  <strong>{figurines.length}</strong> figurine(s) à exporter
                </div>
              </div>

              {/* Export button */}
              <button
                onClick={handleExportCSV}
                disabled={figurines.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={20} />
                Exporter en CSV
              </button>

              {figurines.length === 0 && (
                <p className="text-sm text-gray-500 text-center">
                  Ajoutez des figurines pour pouvoir exporter
                </p>
              )}

              {/* Tips */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="font-medium text-blue-800 mb-2">Conseils</h3>
                <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                  <li>Le fichier CSV s'ouvre directement dans Excel</li>
                  <li>Pour Google Sheets : Fichier → Importer → Télécharger</li>
                  <li>Vous pouvez modifier le fichier et le ré-importer</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
