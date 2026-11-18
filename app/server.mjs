import { generateSummary } from './gemini-summary.mjs';
import { logGeminiFailure, safeErrorCategory } from './safe-error-category.mjs';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const appUrl = new URL('./index.html', import.meta.url);
const musklerSummary = JSON.parse(await readFile(new URL('./muskler-sammendrag.json', import.meta.url), 'utf8'));
const musklerConcepts = JSON.parse(await readFile(new URL('./muskler-begreper.json', import.meta.url), 'utf8'));
const musklerFlashcards = JSON.parse(await readFile(new URL('./muskler-flashcards.json', import.meta.url), 'utf8'));
const musklerQuiz = JSON.parse(await readFile(new URL('./muskler-quiz.json', import.meta.url), 'utf8'));
const musklerHash = '2b30cdc87a453f04ba91e18d8037e442fe31baa36f50f75085f5755947a5bd6a';
const demoResources = JSON.parse(await readFile(new URL('./demo-ressurser.json', import.meta.url), 'utf8'));
const demoPdf = await readFile(new URL('./demo-anatomi-ai-study-buddy.pdf', import.meta.url));
const demoHash = createHash('sha256').update(demoPdf).digest('hex');
const maxBytes = 20_000_000;
const port = Number(process.env.PORT || 4173);

async function withLocalPdf(request, operation) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > maxBytes) throw Error('PDF-en kan være maks 20 MB.');
    chunks.push(chunk);
  }
  const pdf = Buffer.concat(chunks);
  if (pdf.subarray(0, 5).toString() !== '%PDF-') throw Error('Velg en gyldig PDF.');
  const dir = await mkdtemp(join(tmpdir(), 'study-buddy-'));
  try {
    const path = join(dir, 'source.pdf');
    await writeFile(path, pdf);
    return await operation(path, pdf, dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

const script = name => fileURLToPath(new URL(name, import.meta.url));
const options = { timeout: 25000, maxBuffer: 8 * 1024 * 1024 };

async function extract(request) {
  return withLocalPdf(request, async (path, pdf) => {
    const { stdout } = await run('osascript', ['-l', 'JavaScript', script('./les-pdf.js'), path], options);
    const pages = JSON.parse(stdout);
    if (pages[12]?.text.includes('Muskelkarakteristika I') && pages[13]?.text.includes('Muskelkarakteristika II')) {
      const { stdout: groups } = await run('osascript', ['-l', 'JavaScript', script('./grupper.js'), path], options);
      pages[12].groups = JSON.parse(groups)[0].groups;
    }
    const hash = createHash('sha256').update(pdf).digest('hex');
    if (hash === demoHash && request.headers['x-study-summary'] !== 'gemini') return { pages, ...demoResources };
    if (hash === musklerHash) return { pages, summary: musklerSummary, concepts: musklerConcepts, flashcards: musklerFlashcards, quiz: musklerQuiz };
    if (!pages.some(page => page.usable)) return { pages, summaryStatus: 'PDF-en har ingen sider med nok uttrekkbar tekst.' };
    if (request.headers['x-study-summary'] !== 'gemini') return { pages, summaryStatus: 'Velg KI-sammendrag før du leser PDF-en på nytt.' };
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) return { pages, summaryStatus: 'KI-sammendrag krever at GEMINI_API_KEY er satt på den lokale serveren.' };
    try {
      return { pages, ...await generateSummary(pages, apiKey) };
    } catch (error) {
      if (error?.operation) logGeminiFailure(error);
      else console.error('Sammendrag feilet:', safeErrorCategory(error));
      return { pages, summaryStatus: 'KI-sammendraget kunne ikke lages. Du kan fortsatt åpne PDF-sidene eller prøve på nytt.' };
    }
  });
}

async function renderPage(request, number) {
  return withLocalPdf(request, async (path, _, dir) => {
    const output = join(dir, 'page.png');
    await run('osascript', ['-l', 'JavaScript', script('./render-pdf-side.js'), path, number, output], options);
    return readFile(output);
  });
}

createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }).end(await readFile(appUrl));
    return;
  }
  const page = req.url?.match(/^\/pdf-page\/([1-9]|[1-4][0-9]|50)$/)?.[1];
  if (req.method !== 'POST' || (req.url !== '/pdf' && !page)) {
    res.writeHead(404).end();
    return;
  }
  if (req.headers.origin !== 'http://127.0.0.1:' + port) {
    res.writeHead(403).end();
    return;
  }
  try {
    if (page) {
      const image = await renderPage(req, page);
      res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' }).end(image);
      return;
    }
    const result = await extract(req);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(result));
  } catch (error) {
    const message = error.stderr ? 'PDF-en kunne ikke leses. Sjekk at den er ulåst og har maks 50 sider.' : error.message;
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify({ error: message }));
  }
}).listen(port, '127.0.0.1', () => console.log('Åpne http://127.0.0.1:' + port));
