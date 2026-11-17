import { mkdir, cp, copyFile, readFile, writeFile } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
let html = await readFile('app/index.html', 'utf8');
const entry = '<script type="module">';
if (!html.includes(entry)) throw Error('Application module entry is missing.');
html = html.replace(entry, '<script type="module">\nimport { readPdf, renderPdfPage, releasePdf } from "./browser-pdf.mjs";\nwindow.webPdf = { readPdf, renderPdfPage, releasePdf };');
html = html.replace('<form id="upload">', '<p><a href="/demo-anatomi-ai-study-buddy.pdf" download>Last ned demo-PDF</a></p>\n<form id="upload">');
if (!html.includes('import { readPdf, renderPdfPage, releasePdf }')) {
  throw Error('Browser PDF module was not included.');
}
await writeFile('dist/index.html', html);
await copyFile('app/browser-pdf.mjs', 'dist/browser-pdf.mjs');
await copyFile('app/demo-anatomi-ai-study-buddy.pdf', 'dist/demo-anatomi-ai-study-buddy.pdf');
for (const name of ['pdf.mjs', 'pdf.worker.mjs']) {
  await copyFile('node_modules/pdfjs-dist/build/' + name, 'dist/' + name);
}

for (const name of ['cmaps', 'standard_fonts', 'wasm']) {
  await cp('node_modules/pdfjs-dist/' + name, 'dist/' + name, { recursive: true });
}
await copyFile('node_modules/pdfjs-dist/LICENSE', 'dist/PDFJS-LICENSE');
