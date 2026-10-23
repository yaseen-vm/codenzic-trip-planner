import { act, render, screen } from '@testing-library/react-native';
import RouteMap from '../../../src/components/map/RouteMap';
import { MARKER_TRACKING_MS, ROUTE_FIT_PADDING } from '../../../src/constants/config';
import { MAP_STYLE } from '../../../src/constants/mapStyle';
import {
  fitToCoordinates,
  lastMapProps,
  markerProps,
  polylineProps,
  resetMapMocks,
} from '../../mocks/reactNativeMaps';

jest.mock('react-native-maps', () => jest.requireActual('../../mocks/reactNativeMaps'));

const start = { latitude: 9.9, longitude: 76.2 };
const end = { latitude: 10, longitude: 76.3 };
const region = { ...start, latitudeDelta: 0.1, longitudeDelta: 0.1 };
const path = [start, end];

const map = (props: Partial<React.ComponentProps<typeof RouteMap>> = {}) => (
  <RouteMap
    start={start}
    pickup="Home"
    end={end}
    dropoff="Work"
    route={path}
    region={region}
    {...props}
  />
);

beforeEach(() => {
  jest.useFakeTimers();
  resetMapMocks();
});
afterEach(() => jest.useRealTimers());

test('renders labelled pickup and destination markers', async () => {
  await render(map());
  const latest = markerProps.slice(-2);
  expect(latest.map((m) => [m.title, m.description, m.coordinate])).toEqual([
    ['Pickup', 'Home', start],
    ['Destination', 'Work', end],
  ]);
});

test('draws the route only when it has at least two points', async () => {
  await render(map({ route: [] }));
  expect(polylineProps).toHaveLength(0);

  await screen.rerender(map({ route: [start] }));
  expect(polylineProps).toHaveLength(0);

  await screen.rerender(map({ route: path }));
  expect(polylineProps.at(-1).coordinates).toEqual(path);
});

test('shows a loader until the map reports ready', async () => {
  await render(map());
  expect(screen.getByLabelText('Loading map…')).toBeTruthy();

  await act(async () => lastMapProps().onMapReady());
  expect(screen.queryByLabelText('Loading map…')).toBeNull();
});

describe('fitting the route', () => {
  test('waits for the map to be ready', async () => {
    await render(map());
    expect(fitToCoordinates).not.toHaveBeenCalled();

    await act(async () => lastMapProps().onMapReady());
    expect(fitToCoordinates).toHaveBeenCalledWith(path, {
      edgePadding: ROUTE_FIT_PADDING,
      animated: true,
    });
  });

  test('does nothing without a drawable route', async () => {
    await render(map({ route: [] }));
    await act(async () => lastMapProps().onMapReady());
    expect(fitToCoordinates).not.toHaveBeenCalled();
  });

  test('refits when a new route arrives', async () => {
    await render(map({ route: [] }));
    await act(async () => lastMapProps().onMapReady());
    await screen.rerender(map({ route: path }));
    expect(fitToCoordinates).toHaveBeenCalledTimes(1);
  });
});

describe('map type', () => {
  test('uses the styled standard map by default', async () => {
    await render(map());
    expect(lastMapProps()).toMatchObject({
      mapType: 'standard',
      customMapStyle: MAP_STYLE,
      provider: 'google',
      initialRegion: region,
    });
  });

  test('switches to hybrid imagery without the custom style for satellite', async () => {
    await render(map({ satellite: true }));
    expect(lastMapProps().mapType).toBe('hybrid');
    expect(lastMapProps().customMapStyle).toBeUndefined();
  });
});

test('stops tracking marker view changes shortly after mounting', async () => {
  await render(map());
  expect(markerProps.at(-1).tracksViewChanges).toBe(true);

  await act(async () => {
    jest.advanceTimersByTime(MARKER_TRACKING_MS);
  });
  expect(markerProps.at(-1).tracksViewChanges).toBe(false);
});
