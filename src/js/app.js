/*
  HEX Asset Extractor Pro
  Main application controller
*/

import { extractAssetsFromHtml } from './extractor.js';
import { exportAssetsZip } from './exporter.js';
import { SAMPLE_HTML } from './sample.js';
import { debounce, formatBytes, isValidHtmlFile } from './utils.js';
import {
  closeAssetModal,
  elements,
  openAssetModal,
  renderAssets,
  renderInitialMetrics,
  renderMetrics,
  renderReport,
  renderSidePanels,
  resetUi,
  setButtonsEnabled,
  setProgress,
  setStatus,
  showToast
} from './ui.js';

const state = {
  scan: null,
  filteredAssets: []
};

// Global error handler to surface uncaught errors in the UI
window.addEventListener('error', (event) => {
  console.error(event.error || event.message);
  try { showToast((event.error && event.error.message) || event.message || 'An unexpected error occurred', 'error'); } catch (e) { /* silent */ }
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const updateCurrentFile = (fileMeta) => {
  elements.currentFileName.textContent = fileMeta.name;
  elements.currentFileMeta.textContent = `${formatBytes(fileMeta.size)} · ${fileMeta.type || 'text/html'} · Last modified ${fileMeta.lastModified ? new Date(fileMeta.lastModified).toLocaleDateString() : 'N/A'}`;
};

const applyFilters = () => {
  if (!state.scan) {
    renderAssets([], () => {});
    return;
  }
  const query = elements.searchInput.value.trim().toLowerCase();
  const filter = elements.filterSelect.value;
  state.filteredAssets = state.scan.assets.filter(asset => {
    const matchesQuery = !query || [asset.name, asset.category, asset.mime, asset.source, asset.url, asset.location].some(value => String(value || '').toLowerCase().includes(query));
    const matchesFilter = filter === 'all'
      || asset.category === filter
      || (filter === 'external' && asset.source === 'external')
      || (filter === 'duplicate' && asset.duplicate);
    return matchesQuery && matchesFilter;
  });
  renderAssets(state.filteredAssets, openById);
};

const openById = (assetId) => {
  const asset = state.scan?.assets.find(item => item.id === assetId);
  if (asset) openAssetModal(asset);
};

const processHtml = async (html, fileMeta) => {
  try {
    setStatus('Scanning', 'loading');
    setProgress(12, true);
    updateCurrentFile(fileMeta);
    await sleep(100);
    setProgress(38, true);
    const scan = await extractAssetsFromHtml(html, fileMeta);
    await sleep(100);
    setProgress(78, true);
    state.scan = scan;
    renderMetrics(scan);
    renderSidePanels(scan);
    renderReport(scan);
    applyFilters();
    setButtonsEnabled(scan.assets.length > 0);
    setProgress(100, true);
    setStatus('Complete', 'success');
    showToast(`Scan complete: ${scan.assets.length} assets detected.`);
    setTimeout(() => setProgress(0, false), 900);
  } catch (error) {
    console.error(error);
    setStatus('Error', 'error');
    setProgress(0, false);
    showToast(error.message || 'Unable to process this HTML file.', 'error');
  }
};

const handleFile = async (file) => {
  if (!file) return;
  if (!isValidHtmlFile(file)) {
    showToast('Please upload a valid .html or .htm file.', 'error');
    setStatus('Invalid file', 'error');
    return;
  }
  const html = await file.text();
  await processHtml(html, {
    name: file.name,
    size: file.size,
    type: file.type || 'text/html',
    lastModified: file.lastModified
  });
};

const bindUpload = () => {
  elements.browseBtn.addEventListener('click', () => elements.fileInput.click());
  elements.fileInput.addEventListener('change', event => handleFile(event.target.files[0]));

  ['dragenter', 'dragover'].forEach(eventName => {
    elements.dropZone.addEventListener(eventName, event => {
      event.preventDefault();
      elements.dropZone.classList.add('is-dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    elements.dropZone.addEventListener(eventName, event => {
      event.preventDefault();
      elements.dropZone.classList.remove('is-dragover');
    });
  });

  // Allow clicking or keyboard activation of the drop zone to open file chooser
  elements.dropZone.addEventListener('click', () => elements.fileInput.click());
  elements.dropZone.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      elements.fileInput.click();
    }
  });

  elements.dropZone.addEventListener('drop', event => handleFile(event.dataTransfer.files[0]));
};

const bindActions = () => {
  elements.loadSampleBtn.addEventListener('click', () => processHtml(SAMPLE_HTML, {
    name: 'sample-asset-page.html',
    size: new Blob([SAMPLE_HTML]).size,
    type: 'text/html',
    lastModified: Date.now()
  }));

  elements.downloadImagesBtn.addEventListener('click', async () => {
    try { await exportAssetsZip(state.scan?.assets || [], { imagesOnly: true }); }
    catch (error) { showToast(error.message, 'error'); }
  });

  elements.downloadAllBtn.addEventListener('click', async () => {
    try { await exportAssetsZip(state.scan?.assets || [], { imagesOnly: false }); }
    catch (error) { showToast(error.message, 'error'); }
  });

  elements.printReportBtn.addEventListener('click', () => window.print());

  elements.clearBtn.addEventListener('click', () => {
    state.scan = null;
    state.filteredAssets = [];
    resetUi();
    showToast('Scan cleared. Ready for a new HTML file.');
  });

  elements.searchInput.addEventListener('input', debounce(applyFilters, 150));
  elements.filterSelect.addEventListener('change', applyFilters);
  elements.closeModalBtn.addEventListener('click', closeAssetModal);
  elements.assetModal.addEventListener('click', event => {
    if (event.target === elements.assetModal) closeAssetModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeAssetModal();
  });
};

const init = () => {
  renderInitialMetrics();
  resetUi();
  bindUpload();
  bindActions();
};

init();
