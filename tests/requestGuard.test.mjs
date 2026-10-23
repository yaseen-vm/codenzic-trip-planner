import assert from 'node:assert/strict';
import test from 'node:test';
import { isCurrentRequest } from '../utils/requestGuard.mjs';

test('allows the latest autocomplete request to update results', () => {
  assert.equal(isCurrentRequest(3, 3), true);
});

test('ignores a stale autocomplete response after a newer query starts', () => {
  assert.equal(isCurrentRequest(2, 3), false);
});
