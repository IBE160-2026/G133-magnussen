import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { generateSummary } from '../app/gemini-summary.mjs';

const demo = JSON.parse(await readFile(new URL('../app/demo-ressurser.json', import.meta.url), 'utf8'));
const demoHash = createHash('sha256')
  .update(await readFile(new URL('../app/demo-anatomi-ai-study-buddy.pdf', import.meta.url))).digest('hex');

// Redis executes both reservations atomically across concurrent function instances.
const reserveScript = `
local used = tonumber(redis.call('GET', KEYS[1]) or '0')
local spent = tonumber(redis.call('GET', KEYS[2]) or '0')
if used >= 8 then return {0, 0} end
if spent + tonumber(ARGV[1]) > tonumber(ARGV[2]) then return {-1, 8-used} end
redis.call('INCR', KEYS[1])
if used == 0 then redis.call('EXPIRE', KEYS[1], 86400) end
redis.call('INCRBY', KEYS[2], ARGV[1])
return {1, 7-used}
`;

async function reserve(session) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const budgetId = process.env.GEMINI_BUDGET_ID;
  const budget = Number(process.env.GEMINI_BUDGET_MICRO_USD);
  const cost = Number(process.env.GEMINI_MAX_REQUEST_MICRO_USD);
  if (!url || !token || !budgetId || !Number.isSafeInteger(budget) || budget <= 0
    || !Number.isSafeInteger(cost) || cost <= 0) {
    return { summaryStatus: 'KI-generering er ikke konfigurert. Prøv demo-PDF-en uten Gemini.' };
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(['EVAL', reserveScript, 2,
      'study:session:' + budgetId + ':' + session, 'study:budget:' + budgetId,
      String(cost), String(budget)]),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw Error('Usage reservation failed');
  const data = await response.json();
  if (data.error || !Array.isArray(data.result) || data.result.length !== 2) {
    throw Error('Invalid usage reservation');
  }
  const [status, remainingRequests] = data.result;
  if (status === 0) return { remainingRequests: 0, summaryStatus: 'Du har brukt alle åtte KI-forespørslene i denne studieøkten.' };
  if (status === -1) return { remainingRequests, summaryStatus: 'Prosjektets kostnadstak er nådd. KI-generering er utilgjengelig.' };
  if (status !== 1) throw Error('Invalid usage status');
  return { remainingRequests };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Bruk POST.' });
  const expectedOrigin = process.env.APP_ORIGIN || 'https://' + req.headers.host;
  if (req.headers.origin !== expectedOrigin) return res.status(403).json({ error: 'Ugyldig forespørsel.' });
  try {
    const input = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!input || !Array.isArray(input.pages) || !input.pages.length || input.pages.length > 50
      || typeof input.useAi !== 'boolean' || typeof input.session !== 'string'
      || !/^[0-9a-f-]{36}$/.test(input.session)) {
      return res.status(400).json({ error: 'Ugyldig tekstgrunnlag.' });
    }
    let textLength = 0;
    const pages = [];
    for (const [index, page] of input.pages.entries()) {
      if (page.number !== index + 1 || typeof page.text !== 'string') {
        return res.status(400).json({ error: 'Ugyldig PDF-side.' });
      }
      textLength += page.text.length;
      if (textLength > 500_000) {
        return res.status(400).json({ error: 'Tekstmengden er for stor for én generering.' });
      }
      pages.push({ number: page.number, text: page.text, usable: page.text.replace(/\s/gu, '').length >= 20 });
    }
    if (!input.useAi && input.hash === demoHash) return res.status(200).json({ pages, ...demo });
    if (!pages.some(page => page.usable)) {
      return res.status(200).json({ pages, summaryStatus: 'PDF-en har ingen sider med nok uttrekkbar tekst.' });
    }
    if (!input.useAi) {
      return res.status(200).json({ pages, summaryStatus: 'Velg Gemini for å lage studieressurser fra din egen PDF.' });
    }
    const key = process.env.GEMINI_API_KEY?.trim();
    if (!key) {
      return res.status(200).json({ pages, summaryStatus: 'KI-generering er ikke konfigurert. Prøv demo-PDF-en uten Gemini.' });
    }
    let reservation;
    try {
      reservation = await reserve(input.session);
      if (reservation.summaryStatus) return res.status(200).json({ pages, ...reservation });
      const resources = await generateSummary(pages, key);
      return res.status(200).json({ pages, ...reservation, ...resources });
    } catch {
      return res.status(200).json({
        pages, ...reservation,
        summaryStatus: 'KI-generering mislyktes. Prøv igjen senere. Du kan fortsatt åpne PDF-sidene.',
      });
    }
  } catch {
    return res.status(400).json({ error: 'Forespørselen kunne ikke leses.' });
  }
}
