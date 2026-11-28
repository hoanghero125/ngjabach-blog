import axios from 'axios';

export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  contentType: string;
  size: number;
  createdAt: string;
}

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_DIMENSION = 2000;

export const isImage = (contentType: string) => contentType.startsWith('image/');

export const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/**
 * Shrinks big photos in the browser before upload (max 2000 px, WebP), so
 * phone pictures upload fast and stay well under the 4 MB limit.
 * GIFs (may be animated) and PDFs are uploaded unchanged.
 */
async function prepare(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= 1.5 * 1024 * 1024) return file;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file; // the server still checks the file
  }
}

/** Uploads one file and returns it. Throws an Error with a readable message. */
export async function uploadFile(file: File): Promise<MediaItem> {
  const body = await prepare(file);
  if (body.size > MAX_UPLOAD_BYTES) throw new Error(`${file.name} is too large (max 4 MB).`);
  try {
    const res = await axios.post<MediaItem>(`/api/media?filename=${encodeURIComponent(file.name)}`, body, {
      headers: { 'Content-Type': body.type || 'application/octet-stream' },
    });
    return res.data;
  } catch (err) {
    const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
    throw new Error(message || `Could not upload ${file.name}.`);
  }
}
