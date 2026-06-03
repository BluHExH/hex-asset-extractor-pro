/* Asset extraction engine */

import { estimateDataUriSize, extensionForAsset, hashString, inferCategoryFromMime, inferExternalCategory } from './utils.js';

const DATA_URI_REGEX = /data:([a-zA-Z0-9/+.-]+\/[a-zA-Z0-9.+-]+)(?:;charset=[^;,]+)?;base64,([a-zA-Z0-9+/=\s]+)/gi;

const getAttribute = (node, attr) => node.getAttribute(attr) || '';

const normalizeUrl = (url) => {
  if (!url) return '';
  return url.trim().replace(/^['"]|['"]$/g, '');
};

const isExternalUrl = (url) => /^(https?:)?\/\//i.test(url) || /^mailto:/i.test(url) || /^tel:/i.test(url);

const collectSrcsetUrls = (srcset = '') => srcset
  .split(',')
  .map(item => normalizeUrl(item.trim().split(/\s+/)[0]))
  .filter(Boolean);

const collectCssUrls = (html = '') => {
  const urls = [];
  const regex = /url\(([^)]+)\)/gi;
  let match;
  while ((match = regex.exec(html))) {
    const url = normalizeUrl(match[1]);
    if (url && !url.startsWith('data:')) urls.push(url);
  }
  return urls;
};

const buildStats = (assets, fileSize) => {
  const counts = { total: assets.length, image: 0, audio: 0, video: 0, css: 0, js: 0, font: 0, external: 0, embedded: 0, duplicates: 0 };
  let embeddedBytes = 0;

  assets.forEach(asset => {
    if (counts[asset.category] !== undefined) counts[asset.category] += 1;
    if (asset.source === 'external') counts.external += 1;
    if (asset.source === 'embedded') {
      counts.embedded += 1;
      embeddedBytes += asset.size || 0;
    }
    if (asset.duplicate) counts.duplicates += 1;
  });

  const largest = [...assets].sort((a, b) => (b.size || 0) - (a.size || 0))[0] || null;
  return { counts, fileSize, embeddedBytes, largest };
};

export const extractAssetsFromHtml = async (html, fileMeta = {}) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const assets = [];
  const seenSignatures = new Map();
  let idCounter = 1;

  const addAsset = async (asset) => {
    const signatureSeed = asset.source === 'embedded' ? asset.dataUri : asset.url;
    const hash = await hashString(signatureSeed || `${asset.name}-${idCounter}`);
    const existing = seenSignatures.get(hash);
    const enriched = {
      id: `asset-${idCounter++}`,
      hash,
      duplicate: Boolean(existing),
      duplicateOf: existing || null,
      ...asset
    };
    if (!existing) seenSignatures.set(hash, enriched.id);
    assets.push(enriched);
  };

  let dataMatch;
  while ((dataMatch = DATA_URI_REGEX.exec(html))) {
    const dataUri = dataMatch[0].replace(/\s/g, '');
    const mime = dataMatch[1].toLowerCase();
    const category = inferCategoryFromMime(mime);
    if (!['image', 'audio', 'video'].includes(category)) continue;
    await addAsset({
      name: `${category}-${idCounter}`,
      category,
      mime,
      extension: extensionForAsset({ mime, category }),
      source: 'embedded',
      dataUri,
      size: estimateDataUriSize(dataUri),
      location: 'Base64 data URI'
    });
  }

  const externalCandidates = [];
  doc.querySelectorAll('img, source, audio, video, track, embed, object, iframe').forEach(node => {
    ['src', 'href', 'data', 'poster'].forEach(attr => {
      const value = normalizeUrl(getAttribute(node, attr));
      if (value && !value.startsWith('data:')) externalCandidates.push({ url: value, tagName: node.tagName.toLowerCase(), rel: '', attr });
    });
    collectSrcsetUrls(getAttribute(node, 'srcset')).forEach(url => externalCandidates.push({ url, tagName: node.tagName.toLowerCase(), rel: '', attr: 'srcset' }));
  });

  doc.querySelectorAll('link[href]').forEach(node => {
    externalCandidates.push({ url: normalizeUrl(getAttribute(node, 'href')), tagName: 'link', rel: getAttribute(node, 'rel').toLowerCase(), attr: 'href' });
  });

  doc.querySelectorAll('script[src]').forEach(node => {
    externalCandidates.push({ url: normalizeUrl(getAttribute(node, 'src')), tagName: 'script', rel: '', attr: 'src' });
  });

  collectCssUrls(html).forEach(url => externalCandidates.push({ url, tagName: 'style', rel: '', attr: 'css-url' }));

  for (const candidate of externalCandidates) {
    if (!candidate.url || candidate.url.startsWith('#') || candidate.url.startsWith('javascript:')) continue;
    const category = inferExternalCategory(candidate.url, candidate.tagName, candidate.rel);
    if (!isExternalUrl(candidate.url) && !/\.(png|jpe?g|gif|svg|webp|css|js|woff2?|ttf|otf|mp3|wav|mp4|webm|ogg)$/i.test(candidate.url)) continue;
    await addAsset({
      name: candidate.url.split('/').pop()?.split('?')[0] || `${category}-${idCounter}`,
      category,
      mime: 'external/reference',
      source: 'external',
      url: candidate.url,
      size: 0,
      location: `<${candidate.tagName}> ${candidate.attr}`
    });
  }

  return {
    file: fileMeta,
    assets,
    stats: buildStats(assets, fileMeta.size || html.length),
    scannedAt: new Date().toISOString()
  };
};
