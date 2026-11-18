import assert from 'node:assert/strict';
import test from 'node:test';
import { logGeminiFailure, safeErrorCategory } from './safe-error-category.mjs';

test('returns only allowlisted error names and network codes', () => {
  assert.equal(safeErrorCategory(Object.assign(new Error('secret'), { name: 'TimeoutError' })), 'TimeoutError');
  assert.equal(safeErrorCategory(Object.assign(new Error('secret'), { name: 'AbortError' })), 'AbortError');
  assert.equal(safeErrorCategory(new Error('outer', {
    cause: Object.assign(new Error('secret'), { name: 'TimeoutError' }),
  })), 'TimeoutError');
  for (const code of ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND']) {
    assert.equal(safeErrorCategory(Object.assign(new Error('secret'), { cause: { code } })), code);
  }
  assert.equal(safeErrorCategory(Object.assign(new Error('secret'), { cause: { code: 'secret PDF text' } })), 'Error');
});

test('logs only validated Gemini diagnostic fields', () => {
  const originalError = console.error;
  const logs = [];
  console.error = (...values) => logs.push(values.join(' '));
  try {
    logGeminiFailure(Object.assign(new Error('secret'), {
      model: 'secret-test-api-key',
      operation: 'generateContent\nPDF text',
      status: 700,
      googleErrorCode: 'private generated response',
    }));
    assert.deepEqual(logs, [
      'Gemini request failed: model=unknown operation=unknown httpStatus=none googleErrorCode=none category=Error',
    ]);
  } finally {
    console.error = originalError;
  }
});
