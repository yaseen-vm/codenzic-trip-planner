import { MAX_ROUTE_STEPS } from '../../src/constants/config';
import {
  buildRoutesRequest,
  classifyTraffic,
  fetchRoute,
  parseSteps,
  RoutesApiError,
} from '../../src/services/routesApi';

const start = { latitude: 9.9, longitude: 76.2 };
const end = { latitude: 10, longitude: 76.3 };
// Encodes the Google documentation example: three points.
const ENCODED = '_p~iF~ps|U_ulLnnqC_mqNvxq`@';

const json = (body: unknown, ok = true, status = 200) =>
  ({ ok, status, json: async () => body }) as unknown as Response;

const route = (overrides: Record<string, unknown> = {}) => ({
  distanceMeters: 5000,
  duration: '600s',
  polyline: { encodedPolyline: ENCODED },
  legs: [{ steps: [] }],
  ...overrides,
});

const call = (fetchImpl: jest.Mock, mode: 'DRIVE' | 'WALK' | 'TWO_WHEELER' = 'DRIVE') =>
  fetchRoute({ start, end, mode, apiKey: 'key', fetchImpl });

describe('buildRoutesRequest', () => {
  test('requests traffic-aware routing with traffic on the polyline for driving', () => {
    const request = buildRoutesRequest(start, end, 'DRIVE');
    expect(request.routingPreference).toBe('TRAFFIC_AWARE');
    expect(request.extraComputations).toEqual(['TRAFFIC_ON_POLYLINE']);
    expect(request.travelMode).toBe('DRIVE');
  });

  test.each(['WALK', 'TWO_WHEELER'] as const)('is traffic-unaware for %s', (mode) => {
    const request = buildRoutesRequest(start, end, mode);
    expect(request.routingPreference).toBe('TRAFFIC_UNAWARE');
    expect(request.extraComputations).toBeUndefined();
  });

  test('sends both endpoints as latLng locations', () => {
    const request = buildRoutesRequest(start, end, 'DRIVE');
    expect(request.origin.location.latLng).toEqual(start);
    expect(request.destination.location.latLng).toEqual(end);
  });

  test('keeps a 0,0 endpoint', () => {
    const origin = { latitude: 0, longitude: 0 };
    expect(buildRoutesRequest(origin, end, 'DRIVE').origin.location.latLng).toEqual(origin);
  });
});

describe('parseSteps', () => {
  test('splits the instruction into a title and a subtitle', () => {
    const [step] = parseSteps([
      {
        distanceMeters: 120,
        navigationInstruction: {
          instructions: 'Turn left\nonto Main St\nTowards the bridge',
          maneuver: 'TURN_LEFT',
        },
      },
    ]);
    expect(step).toEqual({
      title: 'Turn left',
      subtitle: 'onto Main St Towards the bridge',
      distanceMeters: 120,
      maneuver: 'TURN_LEFT',
    });
  });

  test('leaves the subtitle undefined for single-line instructions', () => {
    const [step] = parseSteps([{ navigationInstruction: { instructions: '  Head north  ' } }]);
    expect(step?.title).toBe('Head north');
    expect(step?.subtitle).toBeUndefined();
  });

  test('drops steps without instruction text', () => {
    expect(parseSteps([{}, { navigationInstruction: { instructions: '   ' } }])).toEqual([]);
  });

  test('caps the list at the maximum number of steps', () => {
    const many = Array.from({ length: MAX_ROUTE_STEPS + 5 }, (_, i) => ({
      navigationInstruction: { instructions: `Step ${i}` },
    }));
    const steps = parseSteps(many);
    expect(steps).toHaveLength(MAX_ROUTE_STEPS);
    expect(steps.at(-1)?.title).toBe(`Step ${MAX_ROUTE_STEPS - 1}`);
  });

  test('accepts an undefined list', () => {
    expect(parseSteps()).toEqual([]);
  });
});

describe('classifyTraffic', () => {
  const intervals = (...speeds: string[]) => ({
    travelAdvisory: { speedReadingIntervals: speeds.map((speed) => ({ speed })) },
  });

  test('reports heavy traffic when any interval is a jam, even alongside slow ones', () => {
    expect(classifyTraffic(intervals('NORMAL', 'SLOW', 'TRAFFIC_JAM'))).toBe('heavy');
  });

  test('reports moderate traffic for slow intervals only', () => {
    expect(classifyTraffic(intervals('NORMAL', 'SLOW'))).toBe('moderate');
  });

  test('reports none for normal flow or missing data', () => {
    expect(classifyTraffic(intervals('NORMAL'))).toBe('none');
    expect(classifyTraffic({})).toBe('none');
  });
});

