import { useState, useCallback } from 'react';
import { useFigurines } from '../context/FigurineContext';

interface UseImageDropOptions {
  figurineId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useImageDrop({ figurineId, onSuccess, onError }: UseImageDropOptions) {
  const { uploadImage, updateFigurine } = useFigurines();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if files are being dragged
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only set to false if we're leaving the actual element
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (!imageFile) {
      onError?.('Veuillez déposer un fichier image (JPG, PNG, GIF, etc.)');
      return;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (imageFile.size > maxSize) {
      onError?.('L\'image est trop volumineuse (max 5 Mo)');
      return;
    }

    try {
      setIsUploading(true);
      const imageUrl = await uploadImage(imageFile);
      await updateFigurine(figurineId, {
        image_url: imageUrl,
        is_own_image: true
      });
      onSuccess?.();
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  }, [figurineId, uploadImage, updateFigurine, onSuccess, onError]);

  return {
    isDragging,
    isUploading,
    dragProps: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}
