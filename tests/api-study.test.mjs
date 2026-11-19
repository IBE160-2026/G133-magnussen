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

test('counts the complete payload and atomically reserves before the 503 retry', async () => {
  await withMockedEnvironment(async () => {
    let now = 0;
    const timeoutsBySignal = new WeakMap();
    AbortSignal.timeout = milliseconds => {
      const signal = new AbortController().signal;
      timeoutsBySignal.set(signal, milliseconds);
      return signal;
    };
    const events = [];
    let countBody;
    const generationBodies = [];
    const generationTimeouts = [];
    const redisBodies = [];
    globalThis.fetch = async (url, options = {}) => {
      const address = String(url);
      if (address === 'https://redis.example.test') {
        events.push('redis');
        redisBodies.push(JSON.parse(options.body));
        const remaining = redisBodies.length === 1 ? 7 : 6;
        return new Response(JSON.stringify({ result: [1, remaining] }), { status: 200 });
      }
      if (address.includes(':countTokens')) {
        events.push('count');
        countBody = JSON.parse(options.body);
        return new Response(JSON.stringify({ totalTokens: 1000 }), { status: 200 });
      }
      if (address.includes(':generateContent')) {
        events.push('generate');
        generationTimeouts.push(timeoutsBySignal.get(options.signal));
        generationBodies.push(JSON.parse(options.body));
        if (generationBodies.length === 1) {
          now = 80_000;
          return new Response(JSON.stringify({
            error: {
              code: 503,
              message: `secret-test-api-key ${pdfText} generated answer must not be logged`,
            },
          }), { status: 503 });
        }
        const item = { title: 'Study item', text: 'Short explanation.', sources: [{ page: 1, excerpt: 'hamstring supports movement' }] };
        return new Response(JSON.stringify({
          candidates: [{ content: { parts: [{ text: JSON.stringify({
            summary: [item],
            concepts: [item],
            flashcards: [item],
            quiz: [],
          }) }] } }],
        }), { status: 200 });
      }
      throw new Error('Unexpected network request');
    };
    const logs = [];
    console.error = (...values) => logs.push(values.join(' '));
    const res = responseRecorder();
    await handler(requestFor(), res, {
      now: () => now,
      sleep: async milliseconds => {
        events.push('wait');
        assert.equal(milliseconds, 1_000);
        now += milliseconds;
      },
    });

    assert.deepEqual(events, ['count', 'redis', 'generate', 'wait', 'redis', 'generate']);
    assert.deepEqual(countBody.generateContentRequest, {
      ...generationBodies[0],
      model: 'models/gemini-3.6-flash',
    });
    assert.deepEqual(generationBodies[1], generationBodies[0]);
    assert.deepEqual(generationTimeouts, [100_000, 29_000]);
    assert.ok(generationBodies[0].systemInstruction);
    assert.ok(generationBodies[0].contents);
    assert.ok(generationBodies[0].generationConfig.responseSchema);
    assert.equal(generationBodies[0].generationConfig.maxOutputTokens, 8192);
    assert.equal(redisBodies.length, 2);
    for (const redisBody of redisBodies) {
      assert.equal(redisBody[5], '62940');
      assert.equal(redisBody[2], 2);
      assert.deepEqual(redisBody.slice(3, 5), [
        'study:session:test-budget:' + session,
        'study:budget:test-budget',
      ]);
    }
    assert.equal(res.body.remainingRequests, 6);
    assert.match(res.body.summaryStatus, /omforsøket lyktes/i);
    assert.deepEqual(logs, [
      'Gemini request failed: model=gemini-3.6-flash operation=generateContent ' +
      'httpStatus=503 googleErrorCode=503 category=Error',
    ]);
    assert.equal(logs.join(' ').includes('secret-test-api-key'), false);
    assert.equal(logs.join(' ').includes(pdfText), false);
    assert.equal(logs.join(' ').includes('generated answer'), false);
  });
});

