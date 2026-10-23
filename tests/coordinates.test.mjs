import assert from 'node:assert/strict';
import test from 'node:test';
import { parseCoordinate } from '../utils/coordinates.mjs';

test('parses ordinary coordinates', () => {
  assert.deepEqual(parseCoordinate('9.9312', '76.2673'), {
    latitude: 9.9312,
    longitude: 76.2673,
  });
});

test('preserves valid zero coordinates', () => {
  assert.deepEqual(parseCoordinate('0', '0'), { latitude: 0, longitude: 0 });
});

test('accepts the inclusive latitude and longitude boundaries', () => {
  assert.deepEqual(parseCoordinate('-90', '-180'), { latitude: -90, longitude: -180 });
  assert.deepEqual(parseCoordinate('90', '180'), { latitude: 90, longitude: 180 });
});

test('rejects missing and blank coordinates', () => {
  assert.equal(parseCoordinate(undefined, '76'), null);
  assert.equal(parseCoordinate('9', undefined), null);
  assert.equal(parseCoordinate('', '76'), null);
  assert.equal(parseCoordinate('9', '  '), null);
});

test('rejects non-finite and out-of-range coordinates', () => {
  assert.equal(parseCoordinate('NaN', '76'), null);
  assert.equal(parseCoordinate('Infinity', '76'), null);
  assert.equal(parseCoordinate('90.01', '76'), null);
  assert.equal(parseCoordinate('9', '-180.01'), null);
});
