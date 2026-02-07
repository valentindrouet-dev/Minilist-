import { useState, useEffect } from 'react';
import { X, Upload, CheckCircle, AlertCircle, Loader2, Image, Cloud } from 'lucide-react';
import { useFigurines } from '../context/FigurineContext';
import { uploadToImgBB, isBase64Image } from '../services/imgurService';

interface ImageMigrationModalProps {
  onClose: () => void;
}

interface MigrationStats {
  total: number;
  base64Count: number;
  urlCount: number;
  noImageCount: number;
  estimatedSizeMB: number;
}

export function ImageMigrationModal({ onClose }: ImageMigrationModalProps) {
  const { figurines, updateFigurine } = useFigurines();
  const [stats, setStats] = useState<MigrationStats | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
  const [currentFigurine, setCurrentFigurine] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  // Calculate stats on mount
  useEffect(() => {
    const base64Figurines = figurines.filter(f => isBase64Image(f.image_url));
    const urlFigurines = figurines.filter(f => f.image_url && !isBase64Image(f.image_url));
    const noImageFigurines = figurines.filter(f => !f.image_url);

    // Estimate base64 size (rough calculation)
    const totalBase64Size = base64Figurines.reduce((acc, f) => {
      if (f.image_url) {
        // Base64 strings are about 33% larger than binary, so divide by 1.33
        // Then convert from characters to bytes (1 char = 1 byte for base64)
        return acc + (f.image_url.length * 0.75);
      }
      return acc;
    }, 0);

    setStats({
      total: figurines.length,
      base64Count: base64Figurines.length,
      urlCount: urlFigurines.length,
      noImageCount: noImageFigurines.length,
      estimatedSizeMB: totalBase64Size / (1024 * 1024),
    });
  }, [figurines]);

  const startMigration = async () => {
    const base64Figurines = figurines.filter(f => isBase64Image(f.image_url));

    if (base64Figurines.length === 0) {
      return;
    }

    setMigrating(true);
    setProgress({ current: 0, total: base64Figurines.length, success: 0, failed: 0 });
    setErrors([]);

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < base64Figurines.length; i++) {
      const figurine = base64Figurines[i];
      setCurrentFigurine(figurine.name);
      setProgress(prev => ({ ...prev, current: i + 1 }));

      try {
        // Upload to Imgur
        const imgurUrl = await uploadToImgBB(figurine.image_url!);

        // Update figurine with new URL
        await updateFigurine(figurine.id, { image_url: imgurUrl });

        successCount++;
        setProgress(prev => ({ ...prev, success: successCount }));

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        failedCount++;
        const errorMsg = `${figurine.name}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
        setErrors(prev => [...prev, errorMsg]);
        setProgress(prev => ({ ...prev, failed: failedCount }));
      }
    }

    setMigrating(false);
    setCompleted(true);
    setCurrentFigurine('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Cloud size={20} className="text-primary-500" />
            Migration des images
          </h2>
          <button
            onClick={onClose}
            disabled={migrating}
            className="p-2 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-medium mb-1">Pourquoi migrer ?</p>
            <p>Les images stockées localement (base64) occupent beaucoup d'espace. En les migrant vers Imgur, vous libérez de l'espace et évitez les erreurs de stockage.</p>
          </div>

          {/* Stats */}
          {stats && !migrating && !completed && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">État actuel</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-orange-700">
                    <Image size={18} />
                    <span className="font-medium">{stats.base64Count}</span>
                  </div>
                  <p className="text-xs text-orange-600 mt-1">Images locales (base64)</p>
                  <p className="text-xs text-orange-500">~{stats.estimatedSizeMB.toFixed(1)} Mo</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-700">
                    <Cloud size={18} />
                    <span className="font-medium">{stats.urlCount}</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">Images externes (URL)</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                {stats.noImageCount} figurines sans image
              </p>

              {stats.base64Count === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                  <p className="text-green-700 font-medium">Aucune image à migrer !</p>
                  <p className="text-sm text-green-600">Toutes vos images sont déjà hébergées en externe.</p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                  <p className="font-medium">Note importante :</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Les images seront uploadées sur Imgur (service gratuit)</li>
                    <li>La migration peut prendre plusieurs minutes</li>
                    <li>Ne fermez pas cette fenêtre pendant le processus</li>
                  </ul>
                </div>
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
                  <span>{progress.current} / {progress.total}</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>

              {currentFigurine && (
                <p className="text-sm text-gray-500">
                  Upload: <span className="font-medium">{currentFigurine}</span>
                </p>
              )}

              <div className="flex gap-4 text-sm">
                <span className="text-green-600">
                  <CheckCircle size={16} className="inline mr-1" />
                  {progress.success} réussies
                </span>
                {progress.failed > 0 && (
                  <span className="text-red-600">
                    <AlertCircle size={16} className="inline mr-1" />
                    {progress.failed} échouées
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Completed */}
          {completed && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="mx-auto text-green-500 mb-2" size={40} />
                <p className="text-green-700 font-medium text-lg">Migration terminée !</p>
                <p className="text-sm text-green-600 mt-1">
                  {progress.success} images migrées avec succès
                </p>
              </div>

              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="font-medium text-red-700 mb-2">
                    <AlertCircle size={16} className="inline mr-1" />
                    {errors.length} erreurs
                  </p>
                  <div className="max-h-32 overflow-y-auto text-xs text-red-600 space-y-1">
                    {errors.map((error, i) => (
                      <p key={i}>{error}</p>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-500 text-center">
                Vous avez libéré environ {stats?.estimatedSizeMB.toFixed(1)} Mo d'espace local.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex gap-3">
          {!migrating && !completed && stats && stats.base64Count > 0 && (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition"
              >
                Annuler
              </button>
              <button
                onClick={startMigration}
                className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition flex items-center justify-center gap-2"
              >
                <Upload size={18} />
                Migrer {stats.base64Count} images
              </button>
            </>
          )}
          {(completed || (stats && stats.base64Count === 0)) && (
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition"
            >
              Fermer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