test('retries one simulated countTokens 503 and reports recovery to the user', async () => {
  await withMockedEnvironment(async () => {
    let now = 0;
    const events = [];
    let countCalls = 0;
    globalThis.fetch = async url => {
      const address = String(url);
      if (address.includes(':countTokens')) {
        countCalls += 1;
        events.push('count');
        if (countCalls === 1) return new Response(JSON.stringify({ error: { code: 503 } }), { status: 503 });
        return new Response(JSON.stringify({ totalTokens: 100 }), { status: 200 });
      }
      if (address === 'https://redis.example.test') {
        events.push('redis');
        return new Response(JSON.stringify({ result: [1, 7] }), { status: 200 });
      }
      if (address.includes(':generateContent')) {
        events.push('generate');
        const item = { title: 'Study item', text: 'Short explanation.', sources: [{ page: 1, excerpt: 'hamstring supports movement' }] };
        return new Response(JSON.stringify({
          candidates: [{ content: { parts: [{ text: JSON.stringify({
            summary: [item], concepts: [item], flashcards: [item], quiz: [],
          }) }] } }],
        }), { status: 200 });
      }
      throw new Error('Unexpected network request');
    };
    const logs = [];
    console.error = (...values) => logs.push(values.join(' '));
    const res = responseRecorder();
    await handler(requestFor(), res, {
      now: () => now,
      sleep: async milliseconds => {
        events.push('wait');
        now += milliseconds;
      },
    });

    assert.deepEqual(events, ['count', 'wait', 'count', 'redis', 'generate']);
    assert.equal(res.body.summaryStatus, 'Gemini var midlertidig utilgjengelig under forberedelsen, men omforsøket lyktes.');
    assert.deepEqual(logs, [
      'Gemini request failed: model=gemini-3.6-flash operation=countTokens ' +
      'httpStatus=503 googleErrorCode=503 category=Error',
    ]);
  });
});

test('stops after the single countTokens retry also returns 503', async () => {
  await withMockedEnvironment(async () => {
    let now = 0;
    let countCalls = 0;
    let redisOrGenerationCalled = false;
    const logs = [];
    console.error = (...values) => logs.push(values.join(' '));
    globalThis.fetch = async url => {
      if (String(url).includes(':countTokens')) {
        countCalls += 1;
        return new Response(JSON.stringify({ error: { code: 503 } }), { status: 503 });
      }
      redisOrGenerationCalled = true;
      throw new Error('unexpected network call');
    };
    const res = responseRecorder();
    await handler(requestFor(), res, {
      now: () => now,
      sleep: async milliseconds => { now += milliseconds; },
    });

    assert.equal(countCalls, 2);
    assert.equal(redisOrGenerationCalled, false);
    assert.match(res.body.summaryStatus, /fortsatt midlertidig utilgjengelig etter ett omforsøk/i);
    assert.equal(res.body.summaryStatus.includes('Ingen kostnad er reservert'), true);
    assert.equal(logs.length, 2);
    assert.equal(logs.every(line => line.includes('operation=countTokens') && line.includes('httpStatus=503')), true);
  });
});

test('skips the countTokens retry when execution time is insufficient', async () => {
  await withMockedEnvironment(async () => {
    let now = 0;
    let countCalls = 0;
    let redisOrGenerationCalled = false;
    let waited = false;
    globalThis.fetch = async url => {
      if (String(url).includes(':countTokens')) {
        countCalls += 1;
        now = 104_001;
        return new Response(JSON.stringify({ error: { code: 503 } }), { status: 503 });
      }
      redisOrGenerationCalled = true;
      throw new Error('unexpected network call');
    };
    const res = responseRecorder();
    await handler(requestFor(), res, {
      now: () => now,
      sleep: async () => { waited = true; },
    });

    assert.equal(countCalls, 1);
    assert.equal(waited, false);
    assert.equal(redisOrGenerationCalled, false);
    assert.match(res.body.summaryStatus, /tidsgrensen/i);
  });
});

test('uses the single retry for countTokens and does not retry a later generation 503', async () => {
  await withMockedEnvironment(async () => {
    let now = 0;
    let countCalls = 0;
    let generationCalls = 0;
    let reservationCalls = 0;
    globalThis.fetch = async url => {
      const address = String(url);
      if (address.includes(':countTokens')) {
        countCalls += 1;
        if (countCalls === 1) return new Response(JSON.stringify({ error: { code: 503 } }), { status: 503 });
        return new Response(JSON.stringify({ totalTokens: 100 }), { status: 200 });
      }
      if (address === 'https://redis.example.test') {
        reservationCalls += 1;
        return new Response(JSON.stringify({ result: [1, 7] }), { status: 200 });
      }
      if (address.includes(':generateContent')) {
        generationCalls += 1;
        return new Response(JSON.stringify({ error: { code: 503 } }), { status: 503 });
      }
      throw new Error('Unexpected network request');
    };
    const res = responseRecorder();
    await handler(requestFor(), res, {
      now: () => now,
      sleep: async milliseconds => { now += milliseconds; },
    });

    assert.equal(countCalls, 2);
    assert.equal(reservationCalls, 1);
    assert.equal(generationCalls, 1);
    assert.match(res.body.summaryStatus, /allerede brukt/i);
  });
});

