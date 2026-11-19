import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareSummaryRequest, countSummaryTokens, generateSummary } from './gemini-summary.mjs';
import { calculateMaximumCostMicroUsd, isSupportedFlashModel } from './gemini-cost.mjs';

const resource = title => ({
  title,
  text: 'Supports movement.',
  sources: [{ page: 1, excerpt: 'hamstring supports movement' }],
});

test('uses a 100-second timeout and parses a simulated Gemini response', async () => {
  const originalTimeout = AbortSignal.timeout;
  let timeout;
  AbortSignal.timeout = milliseconds => {
    timeout = milliseconds;
    return new AbortController().signal;
  };
  try {
    let requestOptions;
    const responseData = {
      summary: [resource('Summary')],
      concepts: [resource('Concept')],
      flashcards: [resource('Flashcard')],
      quiz: [{
        ...resource('What does the hamstring support?'),
        options: ['Movement', 'Vision', 'Hearing'],
        answer: 0,
      }],
    };
    const result = await generateSummary(
      [{ number: 1, text: 'The hamstring supports movement.', usable: true }],
      'test-api-key',
      async (_url, options) => {
        requestOptions = options;
        return new Response(JSON.stringify({
          candidates: [{ content: { parts: [{ text: JSON.stringify(responseData) }] } }],
        }), { status: 200, headers: { 'content-type': 'application/json' } });
      },
    );
    assert.equal(timeout, 100_000);
    assert.ok(requestOptions.signal instanceof AbortSignal);
    assert.equal(result.quiz.length, 1);
    assert.equal(result.quiz[0].title, 'What does the hamstring support?');
  } finally {
    AbortSignal.timeout = originalTimeout;
  }
});

test('allows a bounded per-attempt generation timeout', async () => {
  const originalTimeout = AbortSignal.timeout;
  let timeout;
  AbortSignal.timeout = milliseconds => {
    timeout = milliseconds;
    return new AbortController().signal;
  };
  try {
    const pages = [{ number: 1, text: 'The hamstring supports movement.', usable: true }];
    const prepared = prepareSummaryRequest(pages);
    await assert.rejects(
      generateSummary(
        pages,
        'test-api-key',
        async () => new Response('private provider details', { status: 503 }),
        prepared,
        42_000,
      ),
      error => error.status === 503,
    );
    assert.equal(timeout, 42_000);
    await assert.rejects(
      generateSummary(pages, 'test-api-key', async () => {}, prepared, 100_001),
      /Invalid Gemini generation timeout/,
    );
  } finally {
    AbortSignal.timeout = originalTimeout;
  }
});

test('returns an empty quiz when the simulated provider response has no questions', async () => {
  const responseData = {
    summary: [resource('Summary')],
    concepts: [resource('Concept')],
    flashcards: [resource('Flashcard')],
    quiz: [],
  };
  const result = await generateSummary(
    [{ number: 1, text: 'The hamstring supports movement.', usable: true }],
    'test-api-key',
    async () => new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: JSON.stringify(responseData) }] } }],
    }), { status: 200, headers: { 'content-type': 'application/json' } }),
  );
  assert.deepEqual(result.quiz, []);
});

test('does not expose provider error response bodies', async () => {
  await assert.rejects(
    generateSummary(
      [{ number: 1, text: 'The hamstring supports movement.', usable: true }],
      'test-api-key',
      async () => new Response(JSON.stringify({
        error: {
          code: 429,
          message: 'secret-test-api-key private PDF text generated response',
        },
      }), { status: 429 }),
    ),
    error => {
      assert.equal(error.message, 'Gemini kunne ikke lage sammendraget. Prøv igjen senere.');
      assert.equal(error.operation, 'generateContent');
      assert.equal(error.model, 'gemini-3.5-flash');
      assert.equal(error.status, 429);
      assert.equal(error.googleErrorCode, 429);
      assert.equal(error.message.includes('private PDF text'), false);
      return true;
    },
  );
});

