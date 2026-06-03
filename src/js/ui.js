/* UI rendering and state presentation */

import { escapeHtml, formatBytes } from './utils.js';

export const elements = {
  fileInput: document.querySelector('#fileInput'),
  browseBtn: document.querySelector('#browseBtn'),
  dropZone: document.querySelector('#dropZone'),
  loadSampleBtn: document.querySelector('#loadSampleBtn'),
  currentFileName: document.querySelector('#currentFileName'),
  currentFileMeta: document.querySelector('#currentFileMeta'),
  scanStatus: document.querySelector('#scanStatus'),
  progressWrap: document.querySelector('#progressWrap'),
  progressText: document.querySelector('#progressText'),
  progressBar: document.querySelector('#progressBar'),
  downloadImagesBtn: document.querySelector('#downloadImagesBtn'),
  downloadAllBtn: document.querySelector('#downloadAllBtn'),
  printReportBtn: document.querySelector('#printReportBtn'),
  clearBtn: document.querySelector('#clearBtn'),
  metricsGrid: document.querySelector('#metricsGrid'),
  summaryLine: document.querySelector('#summaryLine'),
  assetGrid: document.querySelector('#assetGrid'),
  emptyState: document.querySelector('#emptyState'),
  searchInput: document.querySelector('#searchInput'),
  filterSelect: document.querySelector('#filterSelect'),
  duplicateStats: document.querySelector('#duplicateStats'),
  sizeStats: document.querySelector('#sizeStats'),
  reportSubtitle: document.querySelector('#reportSubtitle'),
  reportContent: document.querySelector('#reportContent'),
  assetModal: document.querySelector('#assetModal'),
  modalTitle: document.querySelector('#modalTitle'),
  modalBody: document.querySelector('#modalBody'),
  closeModalBtn: document.querySelector('#closeModalBtn'),
  toastContainer: document.querySelector('#toastContainer')
};

const metricDefinitions = [
  ['total', 'Total assets', 'All detected embedded and external assets'],
  ['image', 'Images', 'JPEG, PNG, GIF, SVG, WebP and image URLs'],
  ['audio', 'Audio', 'Embedded and linked audio assets'],
  ['video', 'Video', 'Embedded and linked video assets'],
  ['css', 'CSS files', 'Stylesheets and CSS references'],
  ['js', 'JavaScript', 'Script references'],
  ['external', 'External URLs', 'Network asset references'],
  ['duplicates', 'Duplicates', 'Repeated asset signatures']
];

export const setStatus = (label, type = 'idle') => {
  const colors = { idle: 'bg-slate-400', loading: 'bg-blue-500', success: 'bg-emerald-500', error: 'bg-red-500' };
  elements.scanStatus.innerHTML = `<span class="h-2 w-2 rounded-full ${colors[type] || colors.idle}"></span>${escapeHtml(label)}`;
};

export const setProgress = (percent, visible = true) => {
  elements.progressWrap.classList.toggle('hidden', !visible);
  elements.progressText.textContent = `${Math.round(percent)}%`;
  elements.progressBar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
};

export const showToast = (message, type = 'success') => {
  const palette = type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : type === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800';
  const toast = document.createElement('div');
  toast.className = `toast rounded-2xl border ${palette} p-4 text-sm font-semibold shadow-lg`;
  toast.textContent = message;
  elements.toastContainer.append(toast);
  setTimeout(() => toast.remove(), 4200);
};

export const renderInitialMetrics = () => {
  elements.metricsGrid.innerHTML = metricDefinitions.map(([key, title, description]) => `
    <article class="metric-card card-strong rounded-3xl p-5">
      <p class="text-sm font-bold text-slate-500">${title}</p>
      <p id="metric-${key}" class="mt-3 text-3xl font-black text-slate-950">0</p>
      <p class="mt-2 text-xs leading-5 text-slate-500">${description}</p>
    </article>
  `).join('');
};

