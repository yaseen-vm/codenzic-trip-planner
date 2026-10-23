import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchSuggestions, parseSuggestions, PlacesError } from '../utils/places.mjs';

const okResponse = (body) => ({ ok: true, status: 200, json: async () => body });
const options = { query: 'koc', apiKey: 'k', sessionToken: 't' };

test('maps predictions and treats a missing suggestions key as a valid empty result', () => {
  assert.deepEqual(
    parseSuggestions({
      suggestions: [{ placePrediction: { placeId: 'p', text: { text: 'Kochi' } } }],
    }),
    [{ placeId: 'p', description: 'Kochi' }],
  );
  assert.deepEqual(parseSuggestions({}), []);
});

test('rejects malformed payloads instead of returning an empty list', () => {
  assert.throws(() => parseSuggestions(null), PlacesError);
  assert.throws(() => parseSuggestions({ suggestions: 'x' }), PlacesError);
  assert.throws(
    () => parseSuggestions({ suggestions: [{ placePrediction: { placeId: 1 } }] }),
    PlacesError,
  );
});

test('passes the abort signal to fetch', async () => {
  const controller = new AbortController();
  let seen;
  await fetchSuggestions({
    ...options,
    signal: controller.signal,
    fetchImpl: async (_url, init) => {
      seen = init.signal;
      return okResponse({});
    },
  });
  assert.equal(seen, controller.signal);
});

test('throws on HTTP errors and propagates rejected fetches', async () => {
  await assert.rejects(
    fetchSuggestions({ ...options, fetchImpl: async () => ({ ok: false, status: 403 }) }),
    PlacesError,
  );
  await assert.rejects(
    fetchSuggestions({
      ...options,
      fetchImpl: async () => {
        throw new TypeError('network');
      },
    }),
    TypeError,
  );
});
