import assert from 'node:assert/strict';
import test from 'node:test';
import { generateGroqSummary, prepareGroqRequest, GROQ_MODEL, GROQ_MAX_OUTPUT_TOKENS } from './groq-summary.mjs';

const pages = [{ number: 1, text: 'The hamstring supports movement.', usable: true }];

function responseData(overrides = {}) {
  return {
    summary: [{ title: 'Summary', text: 'Supports movement.', sources: [{ page: 1, excerpt: 'hamstring supports movement' }] }],
    keyConcepts: [{ title: 'Concept', text: 'A concept.', sources: [{ page: 1, excerpt: 'hamstring supports movement' }] }],
    flashcards: [{ title: 'Flashcard', text: 'Movement.', sources: [{ page: 1, excerpt: 'hamstring supports movement' }] }],
    quiz: [{ title: 'What supports movement?', text: 'Movement.', sources: [{ page: 1, excerpt: 'hamstring supports movement' }], options: ['Hearing', 'Movement', 'Vision'], answer: 1 }],
    ...overrides,
  };
}

test('prepares the fixed Groq model and bounded JSON request', () => {
  const prepared = prepareGroqRequest(pages);
  assert.equal(prepared.payload.model, GROQ_MODEL);
  assert.equal(prepared.payload.max_tokens, GROQ_MAX_OUTPUT_TOKENS);
  assert.equal(prepared.payload.response_format.type, 'json_object');
  assert.equal(prepared.payload.messages[1].role, 'user');
});

test('normalizes valid Groq JSON including keyConcepts compatibility', async () => {
  let options;
  const result = await generateGroqSummary(pages, 'groq-test-key', async (_url, requestOptions) => {
    options = requestOptions;
    return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(responseData()) } }] }), { status: 200 });
  });
  assert.equal(options.headers.Authorization, 'Bearer groq-test-key');
  assert.equal(options.headers['Content-Type'], 'application/json');
  assert.equal(result.summary[0].sources[0].verified, true);
  assert.equal(result.concepts[0].title, 'Concept');
  assert.equal(result.flashcards.length, 1);
  assert.equal(result.quiz.length, 1);
});

test('rejects invalid sources and malformed JSON', async () => {
  await assert.rejects(
    generateGroqSummary(pages, 'groq-test-key', async () => new Response('not JSON', { status: 200 })),
    error => {
      assert.match(error.message, /ugyldig JSON/i);
      assert.equal(error.status, 200);
      assert.equal(error.validationFailure, 'invalid-json');
      return true;
    },
  );
  await assert.rejects(
    generateGroqSummary(pages, 'groq-test-key', async () => new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify(responseData({
        keyConcepts: [{ title: 'Bad', text: 'Bad.', sources: [{ page: 2, excerpt: 'missing page' }] }],
      })) } }],
    }), { status: 200 })),
    error => {
      assert.match(error.message, /mangler gyldige kilder/i);
      assert.equal(error.status, 200);
      assert.equal(error.validationFailure, 'source-format');
      return true;
    },
  );
  await assert.rejects(
    generateGroqSummary(pages, 'groq-test-key', async () => new Response(JSON.stringify({
      choices: [{ message: { content: 'not json' } }],
    }), { status: 200 })),
    error => {
      assert.match(error.message, /ugyldig JSON/i);
      assert.equal(error.status, 200);
      assert.equal(error.validationFailure, 'invalid-json');
      return true;
    },
  );
  await assert.rejects(
    generateGroqSummary(pages, 'groq-test-key', async () => new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify(responseData({
        keyConcepts: [{ title: 'Bad', text: 'Bad.', sources: [{ page: 1, excerpt: 'not present on this page' }] }],
      })) } }],
    }), { status: 200 })),
    error => {
      assert.match(error.message, /mangler gyldige kilder/i);
      assert.equal(error.status, 200);
      assert.equal(error.validationFailure, 'source-unverified');
      return true;
    },
  );
});

test('classifies invalid resource shape separately from source validation', async () => {
  await assert.rejects(
    generateGroqSummary(pages, 'groq-test-key', async () => new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify(responseData({ summary: { title: 'Not a list' } })) } }],
    }), { status: 200 })),
    error => {
      assert.equal(error.status, 200);
      assert.equal(error.validationFailure, 'resource-format');
      return true;
    },
  );
});

test('preserves HTTP 429 safely and rejects missing key', async () => {
  await assert.rejects(
    generateGroqSummary(pages, 'groq-test-key', async () => new Response(
      JSON.stringify({ error: { message: 'secret groq private PDF text' } }),
      { status: 429 },
    )),
    error => {
      assert.equal(error.status, 429);
      assert.equal(error.model, GROQ_MODEL);
      assert.equal(error.operation, 'chatCompletion');
      assert.equal(error.message.includes('private PDF text'), false);
      return true;
    },
  );
  await assert.rejects(generateGroqSummary(pages, ''), /API-nøkkel mangler/i);
});

test('rejects input above 30,000 characters', () => {
  assert.throws(
    () => prepareGroqRequest([{ number: 1, text: 'x'.repeat(30_001), usable: true }]),
    /overskrider/,
  );
});
