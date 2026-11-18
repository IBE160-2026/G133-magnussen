import assert from 'node:assert/strict';
import test from 'node:test';
import { generateSummary } from './gemini-summary.mjs';

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
      async () => new Response('private provider details', { status: 429 }),
    ),
    error => {
      assert.equal(error.message, 'Gemini kunne ikke lage sammendraget. Prøv igjen senere.');
      assert.equal(error.message.includes('private provider details'), false);
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
