import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';
import RouteScreen from '../../../src/app/route';

const mockReplace = jest.fn();
const mockBack = jest.fn();
let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, back: mockBack, push: jest.fn() }),
  useLocalSearchParams: () => mockParams,
}));
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);
const mockRouteMap = jest.fn((_props: unknown) => null);
jest.mock('../../../src/components/map/RouteMap', () => ({
  __esModule: true,
  default: (props: unknown) => mockRouteMap(props),
}));

const valid = {
  pickup: 'A',
  dropoff: 'B',
  pickupLat: '9.9',
  pickupLng: '76.2',
  dropoffLat: '10.0',
  dropoffLng: '76.3',
};

const step = (instructions: string, maneuver?: string, distanceMeters = 100) => ({
  distanceMeters,
  navigationInstruction: { instructions, maneuver },
});

const routesResponse = (route: Record<string, unknown> = {}) => ({
  routes: [
    {
      distanceMeters: 5000,
      duration: '600s',
      polyline: { encodedPolyline: '_p~iF~ps|U_ulLnnqC' },
      legs: [{ steps: [step('Head north\nTowards the bridge', 'STRAIGHT', 250)] }],
      ...route,
    },
  ],
});

const respondWith = (body: unknown, ok = true, status = 200) =>
  (global.fetch as jest.Mock).mockResolvedValue({ ok, status, json: async () => body });

const lastMapProps = () => mockRouteMap.mock.calls.at(-1)![0] as Record<string, unknown>;
const requestBody = (call = 0) => JSON.parse((global.fetch as jest.Mock).mock.calls[call][1].body);

const renderScreen = async (params = valid) => {
  mockParams = params;
  await render(<RouteScreen />);
  await act(async () => {});
};

beforeEach(() => {
  mockReplace.mockClear();
  mockBack.mockClear();
  mockRouteMap.mockClear();
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => routesResponse(),
  });
});
afterEach(() => jest.restoreAllMocks());

const invalidCases: [string, Record<string, string>][] = [
  ['no params', {}],
  ['missing longitude', { ...valid, dropoffLng: '' }],
  ['non-numeric latitude', { ...valid, pickupLat: 'abc' }],
  ['out-of-range latitude', { ...valid, pickupLat: '91' }],
  ['out-of-range longitude', { ...valid, dropoffLng: '181' }],
];

test.each(invalidCases)(
  'shows the invalid state, not a fallback route, for %s',
  async (_n, params) => {
    mockParams = params;
    await render(<RouteScreen />);
    expect(screen.getByText('Invalid locations')).toBeTruthy();
    expect(mockRouteMap).not.toHaveBeenCalled();
    expect(screen.queryByText('Start navigation')).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByText('Choose locations'));
    expect(mockReplace).toHaveBeenCalledWith('/locations');
  },
);

test('treats 0,0 as a real coordinate and requests the route for it', async () => {
  await renderScreen({ ...valid, pickupLat: '0', pickupLng: '0' });
  expect(screen.queryByText('Invalid locations')).toBeNull();
  expect(requestBody().origin.location.latLng).toEqual({ latitude: 0, longitude: 0 });
});

describe('loaded route', () => {
  test('fetches once and renders the summary, places and first step', async () => {
    await renderScreen();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(requestBody().travelMode).toBe('DRIVE');
    expect(screen.getByText('10 min')).toBeTruthy();
    expect(screen.getByText(/5\.0 km/)).toBeTruthy();
    expect(screen.getByText('A')).toBeTruthy();
    expect(screen.getByText('B')).toBeTruthy();
    expect(screen.getByText('Head north')).toBeTruthy();
    expect(screen.getByText('250 m')).toBeTruthy();
  });

  test('passes the decoded route and a region around both endpoints to the map', async () => {
    await renderScreen();
    const props = lastMapProps();

    expect(props.route).toHaveLength(2);
    expect(props.pickup).toBe('A');
    expect(props.dropoff).toBe('B');
    expect(props.satellite).toBe(false);
    expect(props.region).toMatchObject({ latitude: 9.95, longitude: 76.25 });
  });

  test('falls back to default labels when the names are missing', async () => {
    const { pickup: _p, dropoff: _d, ...withoutNames } = valid;
    await renderScreen(withoutNames as typeof valid);
    expect(lastMapProps()).toMatchObject({ pickup: 'Pickup', dropoff: 'Destination' });
  });

  test('shows how long the route takes in hours when it is long', async () => {
    respondWith(routesResponse({ duration: '5400s', distanceMeters: 800 }));
    await renderScreen();
    expect(screen.getByText('1 hr 30 min')).toBeTruthy();
    expect(screen.getByText(/800 m/)).toBeTruthy();
  });
});

