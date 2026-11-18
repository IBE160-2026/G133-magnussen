import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/study.mjs';

test('logs only a safe category when Gemini fails', async () => {
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  const originalTimeout = AbortSignal.timeout;
  const originalEnv = { ...process.env };
  const logs = [];
  const timeouts = [];
  const apiKey = 'secret-test-api-key';
  const pdfText = 'confidential extracted PDF page text';
  try {
    Object.assign(process.env, {
      APP_ORIGIN: 'https://example.test',
      GEMINI_API_KEY: apiKey,
      GEMINI_BUDGET_ID: 'test-budget',
      GEMINI_BUDGET_MICRO_USD: '100',
      GEMINI_MAX_REQUEST_MICRO_USD: '10',
      UPSTASH_REDIS_REST_URL: 'https://redis.example.test',
      UPSTASH_REDIS_REST_TOKEN: 'test-redis-token',
    });
    AbortSignal.timeout = milliseconds => {
      timeouts.push(milliseconds);
      return originalTimeout(milliseconds);
    };
    globalThis.fetch = async url => {
      if (String(url).startsWith('https://redis.example.test')) {
        return new Response(JSON.stringify({ result: [1, 7] }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
      const error = new Error(`${apiKey} ${pdfText}`);
      error.name = 'TimeoutError';
      throw error;
    };
    console.error = (...values) => logs.push(values.join(' '));
    const res = {
      statusCode: undefined,
      body: undefined,
      setHeader() {},
      status(code) { this.statusCode = code; return this; },
      json(body) { this.body = body; return this; },
    };
    await handler({
      method: 'POST',
      headers: { host: 'example.test', origin: 'https://example.test' },
      body: {
        pages: [{ number: 1, text: pdfText }],
        useAi: true,
        session: '00000000-0000-0000-0000-000000000001',
      },
    }, res);

    assert.equal(res.statusCode, 200);
    assert.match(res.body.summaryStatus, /mislyktes/i);
    assert.deepEqual(logs, ['Study generation failed: TimeoutError']);
    assert.ok(timeouts.includes(100_000));
    assert.equal(logs.join(' ').includes(apiKey), false);
    assert.equal(logs.join(' ').includes(pdfText), false);
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalError;
    AbortSignal.timeout = originalTimeout;
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
  }
});
