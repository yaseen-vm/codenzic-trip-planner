import { act, renderHook } from '@testing-library/react-native';
import { useRoute } from '../../src/hooks/useRoute';
import { fetchRoute, RoutesApiError } from '../../src/services/routesApi';
import type { RouteResult } from '../../src/types/route';
import { deferred, END, START } from '../helpers';

jest.mock('../../src/services/routesApi', () => ({
  ...jest.requireActual('../../src/services/routesApi'),
  fetchRoute: jest.fn(),
}));

const mockFetchRoute = fetchRoute as jest.MockedFunction<typeof fetchRoute>;

const routeResult = (durationSeconds = 600): RouteResult => ({
  path: [START, END],
  distanceMeters: 5000,
  durationSeconds,
  steps: [],
  traffic: 'none',
});

const render = (mode: 'DRIVE' | 'WALK' = 'DRIVE', apiKey = 'key') =>
  renderHook(
    (props: { mode: 'DRIVE' | 'WALK' }) =>
      useRoute({ start: START, end: END, mode: props.mode, apiKey }),
    { initialProps: { mode } },
  );

beforeEach(() => mockFetchRoute.mockReset());

test('starts in the loading state and requests the route with the given inputs', async () => {
  mockFetchRoute.mockReturnValue(new Promise(() => {}));
  const { result } = await render();

  expect(result.current).toEqual({ status: 'loading' });
  expect(mockFetchRoute).toHaveBeenCalledWith(
    expect.objectContaining({ start: START, end: END, mode: 'DRIVE', apiKey: 'key' }),
  );
});

test('becomes ready with the route and a receipt timestamp', async () => {
  jest.spyOn(Date, 'now').mockReturnValue(1234);
  mockFetchRoute.mockResolvedValue(routeResult());
  const { result } = await render();
  await act(async () => {});

  expect(result.current).toEqual({ status: 'ready', route: routeResult(), receivedAt: 1234 });
  jest.restoreAllMocks();
});

test('reports a missing API key as a configuration error without calling the API', async () => {
  const { result } = await render('DRIVE', '');

  expect(result.current).toMatchObject({
    status: 'error',
    headline: 'Configuration required',
    message: expect.stringContaining('EXPO_PUBLIC_GOOGLE_ROUTES_API_KEY'),
  });
  expect(mockFetchRoute).not.toHaveBeenCalled();
});

test('uses the configured key when none is passed', async () => {
  mockFetchRoute.mockReturnValue(new Promise(() => {}));
  await renderHook(() => useRoute({ start: START, end: END, mode: 'DRIVE' }));
  expect(mockFetchRoute).toHaveBeenCalledWith(
    expect.objectContaining({ apiKey: 'test-routes-key' }),
  );
});

test('surfaces an API error with its message', async () => {
  mockFetchRoute.mockRejectedValue(new RoutesApiError('request-failed', 'boom'));
  const { result } = await render();
  await act(async () => {});

  expect(result.current).toEqual({
    status: 'error',
    headline: 'API setup required',
    message: 'boom',
  });
});

test('surfaces a plain Error message', async () => {
  mockFetchRoute.mockRejectedValue(new TypeError('network'));
  const { result } = await render();
  await act(async () => {});
  expect(result.current).toMatchObject({ status: 'error', message: 'network' });
});

test('falls back to a generic message for a non-Error rejection', async () => {
  mockFetchRoute.mockRejectedValue('weird');
  const { result } = await render();
  await act(async () => {});
  expect(result.current).toMatchObject({
    status: 'error',
    message: 'Could not calculate a route.',
  });
});

test('changing the mode returns to loading and aborts the previous request', async () => {
  const first = deferred<RouteResult>();
  const second = deferred<RouteResult>();
  mockFetchRoute.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
  const { result, rerender } = await render('DRIVE');
  const firstSignal = mockFetchRoute.mock.calls[0]![0].signal!;

  await act(async () => first.resolve(routeResult(60)));
  expect(result.current.status).toBe('ready');

  await rerender({ mode: 'WALK' });
  expect(firstSignal.aborted).toBe(true);
  expect(result.current).toEqual({ status: 'loading' });
  expect(mockFetchRoute).toHaveBeenLastCalledWith(expect.objectContaining({ mode: 'WALK' }));

  await act(async () => second.resolve(routeResult(120)));
  expect(result.current).toMatchObject({ status: 'ready', route: { durationSeconds: 120 } });
});

test('ignores a stale response that arrives after the inputs changed', async () => {
  const first = deferred<RouteResult>();
  const second = deferred<RouteResult>();
  mockFetchRoute.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
  const { result, rerender } = await render('DRIVE');
  await rerender({ mode: 'WALK' });

  await act(async () => first.resolve(routeResult(60)));
  expect(result.current).toEqual({ status: 'loading' });

  await act(async () => second.resolve(routeResult(120)));
  expect(result.current).toMatchObject({ route: { durationSeconds: 120 } });
});

test('ignores a stale failure after the inputs changed', async () => {
  const first = deferred<RouteResult>();
  mockFetchRoute.mockReturnValueOnce(first.promise).mockReturnValueOnce(new Promise(() => {}));
  const { result, rerender } = await render('DRIVE');
  await rerender({ mode: 'WALK' });

  await act(async () => first.reject(new Error('late')));
  expect(result.current).toEqual({ status: 'loading' });
});

test('aborts the in-flight request on unmount', async () => {
  mockFetchRoute.mockReturnValue(new Promise(() => {}));
  const { unmount } = await render();
  const signal = mockFetchRoute.mock.calls[0]![0].signal!;

  await unmount();
  expect(signal.aborted).toBe(true);
});
