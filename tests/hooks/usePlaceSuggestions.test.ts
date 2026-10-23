import { act, renderHook } from '@testing-library/react-native';
import { usePlaceSuggestions } from '../../src/hooks/usePlaceSuggestions';
import { fetchSuggestions } from '../../src/services/placesApi';
import type { PlaceSuggestion } from '../../src/types/places';
import { deferred } from '../helpers';

jest.mock('../../src/services/placesApi', () => ({ fetchSuggestions: jest.fn() }));

const mockFetch = fetchSuggestions as jest.MockedFunction<typeof fetchSuggestions>;
const DEBOUNCE = 300;

const kochi: PlaceSuggestion[] = [{ placeId: 'k', description: 'Kochi, India' }];
const kozhikode: PlaceSuggestion[] = [{ placeId: 'z', description: 'Kozhikode, India' }];

type Props = { query: string; enabled?: boolean; apiKey?: string };

const render = (initialProps: Props) =>
  renderHook(
    ({ query, enabled = true, apiKey = 'key' }: Props) =>
      usePlaceSuggestions({ query, enabled, apiKey, debounceMs: DEBOUNCE }),
    { initialProps },
  );

const wait = (ms: number) =>
  act(async () => {
    jest.advanceTimersByTime(ms);
  });

beforeEach(() => {
  jest.useFakeTimers();
  mockFetch.mockReset();
});
afterEach(() => jest.useRealTimers());

describe('when no lookup is needed', () => {
  test.each([
    ['the query is shorter than three characters', { query: 'ko' }],
    ['the query is only whitespace padding', { query: '  ko ' }],
    ['the field already has a committed place', { query: 'Kochi', enabled: false }],
    ['there is no API key', { query: 'Kochi', apiKey: '' }],
  ])('does not fetch when %s', async (_name, props) => {
    const { result } = await render(props);
    await wait(DEBOUNCE * 2);

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current).toMatchObject({ suggestions: [], loading: false, failed: false });
  });
});

