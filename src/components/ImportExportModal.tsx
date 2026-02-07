import { useState, useRef, useEffect } from 'react';
import { X, Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle, FileDown, Cloud, Loader2, Image, Database, ArrowRight } from 'lucide-react';
import { useFigurines } from '../context/FigurineContext';
import { generateCSVTemplate, exportToCSV, parseCSV, downloadFile, importFigurinesFromCSV } from '../services/csvService';
import { uploadToImgBB, isBase64Image } from '../services/imgurService';
import { isSupabaseConfigured, figurineService } from '../services/supabase';

interface ImportExportModalProps {
  onClose: () => void;
}

type Tab = 'import' | 'export' | 'images' | 'cloud';

interface ImageStats {
  base64Count: number;
  urlCount: number;
  noImageCount: number;
  estimatedSizeMB: number;
}

export function ImportExportModal({ onClose }: ImportExportModalProps) {
  const { figurines, addFigurine, updateFigurine, refreshFigurines } = useFigurines();
  const [activeTab, setActiveTab] = useState<Tab>('import');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(null);
  const [previewData, setPreviewData] = useState<{ name: string; brand: string; category: string }[] | null>(null);
  const [csvContent, setCsvContent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image migration state
  const [imageStats, setImageStats] = useState<ImageStats | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
  const [migrationErrors, setMigrationErrors] = useState<string[]>([]);
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [currentMigrating, setCurrentMigrating] = useState('');

  // Cloud/Supabase migration state
  const [localDataCount, setLocalDataCount] = useState(0);
  const [cloudMigrating, setCloudMigrating] = useState(false);
  const [cloudMigrationProgress, setCloudMigrationProgress] = useState({ current: 0, total: 0 });
  const [cloudMigrationResult, setCloudMigrationResult] = useState<{ success: number; errors: string[] } | null>(null);
  const supabaseReady = isSupabaseConfigured();

  // Check local data count
  useEffect(() => {
    setLocalDataCount(figurineService.getLocalCount());
  }, []);

  // Calculate image stats
  useEffect(() => {
    const base64Figurines = figurines.filter(f => isBase64Image(f.image_url));
    const urlFigurines = figurines.filter(f => f.image_url && !isBase64Image(f.image_url));
    const noImageFigurines = figurines.filter(f => !f.image_url);

    const totalBase64Size = base64Figurines.reduce((acc, f) => {
      if (f.image_url) {
        return acc + (f.image_url.length * 0.75);
      }
      return acc;
    }, 0);

    setImageStats({
      base64Count: base64Figurines.length,
      urlCount: urlFigurines.length,
      noImageCount: noImageFigurines.length,
      estimatedSizeMB: totalBase64Size / (1024 * 1024),
    });
  }, [figurines]);

  const startMigration = async () => {
    const base64Figurines = figurines.filter(f => isBase64Image(f.image_url));
    if (base64Figurines.length === 0) return;

    setMigrating(true);
    setMigrationProgress({ current: 0, total: base64Figurines.length, success: 0, failed: 0 });
    setMigrationErrors([]);
    setMigrationComplete(false);

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < base64Figurines.length; i++) {
      const figurine = base64Figurines[i];
      setCurrentMigrating(figurine.name);
      setMigrationProgress(prev => ({ ...prev, current: i + 1 }));

      try {
        const imgurUrl = await uploadToImgBB(figurine.image_url!);
        await updateFigurine(figurine.id, { image_url: imgurUrl });
        successCount++;
        setMigrationProgress(prev => ({ ...prev, success: successCount }));
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        failedCount++;
        const errorMsg = `${figurine.name}: ${error instanceof Error ? error.message : 'Erreur'}`;
        setMigrationErrors(prev => [...prev, errorMsg]);
        setMigrationProgress(prev => ({ ...prev, failed: failedCount }));
      }
    }

    setMigrating(false);
    setMigrationComplete(true);
    setCurrentMigrating('');
  };

  const startCloudMigration = async () => {
    if (!supabaseReady) return;

    setCloudMigrating(true);
    setCloudMigrationResult(null);

    try {
      const result = await figurineService.migrateToSupabase((current, total) => {
        setCloudMigrationProgress({ current, total });
      });

      setCloudMigrationResult(result);

      if (result.success > 0 && result.errors.length === 0) {
        // Clear local data only if fully successful
        figurineService.clearLocalData();
        setLocalDataCount(0);
        // Refresh the app data
        await refreshFigurines();
      }
    } catch (error) {
      setCloudMigrationResult({
        success: 0,
        errors: [error instanceof Error ? error.message : 'Erreur de migration'],
      });
    } finally {
      setCloudMigrating(false);
    }
  };

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
          <button
            onClick={() => setActiveTab('images')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition border-b-2 relative ${
              activeTab === 'images'
                ? 'border-primary-500 text-primary-600 bg-primary-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Cloud size={18} />
            Images
            {imageStats && imageStats.base64Count > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {imageStats.base64Count > 99 ? '99+' : imageStats.base64Count}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition border-b-2 relative ${
              activeTab === 'cloud'
                ? 'border-primary-500 text-primary-600 bg-primary-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Database size={18} />
            Cloud
            {supabaseReady && localDataCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                !
              </span>
            )}
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

          {activeTab === 'images' && (
            <div className="space-y-4">
              {/* Explanation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-medium mb-1">Pourquoi migrer les images ?</p>
                <p>Les images stockées localement (base64) occupent beaucoup d'espace (~5-10 Mo max). En les migrant vers ImgBB (gratuit), vous libérez de l'espace et évitez les erreurs.</p>
              </div>

              {/* Stats */}
              {imageStats && !migrating && !migrationComplete && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">État actuel du stockage</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-orange-700">
                        <Image size={18} />
                        <span className="font-bold text-lg">{imageStats.base64Count}</span>
                      </div>
                      <p className="text-xs text-orange-600 mt-1">Images locales (base64)</p>
                      <p className="text-xs text-orange-500 font-medium">~{imageStats.estimatedSizeMB.toFixed(1)} Mo utilisés</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-700">
                        <Cloud size={18} />
                        <span className="font-bold text-lg">{imageStats.urlCount}</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">Images externes (URL)</p>
                      <p className="text-xs text-green-500">Aucun espace utilisé</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {imageStats.noImageCount} figurines sans image
                  </p>

                  {imageStats.base64Count === 0 ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                      <p className="text-green-700 font-medium">Aucune image à migrer !</p>
                      <p className="text-sm text-green-600">Toutes vos images sont déjà hébergées en externe.</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                        <p className="font-medium">Avant de commencer :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Les images seront uploadées sur ImgBB (service gratuit)</li>
                          <li>La migration peut prendre plusieurs minutes</li>
                          <li>Ne fermez pas cette fenêtre pendant le processus</li>
                        </ul>
                      </div>
                      <button
                        onClick={startMigration}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium"
                      >
                        <Cloud size={20} />
                        Migrer {imageStats.base64Count} images vers ImgBB
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Progress */}
              {migrating && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin text-primary-500" size={24} />
                    <div>
                      <p className="font-medium">Migration en cours...</p>
                      <p className="text-sm text-gray-500">Ne fermez pas cette fenêtre</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progression</span>
                      <span>{migrationProgress.current} / {migrationProgress.total}</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 transition-all duration-300"
                        style={{ width: `${(migrationProgress.current / migrationProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>

                  {currentMigrating && (
                    <p className="text-sm text-gray-500 truncate">
                      Upload: <span className="font-medium">{currentMigrating}</span>
                    </p>
                  )}

                  <div className="flex gap-4 text-sm">
                    <span className="text-green-600">
                      <CheckCircle size={16} className="inline mr-1" />
                      {migrationProgress.success} réussies
                    </span>
                    {migrationProgress.failed > 0 && (
                      <span className="text-red-600">
                        <AlertCircle size={16} className="inline mr-1" />
                        {migrationProgress.failed} échouées
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Completed */}
              {migrationComplete && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle className="mx-auto text-green-500 mb-2" size={40} />
                    <p className="text-green-700 font-medium text-lg">Migration terminée !</p>
                    <p className="text-sm text-green-600 mt-1">
                      {migrationProgress.success} images migrées avec succès
                    </p>
                    {imageStats && (
                      <p className="text-sm text-green-500 mt-2">
                        ~{imageStats.estimatedSizeMB.toFixed(1)} Mo libérés
                      </p>
                    )}
                  </div>

                  {migrationErrors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="font-medium text-red-700 mb-2">
                        <AlertCircle size={16} className="inline mr-1" />
                        {migrationErrors.length} erreurs
                      </p>
                      <div className="max-h-24 overflow-y-auto text-xs text-red-600 space-y-1">
                        {migrationErrors.slice(0, 5).map((error, i) => (
                          <p key={i}>{error}</p>
                        ))}
                        {migrationErrors.length > 5 && (
                          <p>... et {migrationErrors.length - 5} autres erreurs</p>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setMigrationComplete(false);
                      setMigrationErrors([]);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                  >
                    Retour
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'cloud' && (
            <div className="space-y-4">
              {!supabaseReady ? (
                <>
                  {/* Supabase not configured */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                      <Database size={18} />
                      Stockage Cloud avec Supabase
                    </h3>
                    <p className="text-sm text-blue-700 mb-3">
                      Actuellement, vos données sont stockées localement (limite ~5-10 Mo).
                      Avec Supabase, bénéficiez d'un stockage cloud illimité et synchronisé entre tous vos appareils.
                    </p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-3">Configuration requise</h3>
                    <ol className="text-sm text-gray-600 space-y-3 list-decimal list-inside">
                      <li>
                        <span className="font-medium">Créer un compte Supabase</span>
                        <br />
                        <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline ml-5">
                          → supabase.com
                        </a>
                      </li>
                      <li>
                        <span className="font-medium">Créer un nouveau projet</span>
                      </li>
                      <li>
                        <span className="font-medium">Exécuter le script SQL</span>
                        <br />
                        <span className="text-xs text-gray-500 ml-5">Dashboard → SQL Editor → Coller le script</span>
                      </li>
                      <li>
                        <span className="font-medium">Configurer Vercel</span>
                        <br />
                        <span className="text-xs text-gray-500 ml-5">Ajouter les variables d'environnement</span>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                    <p className="font-medium text-yellow-800 mb-1">Variables requises sur Vercel :</p>
                    <code className="block bg-yellow-100 p-2 rounded text-xs text-yellow-900 mt-2">
                      VITE_SUPABASE_URL=https://xxx.supabase.co<br />
                      VITE_SUPABASE_ANON_KEY=eyJhbG...
                    </code>
                  </div>
                </>
              ) : (
                <>
                  {/* Supabase is configured */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                      <CheckCircle size={18} />
                      Supabase configuré !
                    </h3>
                    <p className="text-sm text-green-700">
                      Votre application utilise le stockage cloud Supabase.
                      Vos données sont synchronisées entre tous vos appareils.
                    </p>
                  </div>

                  {localDataCount > 0 && !cloudMigrating && !cloudMigrationResult && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h3 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                        <AlertCircle size={18} />
                        Données locales détectées
                      </h3>
                      <p className="text-sm text-orange-700 mb-3">
                        {localDataCount} figurine(s) sont encore stockées localement.
                        Migrez-les vers Supabase pour y accéder depuis tous vos appareils.
                      </p>
                      <button
                        onClick={startCloudMigration}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
                      >
                        <ArrowRight size={18} />
                        Migrer {localDataCount} figurines vers Supabase
                      </button>
                    </div>
                  )}

                  {cloudMigrating && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="animate-spin text-primary-500" size={24} />
                        <div>
                          <p className="font-medium">Migration vers Supabase...</p>
                          <p className="text-sm text-gray-500">Cela peut prendre quelques instants</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progression</span>
                          <span>{cloudMigrationProgress.current} / {cloudMigrationProgress.total}</span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 transition-all duration-300"
                            style={{ width: cloudMigrationProgress.total > 0 ? `${(cloudMigrationProgress.current / cloudMigrationProgress.total) * 100}%` : '0%' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {cloudMigrationResult && (
                    <div className="space-y-4">
                      {cloudMigrationResult.success > 0 && cloudMigrationResult.errors.length === 0 ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                          <CheckCircle className="mx-auto text-green-500 mb-2" size={40} />
                          <p className="text-green-700 font-medium text-lg">Migration réussie !</p>
                          <p className="text-sm text-green-600 mt-1">
                            {cloudMigrationResult.success} figurines migrées vers Supabase
                          </p>
                        </div>
                      ) : (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="font-medium text-red-700 mb-2">
                            <AlertCircle size={16} className="inline mr-1" />
                            Erreurs lors de la migration
                          </p>
                          <div className="text-sm text-red-600 space-y-1">
                            {cloudMigrationResult.errors.map((error, i) => (
                              <p key={i}>{error}</p>
                            ))}
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => setCloudMigrationResult(null)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                      >
                        Retour
                      </button>
                    </div>
                  )}

                  {localDataCount === 0 && !cloudMigrating && !cloudMigrationResult && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                      <Database className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-gray-600">Toutes vos données sont dans le cloud.</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {figurines.length} figurine(s) synchronisées
                      </p>
                    </div>
                  )}
                </>
              )}
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
