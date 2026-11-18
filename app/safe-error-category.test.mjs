import assert from 'node:assert/strict';
import test from 'node:test';
import { safeErrorCategory } from './safe-error-category.mjs';

test('returns only allowlisted error names and network codes', () => {
  assert.equal(safeErrorCategory(Object.assign(new Error('secret'), { name: 'TimeoutError' })), 'TimeoutError');
  assert.equal(safeErrorCategory(Object.assign(new Error('secret'), { name: 'AbortError' })), 'AbortError');
  for (const code of ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND']) {
    assert.equal(safeErrorCategory(Object.assign(new Error('secret'), { cause: { code } })), code);
  }
  assert.equal(safeErrorCategory(Object.assign(new Error('secret'), { cause: { code: 'secret PDF text' } })), 'Error');
});
