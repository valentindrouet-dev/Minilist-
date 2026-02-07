// Image hosting service using ImgBB (more generous rate limits than Imgur)

const IMGBB_API_KEY = '44b441dd80c9127eb80930773f9baa57'; // Free API key

interface ImgBBResponse {
  data: {
    id: string;
    url: string;
    display_url: string;
    delete_url: string;
  };
  success: boolean;
  status: number;
}

/**
 * Upload a base64 image to ImgBB
 * @param base64Image - The base64 encoded image (with or without data:image prefix)
 * @returns The ImgBB URL of the uploaded image
 */
export async function uploadToImgBB(base64Image: string): Promise<string> {
  // Remove the data:image/xxx;base64, prefix if present
  const base64Data = base64Image.includes('base64,')
    ? base64Image.split('base64,')[1]
    : base64Image;

  // ImgBB uses form data
  const formData = new FormData();
  formData.append('key', IMGBB_API_KEY);
  formData.append('image', base64Data);

  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('ImgBB upload failed:', errorText);
    throw new Error(`Échec de l'upload: ${response.status}`);
  }

  const result: ImgBBResponse = await response.json();

  if (!result.success) {
    throw new Error('ImgBB a refusé l\'image');
  }

  return result.data.display_url;
}

/**
 * Check if a string is a base64 encoded image
 */
export function isBase64Image(str: string | null): boolean {
  if (!str) return false;
  return str.startsWith('data:image/') && str.includes('base64,');
}