test('stops after one generation retry when Gemini returns a second simulated 503', async () => {
  await withMockedEnvironment(async () => {
    let generationCalls = 0;
    let reservationCalls = 0;
    globalThis.fetch = async url => {
      const address = String(url);
      if (address.includes(':countTokens')) return new Response(JSON.stringify({ totalTokens: 100 }), { status: 200 });
      if (address === 'https://redis.example.test') {
        reservationCalls += 1;
        return new Response(JSON.stringify({ result: [1, 8 - reservationCalls] }), { status: 200 });
      }
      if (address.includes(':generateContent')) {
        generationCalls += 1;
        return new Response(JSON.stringify({ error: { code: 503 } }), { status: 503 });
      }
      throw new Error('Unexpected network request');
    };
    const res = responseRecorder();
    await handler(requestFor(), res, { sleep: async () => {} });

    assert.equal(generationCalls, 2);
    assert.equal(reservationCalls, 2);
    assert.match(res.body.summaryStatus, /etter ett omforsøk/i);
  });
});

test('does not send a generation retry when its atomic reservation is blocked', async t => {
  for (const [name, redisResult, expected] of [
    ['request limit', [0, 0], /åtte KI-forespørslene/i],
    ['budget', [-1, 6], /kostnadstak/i],
  ]) {
    await t.test(name, async () => {
      await withMockedEnvironment(async () => {
        let generationCalls = 0;
        let reservationCalls = 0;
        globalThis.fetch = async url => {
          const address = String(url);
          if (address.includes(':countTokens')) return new Response(JSON.stringify({ totalTokens: 100 }), { status: 200 });
          if (address === 'https://redis.example.test') {
            reservationCalls += 1;
            const result = reservationCalls === 1 ? [1, 7] : redisResult;
            return new Response(JSON.stringify({ result }), { status: 200 });
          }
          if (address.includes(':generateContent')) {
            generationCalls += 1;
            return new Response(JSON.stringify({ error: { code: 503 } }), { status: 503 });
          }
          throw new Error('Unexpected network request');
        };
        const res = responseRecorder();
        await handler(requestFor(), res, { sleep: async () => {} });

        assert.equal(reservationCalls, 2);
        assert.equal(generationCalls, 1);
        assert.match(res.body.summaryStatus, expected);
        assert.match(res.body.summaryStatus, /omforsøket ble stoppet/i);
      });
    });
  }
});

test('does not send a generation retry when its second reservation fails', async () => {
  await withMockedEnvironment(async () => {
    let generationCalls = 0;
    let reservationCalls = 0;
    const logs = [];
    console.error = (...values) => logs.push(values.join(' '));
    globalThis.fetch = async url => {
      const address = String(url);
      if (address.includes(':countTokens')) return new Response(JSON.stringify({ totalTokens: 100 }), { status: 200 });
      if (address === 'https://redis.example.test') {
        reservationCalls += 1;
        if (reservationCalls === 2) return new Response('unavailable', { status: 503 });
        return new Response(JSON.stringify({ result: [1, 7] }), { status: 200 });
      }
      if (address.includes(':generateContent')) {
        generationCalls += 1;
        return new Response(JSON.stringify({ error: { code: 503 } }), { status: 503 });
      }
      throw new Error('Unexpected network request');
    };
    const res = responseRecorder();
    await handler(requestFor(), res, { sleep: async () => {} });

    assert.equal(reservationCalls, 2);
    assert.equal(generationCalls, 1);
    assert.match(res.body.summaryStatus, /omforsøket kunne ikke reserveres trygt/i);
    assert.deepEqual(logs, [
      'Gemini request failed: model=gemini-3.6-flash operation=generateContent ' +
      'httpStatus=503 googleErrorCode=503 category=Error',
      'Study retry reservation failed: Error',
    ]);
  });
});

