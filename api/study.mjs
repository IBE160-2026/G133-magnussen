import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { logGeminiFailure, safeErrorCategory } from '../app/safe-error-category.mjs';
import { prepareSummaryRequest, countSummaryTokens, generateSummary } from '../app/gemini-summary.mjs';
import { calculateMaximumCostMicroUsd, isSupportedFlashModel } from '../app/gemini-cost.mjs';

const demo = JSON.parse(await readFile(new URL('../app/demo-ressurser.json', import.meta.url), 'utf8'));
const demoHash = createHash('sha256')
  .update(await readFile(new URL('../app/demo-anatomi-ai-study-buddy.pdf', import.meta.url))).digest('hex');
const FUNCTION_TIMEOUT_MS = 120_000;
const FUNCTION_SAFETY_MARGIN_MS = 10_000;
const RESERVATION_TIMEOUT_MS = 10_000;
const COUNT_TIMEOUT_MS = 5_000;
const GENERATION_TIMEOUT_MS = 100_000;
const MIN_GENERATION_TIMEOUT_MS = 5_000;
const RETRY_DELAY_MS = 1_000;

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

function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function reserve(session, cost) {
  let url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  let token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (Boolean(process.env.UPSTASH_REDIS_REST_URL) !== Boolean(process.env.UPSTASH_REDIS_REST_TOKEN)) {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      url = process.env.KV_REST_API_URL;
      token = process.env.KV_REST_API_TOKEN;
    } else {
      return { summaryStatus: 'KI-generering er ikke konfigurert. Prøv demo-PDF-en uten Gemini.' };
    }
  }
  const budgetId = process.env.GEMINI_BUDGET_ID;
  const budget = Number(process.env.GEMINI_BUDGET_MICRO_USD);
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
    signal: AbortSignal.timeout(RESERVATION_TIMEOUT_MS),
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

