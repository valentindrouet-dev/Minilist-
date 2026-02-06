/**
 * Robust image compression service
 * Compresses images to fit within localStorage limits
 */

const MAX_WIDTH = 600;
const MAX_HEIGHT = 600;
const JPEG_QUALITY = 0.7;
const MAX_FILE_SIZE = 100 * 1024; // 100KB target

export async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Use white background for transparency
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Try to get a reasonably sized output
          let quality = JPEG_QUALITY;
          let result = canvas.toDataURL('image/jpeg', quality);

          // If still too large, reduce quality progressively
          while (result.length > MAX_FILE_SIZE * 1.37 && quality > 0.3) {
            quality -= 0.1;
            result = canvas.toDataURL('image/jpeg', quality);
          }

          // If still too large, reduce dimensions
          if (result.length > MAX_FILE_SIZE * 1.37) {
            const scale = 0.7;
            canvas.width = Math.round(width * scale);
            canvas.height = Math.round(height * scale);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            result = canvas.toDataURL('image/jpeg', 0.6);
          }

          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Simple fallback that just reads the file as base64
 */
export function fileToBase64Simple(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