export const renderMetrics = (scan) => {
  const counts = scan?.stats?.counts || {};
  metricDefinitions.forEach(([key]) => {
    const node = document.querySelector(`#metric-${key}`);
    if (node) node.textContent = counts[key] || 0;
  });
  elements.summaryLine.textContent = scan ? `${counts.total} assets found in ${scan.file.name}.` : 'Waiting for a file scan.';
};

const previewMarkup = (asset) => {
  if (asset.category === 'image' && asset.dataUri) return `<img src="${asset.dataUri}" alt="${escapeHtml(asset.name)}" class="h-full w-full object-contain">`;
  if (asset.category === 'image' && asset.url) return `<img src="${escapeHtml(asset.url)}" alt="${escapeHtml(asset.name)}" class="h-full w-full object-cover" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('.preview-frame').innerHTML='<span class=&quot;text-xs font-bold text-slate-500&quot;>External image preview unavailable</span>'">`;
  const icon = asset.category === 'audio' ? '♪' : asset.category === 'video' ? '▶' : asset.category === 'css' ? 'CSS' : asset.category === 'js' ? 'JS' : asset.category === 'font' ? 'Aa' : 'URL';
  return `<span class="text-3xl font-black text-slate-400">${icon}</span>`;
};

export const renderAssets = (assets, onOpen) => {
  elements.emptyState.classList.toggle('hidden', assets.length > 0);
  elements.assetGrid.innerHTML = assets.map(asset => `
    <article class="asset-card overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <button type="button" data-asset-id="${asset.id}" class="block w-full text-left focus-ring">
        <div class="preview-frame flex h-44 items-center justify-center overflow-hidden bg-slate-50">${previewMarkup(asset)}</div>
        <div class="p-4">
          <div class="mb-3 flex flex-wrap items-center gap-2">
            <span class="asset-chip ${asset.category}">${escapeHtml(asset.category)}</span>
            ${asset.duplicate ? '<span class="asset-chip other">Duplicate</span>' : ''}
          </div>
          <h3 class="truncate text-sm font-extrabold text-slate-950" title="${escapeHtml(asset.name)}">${escapeHtml(asset.name)}</h3>
          <p class="mt-1 truncate text-xs font-medium text-slate-500">${escapeHtml(asset.source)} · ${asset.size ? formatBytes(asset.size) : 'Reference'}</p>
        </div>
      </button>
    </article>
  `).join('');

  elements.assetGrid.querySelectorAll('[data-asset-id]').forEach(button => {
    button.addEventListener('click', () => onOpen(button.dataset.assetId));
  });
};

export const renderSidePanels = (scan) => {
  if (!scan) {
    elements.duplicateStats.innerHTML = '<p>No duplicate analysis available yet.</p>';
    elements.sizeStats.innerHTML = '<p>No size data available yet.</p>';
    return;
  }
  const { counts } = scan.stats;
  const unique = counts.total - counts.duplicates;
  elements.duplicateStats.innerHTML = `
    <div class="flex justify-between rounded-2xl bg-slate-50 p-3"><span>Unique assets</span><strong>${unique}</strong></div>
    <div class="flex justify-between rounded-2xl bg-slate-50 p-3"><span>Duplicate assets</span><strong>${counts.duplicates}</strong></div>
    <div class="flex justify-between rounded-2xl bg-slate-50 p-3"><span>Duplicate rate</span><strong>${counts.total ? Math.round((counts.duplicates / counts.total) * 100) : 0}%</strong></div>
  `;
  elements.sizeStats.innerHTML = `
    <div class="flex justify-between rounded-2xl bg-slate-50 p-3"><span>HTML file size</span><strong>${formatBytes(scan.stats.fileSize)}</strong></div>
    <div class="flex justify-between rounded-2xl bg-slate-50 p-3"><span>Embedded asset bytes</span><strong>${formatBytes(scan.stats.embeddedBytes)}</strong></div>
    <div class="flex justify-between rounded-2xl bg-slate-50 p-3"><span>Largest embedded asset</span><strong>${scan.stats.largest?.size ? formatBytes(scan.stats.largest.size) : 'N/A'}</strong></div>
  `;
};