test('does not send initial generation when reservation leaves insufficient execution time', async () => {
  await withMockedEnvironment(async () => {
    let now = 0;
    let generationCalls = 0;
    let reservationCalls = 0;
    globalThis.fetch = async url => {
      const address = String(url);
      if (address.includes(':countTokens')) return new Response(JSON.stringify({ totalTokens: 100 }), { status: 200 });
      if (address === 'https://redis.example.test') {
        reservationCalls += 1;
        now = 106_000;
        return new Response(JSON.stringify({ result: [1, 7] }), { status: 200 });
      }
      if (address.includes(':generateContent')) {
        generationCalls += 1;
        throw new Error('Generation must not be sent');
      }
      throw new Error('Unexpected network request');
    };
    const res = responseRecorder();
    await handler(requestFor(), res, { now: () => now });

    assert.equal(reservationCalls, 1);
    assert.equal(generationCalls, 0);
    assert.match(res.body.summaryStatus, /kostnaden er reservert.*Vercels tidsgrense/i);
  });
});

test('does not send retry generation when its reservation leaves insufficient execution time', async () => {
  await withMockedEnvironment(async () => {
    let now = 0;
    let generationCalls = 0;
    let reservationCalls = 0;
    globalThis.fetch = async url => {
      const address = String(url);
      if (address.includes(':countTokens')) return new Response(JSON.stringify({ totalTokens: 100 }), { status: 200 });
      if (address === 'https://redis.example.test') {
        reservationCalls += 1;
        if (reservationCalls === 2) now = 105_001;
        return new Response(JSON.stringify({ result: [1, 8 - reservationCalls] }), { status: 200 });
      }
      if (address.includes(':generateContent')) {
        generationCalls += 1;
        now = 80_000;
        return new Response(JSON.stringify({ error: { code: 503 } }), { status: 503 });
      }
      throw new Error('Unexpected network request');
    };
    const res = responseRecorder();
    await handler(requestFor(), res, {
      now: () => now,
      sleep: async milliseconds => { now += milliseconds; },
    });

    assert.equal(reservationCalls, 2);
    assert.equal(generationCalls, 1);
    assert.match(res.body.summaryStatus, /omforsøket er reservert, men Vercels tidsgrense hindret/i);
  });
});

test('skips the generation retry when Vercel execution time is insufficient', async () => {
  await withMockedEnvironment(async () => {
    let now = 0;
    let generationCalls = 0;
    let reservationCalls = 0;
    globalThis.fetch = async url => {
      const address = String(url);
      if (address.includes(':countTokens')) return new Response(JSON.stringify({ totalTokens: 100 }), { status: 200 });
      if (address === 'https://redis.example.test') {
        reservationCalls += 1;
        return new Response(JSON.stringify({ result: [1, 7] }), { status: 200 });
      }
      if (address.includes(':generateContent')) {
        generationCalls += 1;
        now = 95_000;
        return new Response(JSON.stringify({ error: { code: 503 } }), { status: 503 });
      }
      throw new Error('Unexpected network request');
    };
    let waited = false;
    const res = responseRecorder();
    await handler(requestFor(), res, {
      now: () => now,
      sleep: async () => { waited = true; },
    });

    assert.equal(waited, false);
    assert.equal(reservationCalls, 1);
    assert.equal(generationCalls, 1);
    assert.match(res.body.summaryStatus, /Vercels tidsgrense/i);
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
    const logs = [];
    console.error = (...values) => logs.push(values.join(' '));
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
    assert.deepEqual(logs, [
      'Gemini request failed: model=gemini-3.6-flash operation=countTokens ' +
      'httpStatus=200 googleErrorCode=none category=Error',
    ]);
    assert.equal(logs.join(' ').includes('secret-test-api-key'), false);
    assert.equal(logs.join(' ').includes(pdfText), false);
  });
});

