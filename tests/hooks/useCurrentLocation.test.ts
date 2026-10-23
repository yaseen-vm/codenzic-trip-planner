import { act, renderHook } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { useCurrentLocation } from '../../src/hooks/useCurrentLocation';
import { describeCoordinate } from '../../src/services/geocoding';
import { deferred } from '../helpers';

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied' },
  Accuracy: { Balanced: 3 },
}));
jest.mock('../../src/services/geocoding', () => ({ describeCoordinate: jest.fn() }));

const requestPermission = Location.requestForegroundPermissionsAsync as jest.Mock;
const getPosition = Location.getCurrentPositionAsync as jest.Mock;
const describe_ = describeCoordinate as jest.Mock;

beforeEach(() => {
  jest.resetAllMocks();
  requestPermission.mockResolvedValue({ status: 'granted' });
  getPosition.mockResolvedValue({ coords: { latitude: 1.5, longitude: 2.5 } });
  describe_.mockResolvedValue('Main St, Doha');
});

test('starts idle with no notice', async () => {
  const { result } = await renderHook(() => useCurrentLocation());
  expect(result.current).toMatchObject({ locating: false, notice: '' });
});

test('resolves the device position into a labelled place', async () => {
  const { result } = await renderHook(() => useCurrentLocation());
  let place;
  await act(async () => {
    place = await result.current.locate();
  });

  expect(place).toEqual({ label: 'Main St, Doha', latitude: 1.5, longitude: 2.5 });
  expect(getPosition).toHaveBeenCalledWith({ accuracy: 3 });
  expect(describe_).toHaveBeenCalledWith(1.5, 2.5);
  expect(result.current).toMatchObject({ locating: false, notice: '' });
});

test('explains a denied permission and does not read the position', async () => {
  requestPermission.mockResolvedValue({ status: 'denied' });
  const { result } = await renderHook(() => useCurrentLocation());
  let place;
  await act(async () => {
    place = await result.current.locate();
  });

  expect(place).toBeNull();
  expect(getPosition).not.toHaveBeenCalled();
  expect(result.current.notice).toMatch(/permission was denied/);
  expect(result.current.locating).toBe(false);
});

test('explains a position failure', async () => {
  getPosition.mockRejectedValue(new Error('services off'));
  const { result } = await renderHook(() => useCurrentLocation());
  let place;
  await act(async () => {
    place = await result.current.locate();
  });

  expect(place).toBeNull();
  expect(result.current.notice).toMatch(/Could not get your location/);
  expect(result.current.locating).toBe(false);
});

test('explains a failed permission request', async () => {
  requestPermission.mockRejectedValue(new Error('boom'));
  const { result } = await renderHook(() => useCurrentLocation());
  await act(async () => {
    await result.current.locate();
  });
  expect(result.current.notice).toMatch(/Could not get your location/);
});

test('reports locating while the lookup is pending', async () => {
  const position = deferred<{ coords: { latitude: number; longitude: number } }>();
  getPosition.mockReturnValue(position.promise);
  const { result } = await renderHook(() => useCurrentLocation());

  let pending: Promise<unknown>;
  await act(async () => {
    pending = result.current.locate();
  });
  expect(result.current.locating).toBe(true);

  await act(async () => {
    position.resolve({ coords: { latitude: 1, longitude: 2 } });
    await pending;
  });
  expect(result.current.locating).toBe(false);
});

test('a new attempt clears the previous notice', async () => {
  requestPermission.mockResolvedValueOnce({ status: 'denied' });
  const { result } = await renderHook(() => useCurrentLocation());
  await act(async () => {
    await result.current.locate();
  });
  expect(result.current.notice).not.toBe('');

  await act(async () => {
    await result.current.locate();
  });
  expect(result.current.notice).toBe('');
});

test('clearNotice dismisses the notice', async () => {
  requestPermission.mockResolvedValue({ status: 'denied' });
  const { result } = await renderHook(() => useCurrentLocation());
  await act(async () => {
    await result.current.locate();
  });

  await act(async () => result.current.clearNotice());
  expect(result.current.notice).toBe('');
});
