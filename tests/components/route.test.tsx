import { act, fireEvent, render, screen } from '@testing-library/react-native';
import RouteScreen from '../../app/route';

const mockReplace = jest.fn();
let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, back: jest.fn(), push: jest.fn() }),
  useLocalSearchParams: () => mockParams,
}));
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);
const mockRouteMap = jest.fn((_props: unknown) => null);
jest.mock('../../components/RouteMap', () => ({
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

const routesResponse = {
  routes: [
    {
      distanceMeters: 5000,
      duration: '600s',
      polyline: { encodedPolyline: '_p~iF~ps|U_ulLnnqC' },
      legs: [{ steps: [] }],
    },
  ],
};

beforeEach(() => {
  mockReplace.mockClear();
  mockRouteMap.mockClear();
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => routesResponse });
});

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
  mockParams = { ...valid, pickupLat: '0', pickupLng: '0' };
  await render(<RouteScreen />);
  await act(async () => {});
  expect(screen.queryByText('Invalid locations')).toBeNull();
  const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
  expect(body.origin.location.latLng).toEqual({ latitude: 0, longitude: 0 });
});

test('fetches the route once for valid coordinates and renders the details', async () => {
  mockParams = valid;
  await render(<RouteScreen />);
  await act(async () => {});
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(screen.getByText('10 min')).toBeTruthy();
  expect(screen.getByText('Start navigation')).toBeTruthy();
});

test('surfaces a failed route request as unavailable, not a plausible route', async () => {
  mockParams = valid;
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: false,
    status: 500,
    json: async () => ({ error: { message: 'boom' } }),
  });
  await render(<RouteScreen />);
  await act(async () => {});
  expect(screen.getByText('Route unavailable')).toBeTruthy();
});