describe('travel mode', () => {
  test('re-requests the route in the chosen mode, without traffic for walking', async () => {
    await renderScreen();
    await fireEvent.press(screen.getByText('Walk'));
    await act(async () => {});

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(requestBody(1)).toMatchObject({
      travelMode: 'WALK',
      routingPreference: 'TRAFFIC_UNAWARE',
    });
  });

  test('aborts the superseded request', async () => {
    await renderScreen();
    const firstSignal = (global.fetch as jest.Mock).mock.calls[0][1].signal as AbortSignal;
    await fireEvent.press(screen.getByText('Ride'));
    expect(firstSignal.aborted).toBe(true);
  });
});

describe('traffic', () => {
  const withSpeeds = (...speeds: string[]) =>
    respondWith(
      routesResponse({
        travelAdvisory: { speedReadingIntervals: speeds.map((speed) => ({ speed })) },
      }),
    );

  test('warns about heavy traffic', async () => {
    withSpeeds('NORMAL', 'TRAFFIC_JAM');
    await renderScreen();
    expect(screen.getByText('Heavy traffic on your route')).toBeTruthy();
  });

  test('warns about moderate traffic', async () => {
    withSpeeds('SLOW');
    await renderScreen();
    expect(screen.getByText('Moderate traffic on your route')).toBeTruthy();
  });

  test('shows no banner when traffic is free-flowing', async () => {
    withSpeeds('NORMAL');
    await renderScreen();
    expect(screen.queryByText(/traffic on your route/)).toBeNull();
  });
});

describe('failures', () => {
  test('surfaces a failed route request as unavailable, not a plausible route', async () => {
    respondWith({ error: { message: 'boom' } }, false, 500);
    await renderScreen();

    expect(screen.getByText('Route unavailable')).toBeTruthy();
    expect(screen.getByText('API setup required')).toBeTruthy();
    expect(screen.getByText('boom')).toBeTruthy();
  });

  test('explains a disabled Routes API', async () => {
    respondWith({ error: { message: 'Routes API has not been used in project 1' } }, false, 403);
    await renderScreen();
    expect(screen.getByText(/Routes API is disabled in Google Cloud Console/)).toBeTruthy();
  });

  test('cannot start navigation without a route', async () => {
    respondWith({ error: { message: 'boom' } }, false, 500);
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await renderScreen();

    await fireEvent.press(screen.getByText('Start navigation'));
    expect(alert).not.toHaveBeenCalled();
  });

  test('clears the route from the map when a later request fails', async () => {
    await renderScreen();
    respondWith({ error: { message: 'boom' } }, false, 500);
    await fireEvent.press(screen.getByText('Walk'));
    await act(async () => {});

    expect(lastMapProps().route).toEqual([]);
  });
});

describe('actions', () => {
  test('back returns to the previous screen', async () => {
    await renderScreen();
    await fireEvent.press(screen.getByLabelText('Go back to locations'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  test('the layers button toggles satellite imagery', async () => {
    await renderScreen();
    await fireEvent.press(screen.getByLabelText('Toggle map layers'));
    expect(lastMapProps().satellite).toBe(true);
    await fireEvent.press(screen.getByLabelText('Toggle map layers'));
    expect(lastMapProps().satellite).toBe(false);
  });

  test('start navigation confirms, then opens Google Maps in the chosen mode', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue();
    await renderScreen();

    await fireEvent.press(screen.getByText('Walk'));
    await act(async () => {});
    await fireEvent.press(screen.getByText('Start navigation'));
    expect(alert).toHaveBeenCalledTimes(1);
    expect(openURL).not.toHaveBeenCalled();

    const buttons = alert.mock.calls[0]![2] as { text: string; onPress?: () => void }[];
    buttons.find((b) => b.text === 'Open Maps')!.onPress!();
    expect(openURL).toHaveBeenCalledWith(expect.stringContaining('travelmode=walking'));
    expect(openURL).toHaveBeenCalledWith(expect.stringContaining('origin=9.9,76.2'));
  });
});
