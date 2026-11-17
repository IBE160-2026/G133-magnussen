import { getDocument, GlobalWorkerOptions } from './pdf.mjs';

GlobalWorkerOptions.workerSrc = './pdf.worker.mjs';
let activeDocument;
let activeFile;
let loading;

export async function readPdf(file, signal) {
  await loading?.destroy();
  activeDocument = null;
  activeFile = null;
  loading = getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false, cMapUrl: './cmaps/', cMapPacked: true, standardFontDataUrl: './standard_fonts/', wasmUrl: './wasm/' });
  const task = loading;
  const abort = () => { void task.destroy(); };
  signal.addEventListener('abort', abort, { once: true });
  try {
    const document = await task.promise;
    if (signal.aborted) {
      await task.destroy();
      throw new DOMException('Aborted', 'AbortError');
    }
    if (!document.numPages || document.numPages > 50) {
      await task.destroy();
      throw Error('Velg en ulåst PDF med 1–50 sider.');
    }
    const pages = [];
    for (let number = 1; number <= document.numPages; number++) {
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
      const page = await document.getPage(number);
      const content = await page.getTextContent();
      const text = content.items.map(item => item.str + (item.hasEOL ? '\n' : ' ')).join('').trim();
      pages.push({ number, text, usable: text.replace(/\s/gu, '').length >= 20 });
      page.cleanup();
    }
    activeDocument = document;
    activeFile = file;
    return pages;
  } finally {
    signal.removeEventListener('abort', abort);
  }
}

export async function renderPdfPage(file, number, signal) {
  if (file !== activeFile || !activeDocument) throw Error('Velg PDF-en på nytt.');
  const page = await activeDocument.getPage(number);
  const viewport = page.getViewport({ scale: 1 });
  const scaled = page.getViewport({ scale: 1600 / Math.max(viewport.width, viewport.height) });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(scaled.width);
  canvas.height = Math.ceil(scaled.height);
  const task = page.render({ canvasContext: canvas.getContext('2d'), viewport: scaled });
  const abort = () => task.cancel();
  signal.addEventListener('abort', abort, { once: true });
  try {
    if (signal.aborted) task.cancel();
    await task.promise;
    return await new Promise((resolve, reject) => canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(Error('Siden kunne ikke vises.'));
    }, 'image/png'));
  } finally {
    signal.removeEventListener('abort', abort);
    canvas.width = canvas.height = 0;
  }
}

export function releasePdf() {
  void loading?.destroy();
  loading = null;
  activeDocument = null;
  activeFile = null;
}
