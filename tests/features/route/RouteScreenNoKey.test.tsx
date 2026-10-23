import { render, screen } from '@testing-library/react-native';
import RouteScreen from '../../../src/app/route';

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), back: jest.fn(), push: jest.fn() }),
  useLocalSearchParams: () => ({
    pickup: 'A',
    dropoff: 'B',
    pickupLat: '9.9',
    pickupLng: '76.2',
    dropoffLat: '10.0',
    dropoffLng: '76.3',
  }),
}));
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);
jest.mock('../../../src/components/map/RouteMap', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../../../src/constants/config', () => ({
  ...jest.requireActual('../../../src/constants/config'),
  ROUTES_API_KEY: undefined,
}));

test('explains the missing key instead of calling the API', async () => {
  global.fetch = jest.fn();
  await render(<RouteScreen />);

  expect(screen.getByText('Configuration required')).toBeTruthy();
  expect(screen.getByText('Route unavailable')).toBeTruthy();
  expect(screen.getByText(/EXPO_PUBLIC_GOOGLE_ROUTES_API_KEY/)).toBeTruthy();
  expect(global.fetch).not.toHaveBeenCalled();
});