describe('fetchRoute', () => {
  test('posts to the Routes API with the key, field mask and request body', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(json({ routes: [route()] }));
    await call(fetchImpl);

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://routes.googleapis.com/directions/v2:computeRoutes');
    expect(init.method).toBe('POST');
    expect(init.headers['X-Goog-Api-Key']).toBe('key');
    expect(init.headers['X-Goog-FieldMask']).toContain('routes.polyline.encodedPolyline');
    expect(JSON.parse(init.body).travelMode).toBe('DRIVE');
  });

  test('forwards the abort signal', async () => {
    const controller = new AbortController();
    const fetchImpl = jest.fn().mockResolvedValue(json({ routes: [route()] }));
    await fetchRoute({
      start,
      end,
      mode: 'DRIVE',
      apiKey: 'k',
      signal: controller.signal,
      fetchImpl,
    });
    expect(fetchImpl.mock.calls[0][1].signal).toBe(controller.signal);
  });

  test('maps a successful response into a route result', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      json({
        routes: [
          route({
            legs: [
              { steps: [{ navigationInstruction: { instructions: 'Go' }, distanceMeters: 5 }] },
            ],
            travelAdvisory: { speedReadingIntervals: [{ speed: 'SLOW' }] },
          }),
        ],
      }),
    );
    const result = await call(fetchImpl);

    expect(result.path).toHaveLength(3);
    expect(result.distanceMeters).toBe(5000);
    expect(result.durationSeconds).toBe(600);
    expect(result.traffic).toBe('moderate');
    expect(result.steps).toEqual([
      { title: 'Go', subtitle: undefined, distanceMeters: 5, maneuver: undefined },
    ]);
  });

  test('treats a missing duration as zero seconds and missing legs as no steps', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(json({ routes: [route({ duration: undefined, legs: undefined })] }));
    const result = await call(fetchImpl);
    expect(result.durationSeconds).toBe(0);
    expect(result.steps).toEqual([]);
  });

  test('surfaces the API error message for an HTTP failure', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(json({ error: { message: 'boom' } }, false, 500));
    await expect(call(fetchImpl)).rejects.toMatchObject({
      kind: 'request-failed',
      message: 'boom',
    });
  });

  test('uses a generic message when an error body has none', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(json({}, false, 500));
    await expect(call(fetchImpl)).rejects.toMatchObject({
      kind: 'request-failed',
      message: 'No route returned',
    });
  });

  test('treats an OK response without routes as a failure, not an empty route', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(json({ routes: [] }));
    await expect(call(fetchImpl)).rejects.toMatchObject({ kind: 'request-failed' });
  });

  test.each([
    'Routes API has not been used in project 123 before or it is disabled.',
    'The Routes API is DISABLED for this key',
  ])('recognises a disabled API from %p', async (message) => {
    const fetchImpl = jest.fn().mockResolvedValue(json({ error: { message } }, false, 403));
    const error = await call(fetchImpl).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(RoutesApiError);
    expect(error).toMatchObject({ kind: 'api-disabled' });
    expect((error as Error).message).toMatch(/Enable "Routes API"/);
  });

  test('survives a non-JSON error body', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => {
        throw new SyntaxError('Unexpected token <');
      },
    });
    await expect(call(fetchImpl)).rejects.toMatchObject({ kind: 'request-failed' });
  });

  test.each([
    ['no polyline', route({ polyline: undefined })],
    ['no distance', route({ distanceMeters: undefined })],
    ['a corrupt polyline', route({ polyline: { encodedPolyline: '_' } })],
  ])('rejects a route with %s as an invalid response', async (_name, broken) => {
    const fetchImpl = jest.fn().mockResolvedValue(json({ routes: [broken] }));
    await expect(call(fetchImpl)).rejects.toMatchObject({ kind: 'invalid-response' });
  });

  test('propagates network failures', async () => {
    const fetchImpl = jest.fn().mockRejectedValue(new TypeError('network'));
    await expect(call(fetchImpl)).rejects.toBeInstanceOf(TypeError);
  });

  test('falls back to the global fetch', async () => {
    const original = global.fetch;
    global.fetch = jest.fn().mockResolvedValue(json({ routes: [route()] }));
    try {
      await fetchRoute({ start, end, mode: 'WALK', apiKey: 'k' });
      expect(global.fetch).toHaveBeenCalledTimes(1);
    } finally {
      global.fetch = original;
    }
  });
});