export default async function handler(req, res, dependencies = {}) {
  const now = dependencies.now || (() => performance.now());
  const sleep = dependencies.sleep || wait;
  const startedAt = now();
  const remainingExecutionMs = () =>
    Math.floor(FUNCTION_TIMEOUT_MS - FUNCTION_SAFETY_MARGIN_MS - (now() - startedAt));
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
      let retryUsed = false;
      let retrySucceeded = false;
      const prepared = prepareSummaryRequest(pages);
      if (!isSupportedFlashModel(prepared.model)) {
        return res.status(200).json({
          pages,
          summaryStatus: 'KI-modellen er ikke støttet av denne tjenesten. Ingen kostnad er blitt reservert.',
        });
      }
      let inputTokens;
      try {
        inputTokens = await countSummaryTokens(prepared, key);
      } catch (error) {
        logGeminiFailure(error);
        if (error?.status !== 503) {
          return res.status(200).json({
            pages,
            summaryStatus: 'KI-forespørselen kunne ikke forberedes. Ingen kostnad er blitt reservert.',
          });
        }
        if (remainingExecutionMs() < RETRY_DELAY_MS + COUNT_TIMEOUT_MS) {
          return res.status(200).json({
            pages,
            summaryStatus: 'Gemini var midlertidig utilgjengelig. Omforsøket ble stoppet for å holde seg innenfor tidsgrensen. Ingen kostnad er reservert.',
          });
        }
        retryUsed = true;
        await sleep(RETRY_DELAY_MS);
        const retryCountTimeoutMs = Math.min(COUNT_TIMEOUT_MS, remainingExecutionMs());
        if (retryCountTimeoutMs < COUNT_TIMEOUT_MS) {
          return res.status(200).json({
            pages,
            summaryStatus: 'Gemini var midlertidig utilgjengelig. Omforsøket ble stoppet for å holde seg innenfor tidsgrensen. Ingen kostnad er reservert.',
          });
        }
        try {
          inputTokens = await countSummaryTokens(prepared, key, fetch, retryCountTimeoutMs);
          retrySucceeded = true;
        } catch (retryError) {
          logGeminiFailure(retryError);
          return res.status(200).json({
            pages,
            summaryStatus: retryError?.status === 503
              ? 'Gemini er fortsatt midlertidig utilgjengelig etter ett omforsøk. Ingen kostnad er reservert. Du kan fortsatt åpne PDF-sidene.'
              : 'KI-forespørselen kunne ikke forberedes etter ett omforsøk. Ingen kostnad er reservert.',
          });
        }
      }
      let cost;
      try {
        cost = calculateMaximumCostMicroUsd(prepared.model, inputTokens);
      } catch {
        return res.status(200).json({
          pages,
          summaryStatus: 'KI-kostnaden kunne ikke beregnes trygt. Ingen kostnad er blitt reservert.',
        });
      }
      if (remainingExecutionMs() < RESERVATION_TIMEOUT_MS + MIN_GENERATION_TIMEOUT_MS) {
        return res.status(200).json({
          pages,
          summaryStatus: 'KI-genereringen ble stoppet for å holde seg innenfor Vercels tidsgrense. Ingen kostnad er reservert.',
        });
      }
      reservation = await reserve(input.session, cost);
      if (reservation.summaryStatus) return res.status(200).json({ pages, ...reservation });
      const generationTimeoutMs = Math.min(GENERATION_TIMEOUT_MS, remainingExecutionMs());
      if (generationTimeoutMs < MIN_GENERATION_TIMEOUT_MS) {
        return res.status(200).json({
          pages, ...reservation,
          summaryStatus: 'Kostnaden er reservert, men KI-genereringen ble stoppet for å holde seg innenfor Vercels tidsgrense. Du kan fortsatt åpne PDF-sidene.',
        });
      }
      let resources;
      try {
        resources = await generateSummary(pages, key, fetch, prepared, generationTimeoutMs);
      } catch (error) {
        logGeminiFailure(error);
        if (error?.status !== 503) {
          return res.status(200).json({
            pages, ...reservation,
            summaryStatus: 'KI-generering mislyktes. Prøv igjen senere. Du kan fortsatt åpne PDF-sidene.',
          });
        }
        if (retryUsed) {
          return res.status(200).json({
            pages, ...reservation,
            summaryStatus: 'Gemini svarte midlertidig med 503. Det automatiske omforsøket er allerede brukt. Du kan fortsatt åpne PDF-sidene.',
          });
        }
        const retryWindowMs = RETRY_DELAY_MS + RESERVATION_TIMEOUT_MS + MIN_GENERATION_TIMEOUT_MS;
        if (remainingExecutionMs() < retryWindowMs) {
          return res.status(200).json({
            pages, ...reservation,
            summaryStatus: 'Gemini svarte midlertidig med 503. Omforsøket ble stoppet for å holde seg innenfor Vercels tidsgrense. Du kan fortsatt åpne PDF-sidene.',
          });
        }
        retryUsed = true;
        await sleep(RETRY_DELAY_MS);
        if (remainingExecutionMs() < RESERVATION_TIMEOUT_MS + MIN_GENERATION_TIMEOUT_MS) {
          return res.status(200).json({
            pages, ...reservation,
            summaryStatus: 'Gemini svarte midlertidig med 503. Omforsøket ble stoppet for å holde seg innenfor Vercels tidsgrense. Du kan fortsatt åpne PDF-sidene.',
          });
        }
        let retryReservation;
        try {
          retryReservation = await reserve(input.session, cost);
        } catch (reservationError) {
          console.error('Study retry reservation failed:', safeErrorCategory(reservationError));
          return res.status(200).json({
            pages, ...reservation,
            summaryStatus: 'Gemini svarte midlertidig med 503, men omforsøket kunne ikke reserveres trygt. Du kan fortsatt åpne PDF-sidene.',
          });
        }
        if (retryReservation.summaryStatus) {
          return res.status(200).json({
            pages, ...retryReservation,
            summaryStatus: `Gemini svarte midlertidig med 503, men omforsøket ble stoppet. ${retryReservation.summaryStatus} Du kan fortsatt åpne PDF-sidene.`,
          });
        }
        reservation = retryReservation;
        const retryTimeoutMs = Math.min(GENERATION_TIMEOUT_MS, remainingExecutionMs());
        if (retryTimeoutMs < MIN_GENERATION_TIMEOUT_MS) {
          return res.status(200).json({
            pages, ...reservation,
            summaryStatus: 'Gemini svarte midlertidig med 503. Kostnaden for omforsøket er reservert, men Vercels tidsgrense hindret at det ble sendt. Du kan fortsatt åpne PDF-sidene.',
          });
        }
        try {
          resources = await generateSummary(pages, key, fetch, prepared, retryTimeoutMs);
        } catch (retryError) {
          logGeminiFailure(retryError);
          return res.status(200).json({
            pages, ...reservation,
            summaryStatus: retryError?.status === 503
              ? 'Gemini er fortsatt midlertidig utilgjengelig etter ett omforsøk. Du kan fortsatt åpne PDF-sidene.'
              : 'Det automatiske KI-omforsøket mislyktes. Du kan fortsatt åpne PDF-sidene.',
          });
        }
        return res.status(200).json({
          pages, ...reservation, ...resources,
          summaryStatus: 'Gemini var midlertidig utilgjengelig, men det automatiske omforsøket lyktes.',
        });
      }
      return res.status(200).json({
        pages, ...reservation, ...resources,
        ...(retrySucceeded ? {
          summaryStatus: 'Gemini var midlertidig utilgjengelig under forberedelsen, men omforsøket lyktes.',
        } : {}),
      });
    } catch (error) {
      if (error?.operation) logGeminiFailure(error);
      else console.error('Study generation failed:', safeErrorCategory(error));
      if (error?.status === 503) {
        return res.status(200).json({
          pages, ...reservation,
          summaryStatus: 'Tjenesten er midlertidig utilgjengelig. Prøv igjen senere. Du kan fortsatt åpne PDF-sidene.',
        });
      }
      return res.status(200).json({
        pages, ...reservation,
        summaryStatus: 'KI-generering mislyktes. Prøv igjen senere. Du kan fortsatt åpne PDF-sidene.',
      });
    }
  } catch {
    return res.status(400).json({ error: 'Forespørselen kunne ikke leses.' });
  }
}