test('count endpoint failure fails closed and is explicit', async () => {
  await withMockedEnvironment(async () => {
    let redisCalled = false;
    const logs = [];
    console.error = (...values) => logs.push(values.join(' '));
    globalThis.fetch = async url => {
      if (String(url).includes(':countTokens')) {
        return new Response(JSON.stringify({
          error: {
            code: 429,
            message: `secret-test-api-key ${pdfText} generated answer`,
          },
        }), { status: 500 });
      }
      redisCalled = true;
      throw new Error('unexpected network call');
    };
    const res = responseRecorder();
    await handler(requestFor(), res);
    assert.equal(redisCalled, false);
    assert.match(res.body.summaryStatus, /kunne ikke forberedes/i);
    assert.deepEqual(logs, [
      'Gemini request failed: model=gemini-3.6-flash operation=countTokens ' +
      'httpStatus=500 googleErrorCode=429 category=Error',
    ]);
    assert.equal(logs.join(' ').includes('secret-test-api-key'), false);
    assert.equal(logs.join(' ').includes(pdfText), false);
    assert.equal(logs.join(' ').includes('generated answer'), false);
  });
});

test('malformed token count JSON fails closed and logs only status and category', async () => {
  await withMockedEnvironment(async () => {
    let redisOrGenerationCalled = false;
    const logs = [];
    console.error = (...values) => logs.push(values.join(' '));
    globalThis.fetch = async url => {
      if (String(url).includes(':countTokens')) {
        return new Response('private provider response', { status: 200 });
      }
      redisOrGenerationCalled = true;
      throw new Error('unexpected network call');
    };
    const res = responseRecorder();
    await handler(requestFor(), res);
    assert.equal(redisOrGenerationCalled, false);
    assert.match(res.body.summaryStatus, /ingen kostnad er blitt reservert/i);
    assert.deepEqual(logs, [
      'Gemini request failed: model=gemini-3.6-flash operation=countTokens ' +
      'httpStatus=200 googleErrorCode=none category=Error',
    ]);
    assert.equal(logs.join(' ').includes('secret-test-api-key'), false);
    assert.equal(logs.join(' ').includes(pdfText), false);
    assert.equal(logs.join(' ').includes('private provider response'), false);
  });
});

test('count token network failure logs an allowlisted category without an HTTP status', async () => {
  await withMockedEnvironment(async () => {
    let redisOrGenerationCalled = false;
    const logs = [];
    console.error = (...values) => logs.push(values.join(' '));
    globalThis.fetch = async url => {
      if (String(url).includes(':countTokens')) {
        throw Object.assign(new Error('private provider response'), { name: 'TimeoutError' });
      }
      redisOrGenerationCalled = true;
      throw new Error('unexpected network call');
    };
    const res = responseRecorder();
    await handler(requestFor(), res);
    assert.equal(redisOrGenerationCalled, false);
    assert.match(res.body.summaryStatus, /ingen kostnad er blitt reservert/i);
    assert.deepEqual(logs, [
      'Gemini request failed: model=gemini-3.6-flash operation=countTokens ' +
      'httpStatus=none googleErrorCode=none category=TimeoutError',
    ]);
    assert.equal(logs.join(' ').includes('secret-test-api-key'), false);
    assert.equal(logs.join(' ').includes(pdfText), false);
    assert.equal(logs.join(' ').includes('private provider response'), false);
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

test('logs safe Gemini context when generation throws', async () => {
  await withMockedEnvironment(async () => {
    const logs = [];
    let generationCalls = 0;
    let reservationCalls = 0;
    console.error = (...values) => logs.push(values.join(' '));
    globalThis.fetch = async (url) => {
      const address = String(url);
      if (address.includes(':countTokens')) return new Response(JSON.stringify({ totalTokens: 100 }), { status: 200 });
      if (address === 'https://redis.example.test') {
        reservationCalls += 1;
        return new Response(JSON.stringify({ result: [1, 7] }), { status: 200 });
      }
      if (address.includes(':generateContent')) {
        generationCalls += 1;
        const error = new Error('secret-test-api-key confidential extracted PDF page text');
        error.name = 'TimeoutError';
        throw error;
      }
      throw new Error('unexpected network call');
    };
    const res = responseRecorder();
    await handler(requestFor(), res);
    assert.equal(generationCalls, 1);
    assert.equal(reservationCalls, 1);
    assert.match(res.body.summaryStatus, /mislyktes/i);
    assert.deepEqual(logs, [
      'Gemini request failed: model=gemini-3.6-flash operation=generateContent ' +
      'httpStatus=none googleErrorCode=none category=TimeoutError',
    ]);
  });
});
