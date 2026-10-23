import { act, fireEvent, render, screen } from '@testing-library/react-native';
import LocationsScreen from '../../../src/app/locations';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), back: jest.fn() }) }));
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
}));
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);
jest.mock('../../../src/components/map/MapPicker', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../../../src/constants/config', () => ({
  ...jest.requireActual('../../../src/constants/config'),
  PLACES_API_KEY: undefined,
}));

beforeEach(() => {
  jest.useFakeTimers();
  global.fetch = jest.fn();
});
afterEach(() => jest.useRealTimers());

test('tells the developer how to enable live search and never calls the API', async () => {
  await render(<LocationsScreen />);
  expect(screen.getByText(/EXPO_PUBLIC_GOOGLE_PLACES_API_KEY/)).toBeTruthy();

  await fireEvent.changeText(screen.getByLabelText('Pickup location'), 'Kochi');
  await act(async () => {
    jest.advanceTimersByTime(1000);
  });
  expect(global.fetch).not.toHaveBeenCalled();
});

test('the empty state says search is not configured', async () => {
  await render(<LocationsScreen />);
  await fireEvent.changeText(screen.getByLabelText('Pickup location'), 'zzzz');
  expect(screen.getByText(/Google Places search is not configured/)).toBeTruthy();
});

test('saved places still work without a key', async () => {
  await render(<LocationsScreen />);
  await fireEvent.press(screen.getByText('Home'));
  expect(screen.getByLabelText('Pickup location').props.value).toMatch(/^Home/);
});
