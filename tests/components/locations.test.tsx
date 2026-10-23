import { act, fireEvent, render, screen } from '@testing-library/react-native';
import SetLocationsScreen from '../../app/locations';

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
jest.mock('../../components/MapPicker', () => ({ __esModule: true, default: () => null }));

type Pending = {
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
  signal: AbortSignal;
};
let pending: Pending[];

const suggestion = (id: string, text: string) => ({
  ok: true,
  json: async () => ({ suggestions: [{ placePrediction: { placeId: id, text: { text } } }] }),
});

beforeEach(() => {
  jest.useFakeTimers();
  pending = [];
  global.fetch = jest.fn(
    (_url: unknown, init: { signal: AbortSignal }) =>
      new Promise((resolve, reject) => {
        pending.push({ resolve, reject, signal: init.signal });
      }),
  ) as unknown as typeof fetch;
});
afterEach(() => jest.useRealTimers());

const input = () => screen.getByLabelText('Pickup location');

async function type(text: string) {
  await fireEvent.changeText(input(), text);
  await act(async () => {
    jest.advanceTimersByTime(350);
  });
}

test('an out-of-order response for an older query never replaces current results', async () => {
  await render(<SetLocationsScreen />);
  await type('Koc');
  await type('Kochi');
  expect(pending).toHaveLength(2);
  expect(pending[0]!.signal.aborted).toBe(true);

  await act(async () => pending[1]!.resolve(suggestion('new', 'Kochi, India')));
  await act(async () => pending[0]!.resolve(suggestion('old', 'Kozhikode, India')));
  expect(screen.getByText('Kochi')).toBeTruthy();
  expect(screen.queryByText('Kozhikode')).toBeNull();
});

test('clearing the field discards an in-flight response', async () => {
  await render(<SetLocationsScreen />);
  await type('Kochi');
  await type('');
  await act(async () => pending[0]!.resolve(suggestion('p', 'Kochi, India')));
  expect(screen.queryByText('Kochi')).toBeNull();
});

test('an older request finishing does not clear the loading state of the newer one', async () => {
  await render(<SetLocationsScreen />);
  await type('Koc');
  await type('Kochi');
  expect(screen.queryByLabelText('Loading suggestions')).not.toBeNull();
  await act(async () => pending[0]!.reject(new Error('aborted')));
  expect(screen.queryByLabelText('Loading suggestions')).not.toBeNull();
});

test('an HTTP error is shown as an error, separate from an empty result', async () => {
  await render(<SetLocationsScreen />);
  await type('Kochi');
  await act(async () => pending[0]!.resolve({ ok: false, status: 500, json: async () => ({}) }));
  expect(screen.getByText(/Could not load suggestions/)).toBeTruthy();
});

test('a rejected fetch shows the error notice', async () => {
  await render(<SetLocationsScreen />);
  await type('Kochi');
  await act(async () => pending[0]!.reject(new TypeError('network')));
  expect(screen.getByText(/Could not load suggestions/)).toBeTruthy();
});

test('a valid empty result shows no error', async () => {
  await render(<SetLocationsScreen />);
  await type('Kochi');
  await act(async () => pending[0]!.resolve({ ok: true, json: async () => ({}) }));
  expect(screen.queryByText(/Could not load suggestions/)).toBeNull();
});
