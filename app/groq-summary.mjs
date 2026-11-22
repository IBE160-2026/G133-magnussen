import { normalize, validateStudyResources } from './gemini-summary.mjs';

export const GROQ_MODEL = 'openai/gpt-oss-120b';
export const GROQ_MAX_INPUT_CHARS = 30_000;
export const GROQ_MAX_OUTPUT_TOKENS = 4096;

function groqError(message, operation, status = null, cause, validationFailure = null) {
  const error = new Error(message, { cause });
  Object.assign(error, { model: GROQ_MODEL, operation, status, provider: 'groq', validationFailure });
  return error;
}

export function prepareGroqRequest(pages) {
  const readable = pages.filter(page => page.usable);
  const input = JSON.stringify(readable.map(page => ({
    page: page.number,
    text: page.text,
  })));
  if (!input.length || input.length > GROQ_MAX_INPUT_CHARS) {
    throw groqError('Groq-inndata overskrider den tillatte tekstgrensen.', 'chatCompletion');
  }
  return {
    readable,
    payload: {
      model: GROQ_MODEL,
      temperature: 0,
      max_tokens: GROQ_MAX_OUTPUT_TOKENS,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:'Lag studieressurser på norsk bokmål, utelukkende basert på oppgitt PDF-tekst. Returner kun gyldig JSON med nøklene summary, keyConcepts, flashcards og quiz. Alle fire verdiene skal være lister med objekter som inneholder title, text og sources. Hvert objekt må ha minst én kilde i sources med page (sidenummer som tall) og excerpt (et ordrett, sammenhengende utdrag på minst 8 tegn fra teksten på akkurat denne siden). Kopier excerpt direkte fra PDF-teksten uten å omskrive, forkorte med prikker eller endre tegn. Ikke finn på kilder. Lag 3–10 flashcards. For hvert flashcard skal title være et fullstendig, konkret fagspørsmål på norsk som slutter med spørsmålstegn, ikke bare et begrep eller en overskrift. text skal være et kort, korrekt svar på spørsmålet, basert på PDF-teksten. Spørsmålet må kunne forstås uten å se PDF-en. Lag 8–12 quizspørsmål basert på PDF-teksten. Hvert quizspørsmål skal ha title (spørsmålet), text (en kort forklaring), sources (minst én verifiserbar kilde), options (nøyaktig tre forskjellige svaralternativer som tekststrenger) og answer (et heltall fra 0 til 2 som angir riktig svaralternativ). Fordel riktige svar mellom de tre posisjonene. Alle ressurser må ha title, text og sources.',
        },
        { role: 'user', content: input },
      ],
    },
  };
}

export async function generateGroqSummary(
  pages,
  apiKey,
  request = fetch,
  prepared = prepareGroqRequest(pages),
  timeoutMs = 100_000,
) {
  if (typeof apiKey !== 'string' || !apiKey.trim()) {
    throw groqError('Groq API-nøkkel mangler.', 'chatCompletion');
  }
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 100_000) {
    throw new RangeError('Invalid Groq generation timeout');
  }
  let response;
  try {
    response = await request('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prepared.payload),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (cause) {
    throw groqError('Groq-forespørselen mislyktes.', 'chatCompletion', null, cause);
  }
  if (!response.ok) {
    throw groqError(
      'Groq kunne ikke lage studieressursene.',
      'chatCompletion',
      response.status,
    );
  }
  let payload;
  try {
    payload = await response.json();
  } catch (cause) {
    throw groqError(
      'Groq returnerte ugyldig JSON.',
      'chatCompletion',
      response.status,
      cause,
      'invalid-json',
    );
  }
  const body = payload?.choices?.[0]?.message?.content;
  let items;
  try {
    items = typeof body === 'string' ? JSON.parse(body) : body;
  } catch (cause) {
    throw groqError(
      'Groq returnerte ugyldig JSON.',
      'chatCompletion',
      response.status,
      cause,
      'invalid-json',
    );
  }

  const result = {
    summary: validateStudyResources(items?.summary, prepared.readable, GROQ_MODEL, 'chatCompletion', response.status, undefined, undefined, true),
    concepts: validateStudyResources(
      items?.concepts ?? items?.keyConcepts,
      prepared.readable,
      GROQ_MODEL,
      'chatCompletion',
      response.status,
      undefined,
      undefined,
      true,
    ),
    flashcards: validateStudyResources(items?.flashcards, prepared.readable, GROQ_MODEL, 'chatCompletion', response.status, undefined, undefined, true),
  };
  const seen = new Set();
  const quiz = [];
  for (const candidate of Array.isArray(items?.quiz) ? items.quiz.slice(0, 20) : []) {
    const { options, answer } = candidate || {};
    if (!Array.isArray(options) || options.length !== 3 ||
        options.some(option => typeof option !== 'string' || !option.trim()) ||
        new Set(options.map(normalize)).size !== 3 ||
        !Number.isInteger(answer) || answer < 0 || answer >= options.length) continue;
    let question;
    try {
      [question] = validateStudyResources([candidate], prepared.readable, GROQ_MODEL, 'chatCompletion', response.status, undefined, undefined, true);
    } catch {
      continue;
    }
    const title = normalize(question.title).replace(/[?.!]+$/u, '');
    if (seen.has(title)) continue;
    seen.add(title);
    quiz.push({ ...question, options, answer });
  }
  return { ...result, quiz };
}
