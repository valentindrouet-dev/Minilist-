// Imgur API service for uploading images
// Uses anonymous uploads with Client-ID

const IMGUR_CLIENT_ID = 'c4a4a563fd95de6'; // Public anonymous client ID

interface ImgurResponse {
  data: {
    id: string;
    link: string;
    deletehash: string;
  };
  success: boolean;
  status: number;
}

/**
 * Upload a base64 image to Imgur
 * @param base64Image - The base64 encoded image (with or without data:image prefix)
 * @returns The Imgur URL of the uploaded image
 */
export async function uploadToImgur(base64Image: string): Promise<string> {
  // Remove the data:image/xxx;base64, prefix if present
  const base64Data = base64Image.includes('base64,')
    ? base64Image.split('base64,')[1]
    : base64Image;

  const response = await fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    headers: {
      'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: base64Data,
      type: 'base64',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Imgur upload failed:', errorText);
    throw new Error(`Échec de l'upload vers Imgur: ${response.status}`);
  }

  const result: ImgurResponse = await response.json();

  if (!result.success) {
    throw new Error('Imgur a refusé l\'image');
  }

  return result.data.link;
}

/**
 * Check if a string is a base64 encoded image
 */
export function isBase64Image(str: string | null): boolean {
  if (!str) return false;
  return str.startsWith('data:image/') && str.includes('base64,');
}
