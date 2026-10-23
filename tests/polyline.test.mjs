import assert from 'node:assert/strict';
import test from 'node:test';
import { decodePolyline } from '../utils/polyline.mjs';

test('decodes the standard encoded polyline example', () => {
  assert.deepEqual(decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq'), [
    { latitude: 38.5, longitude: -120.2 },
    { latitude: 40.7, longitude: -120.95 },
    { latitude: 43.252, longitude: -126.453 },
  ]);
});

test('returns an empty list for an empty route', () => {
  assert.deepEqual(decodePolyline(''), []);
});

test('rejects truncated or invalid encoded polylines', () => {
  assert.throws(() => decodePolyline('_'), /Invalid encoded polyline/);
  assert.throws(() => decodePolyline('~'), /Invalid encoded polyline/);
  assert.throws(() => decodePolyline(null), /must be a string/);
});
