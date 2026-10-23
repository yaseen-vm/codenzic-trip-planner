import {
  fetchPlaceDetails,
  fetchSuggestions,
  parseSuggestions,
  PlacesError,
} from '../../src/services/placesApi';

const okResponse = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body }) as unknown as Response;
const failResponse = (status: number) =>
  ({ ok: false, status, json: async () => ({}) }) as unknown as Response;

const prediction = (placeId: unknown, text: unknown) => ({
  placePrediction: { placeId, text: { text } },
});

describe('parseSuggestions', () => {
  test('maps predictions to id and description', () => {
    expect(parseSuggestions({ suggestions: [prediction('p', 'Kochi')] })).toEqual([
      { placeId: 'p', description: 'Kochi' },
    ]);
  });

  test('treats a missing suggestions key as a valid empty result', () => {
    expect(parseSuggestions({})).toEqual([]);
  });

  test('skips entries that are not place predictions (e.g. query predictions)', () => {
    expect(parseSuggestions({ suggestions: [{ queryPrediction: {} }, null] })).toEqual([]);
  });

  test.each([null, undefined, 'x', 5])('rejects a non-object payload (%p)', (payload) => {
    expect(() => parseSuggestions(payload)).toThrow(PlacesError);
  });

  test('rejects a non-array suggestions field', () => {
    expect(() => parseSuggestions({ suggestions: 'x' })).toThrow(PlacesError);
  });

  test.each([
    [prediction(1, 'Kochi')],
    [prediction('p', undefined)],
    [{ placePrediction: { placeId: 'p' } }],
  ])('rejects a prediction with missing or mistyped fields (%j)', (item) => {
    expect(() => parseSuggestions({ suggestions: [item] })).toThrow(PlacesError);
  });
});

describe('fetchSuggestions', () => {
  const options = { query: 'koc', apiKey: 'key', sessionToken: 'tok' };

  test('posts the query and session token with the key and field mask', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(okResponse({}));
    await fetchSuggestions({ ...options, fetchImpl });

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://places.googleapis.com/v1/places:autocomplete');
    expect(init.method).toBe('POST');
    expect(init.headers['X-Goog-Api-Key']).toBe('key');
    expect(init.headers['X-Goog-FieldMask']).toContain('suggestions.placePrediction.placeId');
    expect(JSON.parse(init.body)).toEqual({ input: 'koc', sessionToken: 'tok' });
  });

  test('passes the abort signal through to fetch', async () => {
    const controller = new AbortController();
    const fetchImpl = jest.fn().mockResolvedValue(okResponse({}));
    await fetchSuggestions({ ...options, signal: controller.signal, fetchImpl });
    expect(fetchImpl.mock.calls[0][1].signal).toBe(controller.signal);
  });

  test('returns parsed suggestions', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(okResponse({ suggestions: [prediction('p', 'Kochi')] }));
    await expect(fetchSuggestions({ ...options, fetchImpl })).resolves.toEqual([
      { placeId: 'p', description: 'Kochi' },
    ]);
  });

  test('throws a PlacesError carrying the status on HTTP failure', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(failResponse(403));
    await expect(fetchSuggestions({ ...options, fetchImpl })).rejects.toThrow(
      'Places autocomplete failed (403)',
    );
  });

  test('propagates network failures untouched', async () => {
    const fetchImpl = jest.fn().mockRejectedValue(new TypeError('network'));
    await expect(fetchSuggestions({ ...options, fetchImpl })).rejects.toBeInstanceOf(TypeError);
  });

  test('falls back to the global fetch', async () => {
    const original = global.fetch;
    global.fetch = jest.fn().mockResolvedValue(okResponse({}));
    try {
      await expect(fetchSuggestions(options)).resolves.toEqual([]);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    } finally {
      global.fetch = original;
    }
  });
});

describe('fetchPlaceDetails', () => {
  const place = { placeId: 'abc/123', description: 'Fallback, City' };
  const details = { formattedAddress: '1 Main St', location: { latitude: 1, longitude: 2 } };
  const options = { place, apiKey: 'key' };

  test('encodes the place id and sends the key and field mask', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(okResponse(details));
    await fetchPlaceDetails({ ...options, fetchImpl });

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://places.googleapis.com/v1/places/abc%2F123');
    expect(init.headers['X-Goog-Api-Key']).toBe('key');
    expect(init.headers['X-Goog-FieldMask']).toBe('formattedAddress,location,displayName');
  });

  test('appends the session token so details are billed with the autocomplete session', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(okResponse(details));
    await fetchPlaceDetails({ ...options, sessionToken: 'a b', fetchImpl });
    expect(fetchImpl.mock.calls[0][0]).toBe(
      'https://places.googleapis.com/v1/places/abc%2F123?sessionToken=a%20b',
    );
  });

  test('prefers the formatted address, then the display name, then the suggestion text', async () => {
    const withAddress = jest.fn().mockResolvedValue(okResponse(details));
    expect((await fetchPlaceDetails({ ...options, fetchImpl: withAddress })).label).toBe(
      '1 Main St',
    );

    const withName = jest
      .fn()
      .mockResolvedValue(okResponse({ location: details.location, displayName: { text: 'Cafe' } }));
    expect((await fetchPlaceDetails({ ...options, fetchImpl: withName })).label).toBe('Cafe');

    const bare = jest.fn().mockResolvedValue(okResponse({ location: details.location }));
    expect((await fetchPlaceDetails({ ...options, fetchImpl: bare })).label).toBe('Fallback, City');
  });

  test('returns the coordinates', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(okResponse(details));
    await expect(fetchPlaceDetails({ ...options, fetchImpl })).resolves.toEqual({
      label: '1 Main St',
      latitude: 1,
      longitude: 2,
    });
  });

  test('keeps a coordinate of 0,0', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(okResponse({ location: { latitude: 0, longitude: 0 } }));
    const result = await fetchPlaceDetails({ ...options, fetchImpl });
    expect([result.latitude, result.longitude]).toEqual([0, 0]);
  });

  test('throws on HTTP failure', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(failResponse(404));
    await expect(fetchPlaceDetails({ ...options, fetchImpl })).rejects.toThrow(PlacesError);
  });

  test.each([{}, { location: {} }, { location: { latitude: '1', longitude: 2 } }, null])(
    'throws when coordinates are missing or malformed (%j)',
    async (body) => {
      const fetchImpl = jest.fn().mockResolvedValue(okResponse(body));
      await expect(fetchPlaceDetails({ ...options, fetchImpl })).rejects.toThrow(
        'Coordinates were not returned',
      );
    },
  );
});