test('rejects malformed or incomplete simulated Gemini responses', async () => {
  const responses = [
    { payload: { candidates: [] }, message: /Gemini returnerte et ugyldig sammendrag/ },
    {
      payload: {
        candidates: [{ content: { parts: [{ text: JSON.stringify({ summary: [], concepts: [], flashcards: [], quiz: [] }) }] } }],
      },
      message: /Gemini returnerte ugyldige studieressurser/,
    },
    {
      payload: { candidates: [{ content: { parts: [{ text: 'not JSON' }] } }] },
      message: /Gemini returnerte et ugyldig sammendrag/,
    },
  ];
  for (const { payload, body, message } of responses) {
    await assert.rejects(
      generateSummary(
        [{ number: 1, text: 'The hamstring supports movement.', usable: true }],
        'test-api-key',
        async () => new Response(body ?? JSON.stringify(payload), { status: 200 }),
      ),
      message,
    );
  }
});

test('prepares and counts the complete generation payload', async () => {
  const originalTimeout = AbortSignal.timeout;
  let timeout;
  AbortSignal.timeout = milliseconds => {
    timeout = milliseconds;
    return new AbortController().signal;
  };
  try {
    const prepared = prepareSummaryRequest(
      [{ number: 1, text: 'The hamstring supports movement.', usable: true, groups: [['movement']] }],
      'gemini-3.8-flash',
    );
    let countBody;
    const totalTokens = await countSummaryTokens(prepared, 'test-api-key', async (_url, options) => {
      countBody = JSON.parse(options.body);
      return new Response(JSON.stringify({ totalTokens: 123 }), { status: 200 });
    });
    assert.equal(totalTokens, 123);
    assert.equal(timeout, 5_000);
    assert.equal(prepared.model, 'gemini-3.8-flash');
    assert.equal(prepared.payload.generationConfig.maxOutputTokens, 8192);
    assert.deepEqual(countBody, {
      generateContentRequest: {
        ...prepared.payload,
        model: 'models/gemini-3.8-flash',
      },
    });
  } finally {
    AbortSignal.timeout = originalTimeout;
  }
});

test('preserves HTTP status when the simulated token count request fails', async () => {
  const prepared = prepareSummaryRequest(
    [{ number: 1, text: 'The hamstring supports movement.', usable: true }],
    'gemini-3.8-flash',
  );
  await assert.rejects(
    countSummaryTokens(prepared, 'test-api-key', async () =>
      new Response('private provider details', { status: 400 })),
    error => {
      assert.equal(error.status, 400);
      assert.equal(error.message, 'Gemini token count failed');
      assert.equal(error.message.includes('private provider details'), false);
      return true;
    },
  );
});

test('uses conservative scheduled Flash pricing and safe integer rounding', () => {
  assert.equal(isSupportedFlashModel('gemini-3.5-flash'), true);
  assert.equal(isSupportedFlashModel('gemini-3.6-flash'), true);
  assert.equal(isSupportedFlashModel('gemini-3.8-flash'), true);
  assert.equal(isSupportedFlashModel('gemini-other'), false);
  assert.equal(calculateMaximumCostMicroUsd('gemini-3.5-flash', 1), 61442);
  assert.equal(calculateMaximumCostMicroUsd('gemini-3.6-flash', 1000), 62940);
  assert.equal(calculateMaximumCostMicroUsd('gemini-3.8-flash', 3), 61445);
  assert.throws(() => calculateMaximumCostMicroUsd('gemini-other', 100), /Unsupported/);
  assert.throws(() => calculateMaximumCostMicroUsd('gemini-3.8-flash', -1), /Invalid token count/);
});

test('reuses the prepared payload for generation and identifies simulated 503', async () => {
  const prepared = prepareSummaryRequest(
    [{ number: 1, text: 'The hamstring supports movement.', usable: true }],
    'gemini-3.6-flash',
  );
  let generationBody;
  await assert.rejects(
    generateSummary(
      [{ number: 1, text: 'The hamstring supports movement.', usable: true }],
      'test-api-key',
      async (_url, options) => {
        generationBody = JSON.parse(options.body);
        return new Response('private provider details', { status: 503 });
      },
      prepared,
    ),
    error => error.status === 503,
  );
  assert.deepEqual(generationBody, prepared.payload);
});