describe('when the query is long enough', () => {
  test('waits for the debounce window before fetching and reports loading meanwhile', async () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    const { result } = await render({ query: 'Koc' });

    expect(result.current.loading).toBe(true);
    await wait(DEBOUNCE - 1);
    expect(mockFetch).not.toHaveBeenCalled();
    await wait(1);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('passes the query, key, session token and abort signal to the service', async () => {
    mockFetch.mockResolvedValue(kochi);
    await render({ query: 'Koc' });
    await wait(DEBOUNCE);

    expect(mockFetch).toHaveBeenCalledWith({
      query: 'Koc',
      apiKey: 'key',
      sessionToken: expect.any(String),
      signal: expect.any(AbortSignal),
    });
  });

  test('exposes the suggestions once they arrive', async () => {
    mockFetch.mockResolvedValue(kochi);
    const { result } = await render({ query: 'Koc' });
    await wait(DEBOUNCE);

    expect(result.current).toMatchObject({ suggestions: kochi, loading: false, failed: false });
  });

  test('a valid empty result is not a failure', async () => {
    mockFetch.mockResolvedValue([]);
    const { result } = await render({ query: 'Koc' });
    await wait(DEBOUNCE);

    expect(result.current).toMatchObject({ suggestions: [], loading: false, failed: false });
  });

  test('reports a failed lookup with an empty list', async () => {
    mockFetch.mockRejectedValue(new Error('offline'));
    const { result } = await render({ query: 'Koc' });
    await wait(DEBOUNCE);

    expect(result.current).toMatchObject({ suggestions: [], loading: false, failed: true });
  });

  test('typing again before the debounce elapses issues a single request for the latest query', async () => {
    mockFetch.mockResolvedValue(kochi);
    const { rerender } = await render({ query: 'Koc' });
    await wait(DEBOUNCE - 50);
    await rerender({ query: 'Koch' });
    await wait(DEBOUNCE);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0]![0].query).toBe('Koch');
  });

  test('aborts the older request and ignores its late answer', async () => {
    const older = deferred<PlaceSuggestion[]>();
    const newer = deferred<PlaceSuggestion[]>();
    mockFetch.mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
    const { result, rerender } = await render({ query: 'Koc' });
    await wait(DEBOUNCE);
    const olderSignal = mockFetch.mock.calls[0]![0].signal!;

    await rerender({ query: 'Kochi' });
    await wait(DEBOUNCE);
    expect(olderSignal.aborted).toBe(true);

    await act(async () => newer.resolve(kochi));
    await act(async () => older.resolve(kozhikode));
    expect(result.current.suggestions).toEqual(kochi);
  });

  test('an older failure does not clear the loading state of the newer request', async () => {
    const older = deferred<PlaceSuggestion[]>();
    mockFetch.mockReturnValueOnce(older.promise).mockReturnValueOnce(new Promise(() => {}));
    const { result, rerender } = await render({ query: 'Koc' });
    await wait(DEBOUNCE);
    await rerender({ query: 'Kochi' });
    await wait(DEBOUNCE);

    await act(async () => older.reject(new Error('aborted')));
    expect(result.current.loading).toBe(true);
    expect(result.current.failed).toBe(false);
  });

  test('keeps the previous suggestions visible while the next query loads', async () => {
    mockFetch.mockResolvedValueOnce(kochi).mockReturnValueOnce(new Promise(() => {}));
    const { result, rerender } = await render({ query: 'Koc' });
    await wait(DEBOUNCE);
    await rerender({ query: 'Kochi' });

    expect(result.current.loading).toBe(true);
    expect(result.current.suggestions).toEqual(kochi);
  });

  test('clearing the query discards an in-flight response', async () => {
    const pending = deferred<PlaceSuggestion[]>();
    mockFetch.mockReturnValue(pending.promise);
    const { result, rerender } = await render({ query: 'Kochi' });
    await wait(DEBOUNCE);
    await rerender({ query: '' });

    await act(async () => pending.resolve(kochi));
    expect(result.current).toMatchObject({ suggestions: [], loading: false });
  });

  test('disabling the hook after a lookup hides its results', async () => {
    mockFetch.mockResolvedValue(kochi);
    const { result, rerender } = await render({ query: 'Kochi' });
    await wait(DEBOUNCE);
    await rerender({ query: 'Kochi', enabled: false });

    expect(result.current.suggestions).toEqual([]);
  });

  test('aborts the request on unmount', async () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    const { unmount } = await render({ query: 'Kochi' });
    await wait(DEBOUNCE);
    const signal = mockFetch.mock.calls[0]![0].signal!;

    await unmount();
    expect(signal.aborted).toBe(true);
  });

  test('uses the configured key when none is passed', async () => {
    mockFetch.mockResolvedValue([]);
    await renderHook(() => usePlaceSuggestions({ query: 'Kochi', enabled: true }));
    await wait(300);
    expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ apiKey: 'test-places-key' }));
  });
});

describe('session token', () => {
  test('is stable across queries until the session ends', async () => {
    mockFetch.mockResolvedValue([]);
    const { result, rerender } = await render({ query: 'Koc' });
    await wait(DEBOUNCE);
    await rerender({ query: 'Kochi' });
    await wait(DEBOUNCE);

    const [first, second] = mockFetch.mock.calls.map(([options]) => options.sessionToken);
    expect(first).toBe(second);
    expect(result.current.sessionToken()).toBe(first);
  });

  test('changes after endSession', async () => {
    mockFetch.mockResolvedValue([]);
    const { result } = await render({ query: 'Koc' });
    const before = result.current.sessionToken();

    await act(async () => result.current.endSession());
    expect(result.current.sessionToken()).not.toBe(before);
  });

  test('has a stable accessor identity across renders', async () => {
    const { result, rerender } = await render({ query: '' });
    const accessor = result.current.sessionToken;
    await rerender({ query: 'ab' });
    expect(result.current.sessionToken).toBe(accessor);
  });
});