export const renderReport = (scan) => {
  if (!scan) {
    elements.reportSubtitle.textContent = 'A report will be generated after your first scan.';
    elements.reportContent.innerHTML = '';
    return;
  }
  const counts = scan.stats.counts;
  elements.reportSubtitle.textContent = `Scan completed for ${scan.file.name} on ${new Date(scan.scannedAt).toLocaleString()}.`;
  elements.reportContent.innerHTML = `
    <article class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <h3 class="text-lg font-black text-slate-950">Scan summary</h3>
      <p class="mt-3 text-sm leading-6 text-slate-600">HEX Asset Extractor Pro detected <strong>${counts.total}</strong> total assets, including <strong>${counts.embedded}</strong> embedded Base64 assets and <strong>${counts.external}</strong> external references.</p>
    </article>
    <article class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <h3 class="text-lg font-black text-slate-950">Asset breakdown</h3>
      <p class="mt-3 text-sm leading-6 text-slate-600">Images: ${counts.image}, Audio: ${counts.audio}, Video: ${counts.video}, CSS: ${counts.css}, JavaScript: ${counts.js}, Fonts: ${counts.font}, Duplicates: ${counts.duplicates}.</p>
    </article>
    <article class="rounded-3xl border border-slate-200 bg-slate-50 p-5 md:col-span-2">
      <h3 class="text-lg font-black text-slate-950">Extraction result</h3>
      <p class="mt-3 text-sm leading-6 text-slate-600">Embedded assets can be exported directly into ZIP files with correct extensions. External assets are safely exported as URL reference files to avoid cross-origin network downloads from the browser.</p>
    </article>
  `;
};

export const openAssetModal = (asset) => {
  elements.modalTitle.textContent = asset.name;
  const sourceValue = asset.url || asset.location || 'Embedded data URI';
  elements.modalBody.innerHTML = `
    <div class="mb-5 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div class="preview-frame flex min-h-64 items-center justify-center overflow-hidden rounded-2xl">${previewMarkup(asset)}</div>
    </div>
    <dl class="grid gap-3 sm:grid-cols-2">
      ${[
        ['Type', asset.category], ['MIME', asset.mime], ['Source', asset.source], ['Size', asset.size ? formatBytes(asset.size) : 'External reference'], ['Duplicate', asset.duplicate ? `Yes, duplicate of ${asset.duplicateOf}` : 'No'], ['Location', asset.location || 'Detected asset']
      ].map(([label, value]) => `<div class="rounded-2xl bg-slate-50 p-3"><dt class="text-xs font-bold uppercase tracking-wide text-slate-500">${label}</dt><dd class="mt-1 break-words text-sm font-semibold text-slate-800">${escapeHtml(value)}</dd></div>`).join('')}
    </dl>
    <div class="mt-4 rounded-2xl bg-slate-50 p-3"><p class="text-xs font-bold uppercase tracking-wide text-slate-500">Reference</p><p class="mt-1 break-all text-sm font-semibold text-slate-800">${escapeHtml(sourceValue)}</p></div>
  `;
  elements.assetModal.classList.remove('hidden');
  elements.assetModal.classList.add('flex');
};

export const closeAssetModal = () => {
  elements.assetModal.classList.add('hidden');
  elements.assetModal.classList.remove('flex');
};

export const setButtonsEnabled = (enabled) => {
  [elements.downloadImagesBtn, elements.downloadAllBtn, elements.printReportBtn, elements.clearBtn].forEach(button => { button.disabled = !enabled; });
};

export const resetUi = () => {
  elements.currentFileName.textContent = 'No file analyzed yet';
  elements.currentFileMeta.textContent = 'Upload an HTML file to generate extraction metrics, previews, and a downloadable report.';
  elements.searchInput.value = '';
  elements.filterSelect.value = 'all';
  setStatus('Idle', 'idle');
  setProgress(0, false);
  setButtonsEnabled(false);
  renderMetrics(null);
  renderAssets([], () => {});
  renderSidePanels(null);
  renderReport(null);
};
