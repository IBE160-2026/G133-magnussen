import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/study.mjs';

const session = '00000000-0000-0000-0000-000000000001';
const pdfText = 'confidential extracted PDF page text hamstring supports movement';

function baseEnv() {
  return {
    APP_ORIGIN: 'https://example.test',
    GEMINI_API_KEY: 'secret-test-api-key',
    GEMINI_MODEL: 'gemini-3.6-flash',
    GEMINI_BUDGET_ID: 'test-budget',
    GEMINI_BUDGET_MICRO_USD: '100000',
    UPSTASH_REDIS_REST_URL: 'https://redis.example.test',
    UPSTASH_REDIS_REST_TOKEN: 'test-redis-token',
  };
}

function requestFor(body = {}) {
  return {
    method: 'POST',
    headers: { host: 'example.test', origin: 'https://example.test' },
    body: {
      pages: [{ number: 1, text: pdfText, ...body.pages?.[0] }],
      useAi: true,
      session,
      ...body,
    },
  };
}

function responseRecorder() {
  return {
    statusCode: undefined,
    body: undefined,
    setHeader() {},
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

async function withMockedEnvironment(run) {
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  const originalTimeout = AbortSignal.timeout;
  const originalEnv = { ...process.env };
  try {
    Object.assign(process.env, baseEnv());
    await run({ originalFetch, originalError, originalTimeout });
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalError;
    AbortSignal.timeout = originalTimeout;
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
  }
}

test('counts the complete payload, reserves first, and handles simulated 503 safely', async () => {
  await withMockedEnvironment(async () => {
    const events = [];
    let countBody;
    let generationBody;
    let redisBody;
    globalThis.fetch = async (url, options = {}) => {
      const address = String(url);
      if (address === 'https://redis.example.test') {
        events.push('redis');
        redisBody = JSON.parse(options.body);
        return new Response(JSON.stringify({ result: [1, 7] }), { status: 200 });
      }
      if (address.includes(':countTokens')) {
        events.push('count');
        countBody = JSON.parse(options.body);
        return new Response(JSON.stringify({ totalTokens: 1000 }), { status: 200 });
      }
      if (address.includes(':generateContent')) {
        events.push('generate');
        generationBody = JSON.parse(options.body);
        return new Response('private provider response', { status: 503 });
      }
      throw new Error('Unexpected network request');
    };
    const logs = [];
    console.error = (...values) => logs.push(values.join(' '));
    const res = responseRecorder();
    await handler(requestFor(), res);

    assert.deepEqual(events, ['count', 'redis', 'generate']);
    assert.deepEqual(countBody.generateContentRequest, generationBody);
    assert.ok(generationBody.systemInstruction);
    assert.ok(generationBody.contents);
    assert.ok(generationBody.generationConfig.responseSchema);
    assert.equal(generationBody.generationConfig.maxOutputTokens, 8192);
    assert.equal(redisBody[5], '62940');
    assert.match(res.body.summaryStatus, /midlertidig utilgjengelig/i);
    assert.match(res.body.summaryStatus, /fortsatt åpne PDF-sidene/i);
    assert.equal(logs.join(' ').includes('secret-test-api-key'), false);
    assert.equal(logs.join(' ').includes(pdfText), false);
  });
});

test('unsupported model fails closed before count or Redis', async () => {
  await withMockedEnvironment(async () => {
    process.env.GEMINI_MODEL = 'gemini-unpriced';
    let providerOrRedisCalled = false;
    globalThis.fetch = async () => {
      providerOrRedisCalled = true;
      throw new Error('unexpected network call');
    };
    const res = responseRecorder();
    await handler(requestFor(), res);
    assert.equal(providerOrRedisCalled, false);
    assert.match(res.body.summaryStatus, /ikke støttet/i);
  });
});

test('invalid count fails closed before Redis or generation', async () => {
  await withMockedEnvironment(async () => {
    let redisCalled = false;
    let generationCalled = false;
    globalThis.fetch = async (url, options = {}) => {
      const address = String(url);
      if (address === 'https://redis.example.test') {
        redisCalled = true;
      }
      if (address.includes(':countTokens')) {
        return new Response(JSON.stringify({ totalTokens: 0 }), { status: 200 });
      }
      if (address.includes(':generateContent')) generationCalled = true;
      throw new Error('unexpected network call');
    };
    const res = responseRecorder();
    await handler(requestFor(), res);
    assert.equal(redisCalled, false);
    assert.equal(generationCalled, false);
    assert.match(res.body.summaryStatus, /Ingen kostnad er blitt reservert/i);
  });
});

test('count endpoint failure fails closed and is explicit', async () => {
  await withMockedEnvironment(async () => {
    let redisCalled = false;
    globalThis.fetch = async url => {
      if (String(url).includes(':countTokens')) return new Response('private', { status: 500 });
      redisCalled = true;
      throw new Error('unexpected network call');
    };
    const res = responseRecorder();
    await handler(requestFor(), res);
    assert.equal(redisCalled, false);
    assert.match(res.body.summaryStatus, /kunne ikke forberedes/i);
  });
});

test('budget contention prevents generation and preserves historical keys', async () => {
  await withMockedEnvironment(async () => {
    let generationCalled = false;
    globalThis.fetch = async (url, options = {}) => {
      const address = String(url);
      if (address.includes(':countTokens')) {
        return new Response(JSON.stringify({ totalTokens: 100 }), { status: 200 });
      }
      if (address === 'https://redis.example.test') {
        const body = JSON.parse(options.body);
        assert.equal(body[0], 'EVAL');
        assert.equal(body[2], 2);
        assert.deepEqual(body.slice(3, 5), [
          'study:session:test-budget:' + session,
          'study:budget:test-budget',
        ]);
        return new Response(JSON.stringify({ result: [-1, 7] }), { status: 200 });
      }
      if (address.includes(':generateContent')) generationCalled = true;
      throw new Error('unexpected network call');
    };
    const res = responseRecorder();
    await handler(requestFor(), res);
    assert.equal(generationCalled, false);
    assert.match(res.body.summaryStatus, /kostnadstak is? reached|kostnadstak er nådd/i);
  });
});

test('eight-request limit prevents generation', async () => {
  await withMockedEnvironment(async () => {
    let generationCalled = false;
    globalThis.fetch = async (url) => {
      const address = String(url);
      if (address.includes(':countTokens')) {
        return new Response(JSON.stringify({ totalTokens: 100 }), { status: 200 });
      }
      if (address === 'https://redis.example.test') {
        return new Response(JSON.stringify({ result: [0, 0] }), { status: 200 });
      }
      if (address.includes(':generateContent')) generationCalled = true;
      throw new Error('unexpected network call');
    };
    const res = responseRecorder();
    await handler(requestFor(), res);
    assert.equal(generationCalled, false);
    assert.match(res.body.summaryStatus, /åtte KI-forespørslene/i);
  });
});

test('logs only a safe category when generation throws', async () => {
  await withMockedEnvironment(async () => {
    const logs = [];
    console.error = (...values) => logs.push(values.join(' '));
    globalThis.fetch = async (url) => {
      const address = String(url);
      if (address.includes(':countTokens')) return new Response(JSON.stringify({ totalTokens: 100 }), { status: 200 });
      if (address === 'https://redis.example.test') return new Response(JSON.stringify({ result: [1, 7] }), { status: 200 });
      if (address.includes(':generateContent')) {
        const error = new Error('secret-test-api-key confidential extracted PDF page text');
        error.name = 'TimeoutError';
        throw error;
      }
      throw new Error('unexpected network call');
    };
    const res = responseRecorder();
    await handler(requestFor(), res);
    assert.match(res.body.summaryStatus, /mislyktes/i);
    assert.deepEqual(logs, ['Study generation failed: TimeoutError']);
  });
});
