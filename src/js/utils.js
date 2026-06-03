/* Utility helpers for HEX Asset Extractor Pro */

export const SUPPORTED_HTML_TYPES = new Set(['text/html', 'application/xhtml+xml', '']);

export const MIME_EXTENSION_MAP = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/webm': 'webm',
  'audio/mp4': 'm4a',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/ogg': 'ogv',
  'text/css': 'css',
  'application/javascript': 'js',
  'text/javascript': 'js',
  'font/woff': 'woff',
  'font/woff2': 'woff2',
  'font/ttf': 'ttf',
  'font/otf': 'otf',
  'application/font-woff': 'woff',
  'application/font-woff2': 'woff2'
};

export const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export const formatBytes = (bytes = 0) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
};

export const slugify = (value = 'asset') => String(value)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)+/g, '') || 'asset';

export const hashString = async (input) => {
  const data = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buffer)].map(byte => byte.toString(16).padStart(2, '0')).join('');
};

export const inferCategoryFromMime = (mime = '') => {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('video/')) return 'video';
  if (mime.includes('css')) return 'css';
  if (mime.includes('javascript')) return 'js';
  if (mime.includes('font') || mime.includes('woff')) return 'font';
  return 'other';
};

export const inferExternalCategory = (url = '', tagName = '', rel = '') => {
  const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();
  if (/\.(png|jpe?g|gif|svg|webp|avif|bmp|ico)$/.test(cleanUrl)) return 'image';
  if (/\.(mp3|wav|ogg|m4a|aac|flac|webm)$/.test(cleanUrl)) return 'audio';
  if (/\.(mp4|webm|ogv|mov|m4v)$/.test(cleanUrl)) return 'video';
  if (/\.css$/.test(cleanUrl) || rel.includes('stylesheet')) return 'css';
  if (/\.(js|mjs)$/.test(cleanUrl) || tagName === 'script') return 'js';
  if (/\.(woff2?|ttf|otf|eot)$/.test(cleanUrl) || rel.includes('font')) return 'font';
  return 'external';
};

export const extensionForAsset = (asset) => {
  if (asset.extension) return asset.extension;
  if (asset.mime && MIME_EXTENSION_MAP[asset.mime]) return MIME_EXTENSION_MAP[asset.mime];
  if (asset.url) {
    const match = asset.url.split('?')[0].match(/\.([a-z0-9]{2,5})$/i);
    if (match) return match[1].toLowerCase();
  }
  return asset.category === 'image' ? 'png' : asset.category === 'audio' ? 'mp3' : asset.category === 'video' ? 'mp4' : 'txt';
};

export const dataUriToBlob = (dataUri) => {
  const [meta, payload = ''] = String(dataUri).split(',');
  const mime = (meta.match(/^data:([^;,]+)/i) || [])[1] || 'application/octet-stream';
  const isBase64 = /;base64/i.test(meta);
  let binary = '';
  if (isBase64) {
    try {
      binary = atob(payload.replace(/\s/g, ''));
    } catch (err) {
      throw new Error('Invalid base64 data URI payload');
    }
  } else {
    try {
      binary = decodeURIComponent(payload);
    } catch (err) {
      binary = payload;
    }
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
};

export const estimateDataUriSize = (dataUri = '') => {
  const payload = dataUri.split(',')[1] || '';
  return Math.max(0, Math.floor((payload.replace(/\s/g, '').length * 3) / 4));
};

export const debounce = (fn, delay = 150) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

export const isValidHtmlFile = (file) => {
  const lowerName = file.name.toLowerCase();
  // Accept files that either have a known HTML MIME type or a .html/.htm extension
  return SUPPORTED_HTML_TYPES.has(file.type) || lowerName.endsWith('.html') || lowerName.endsWith('.htm');
};
