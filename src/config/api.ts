/**
 * Centralized API configuration for Scudrop FR Frontend.
 *
 * When deploying frontend separately (e.g. on Vercel, Netlify, Cloudflare Pages):
 * Set the environment variable `VITE_API_BASE_URL=https://your-backend-url.com`
 *
 * In local preview or when deployed as a unified fullstack container:
 * Leave `VITE_API_BASE_URL` blank, and requests will automatically route to relative `/api/...`.
 */

export const API_BASE_URL = (
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  ''
).replace(/\/$/, '');

/**
 * Returns the fully qualified URL for an API endpoint.
 * Example: getApiUrl('/api/orders') -> 'https://api.scudrop.com/api/orders' or '/api/orders'
 */
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!API_BASE_URL) {
    return cleanEndpoint;
  }
  return `${API_BASE_URL}${cleanEndpoint}`;
}

/**
 * Returns the fully qualified URL for uploaded files (e.g. proof screenshots).
 * Example: getUploadUrl('/uploads/proof.png') -> 'https://api.scudrop.com/uploads/proof.png'
 */
export function getUploadUrl(filePath?: string | null): string | null {
  if (!filePath) return null;
  if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('data:')) {
    return filePath;
  }
  const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  if (!API_BASE_URL) {
    return cleanPath;
  }
  return `${API_BASE_URL}${cleanPath}`;
}
