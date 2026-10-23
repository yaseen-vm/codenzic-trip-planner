import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import LocationsScreen from '../../../src/app/locations';

const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, back: mockBack }) }));
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied' },
  Accuracy: { Balanced: 3 },
}));
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);
const mockMapPicker = jest.fn((_props: unknown) => null);
jest.mock('../../../src/components/map/MapPicker', () => ({
  __esModule: true,
  default: (props: unknown) => mockMapPicker(props),
}));

type Pending = {
  url: string;
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
  signal: AbortSignal;
};
let pending: Pending[];

const autocomplete = (pairs: [string, string][]) => ({
  ok: true,
  status: 200,
  json: async () => ({
    suggestions: pairs.map(([id, text]) => ({ placePrediction: { placeId: id, text: { text } } })),
  }),
});
const suggestion = (id: string, text: string) => autocomplete([[id, text]]);
const details = (latitude: number, longitude: number, formattedAddress = 'Full Address') => ({
  ok: true,
  status: 200,
  json: async () => ({ formattedAddress, location: { latitude, longitude } }),
});

const reverseGeocode = Location.reverseGeocodeAsync as jest.Mock;
const requestPermission = Location.requestForegroundPermissionsAsync as jest.Mock;
const getPosition = Location.getCurrentPositionAsync as jest.Mock;
const mapProps = () => mockMapPicker.mock.calls.at(-1)![0] as Record<string, any>;

beforeEach(() => {
  jest.useFakeTimers();
  mockPush.mockClear();
  mockBack.mockClear();
  mockMapPicker.mockClear();
  pending = [];
  reverseGeocode.mockReset().mockResolvedValue([{ name: 'Pinned St', city: 'Doha' }]);
  requestPermission.mockReset().mockResolvedValue({ status: 'granted' });
  getPosition.mockReset().mockResolvedValue({ coords: { latitude: 25.1, longitude: 51.1 } });
  global.fetch = jest.fn(
    (url: string, init: { signal: AbortSignal }) =>
      new Promise((resolve, reject) => {
        pending.push({ url, resolve, reject, signal: init.signal });
      }),
  ) as unknown as typeof fetch;
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const field = (which: 'Pickup' | 'Drop-off' = 'Pickup') =>
  screen.getByLabelText(`${which} location`);

async function type(text: string, which: 'Pickup' | 'Drop-off' = 'Pickup') {
  await fireEvent.changeText(field(which), text);
  await act(async () => {
    jest.advanceTimersByTime(350);
  });
}

const settle = () => act(async () => {});

describe('autocomplete', () => {
  test('an out-of-order response for an older query never replaces current results', async () => {
    await render(<LocationsScreen />);
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
    await render(<LocationsScreen />);
    await type('Kochi');
    await type('');
    await act(async () => pending[0]!.resolve(suggestion('p', 'Kochi, India')));
    expect(screen.queryByText('Kochi')).toBeNull();
  });

  test('an older request finishing does not clear the loading state of the newer one', async () => {
    await render(<LocationsScreen />);
    await type('Koc');
    await type('Kochi');
    expect(screen.queryByLabelText('Loading suggestions')).not.toBeNull();
    await act(async () => pending[0]!.reject(new Error('aborted')));
    expect(screen.queryByLabelText('Loading suggestions')).not.toBeNull();
  });

  test('an HTTP error is shown as an error, separate from an empty result', async () => {
    await render(<LocationsScreen />);
    await type('Kochi');
    await act(async () => pending[0]!.resolve({ ok: false, status: 500, json: async () => ({}) }));
    expect(screen.getByText(/Could not load suggestions/)).toBeTruthy();
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  test('a rejected fetch shows the error notice', async () => {
    await render(<LocationsScreen />);
    await type('Kochi');
    await act(async () => pending[0]!.reject(new TypeError('network')));
    expect(screen.getByText(/Could not load suggestions/)).toBeTruthy();
  });

  test('a valid empty result shows no error', async () => {
    await render(<LocationsScreen />);
    await type('Kochi');
    await act(async () => pending[0]!.resolve({ ok: true, json: async () => ({}) }));
    expect(screen.queryByText(/Could not load suggestions/)).toBeNull();
  });

  test('does not search for fewer than three characters', async () => {
    await render(<LocationsScreen />);
    await type('Ko');
    expect(pending).toHaveLength(0);
  });

  test('live suggestions replace the saved places and split title from address', async () => {
    await render(<LocationsScreen />);
    await type('Kochi');
    await act(async () =>
      pending[0]!.resolve(
        autocomplete([
          ['a', 'Kochi, Kerala, India'],
          ['b', 'Kochi Fort'],
        ]),
      ),
    );

    expect(screen.getByText('Kochi')).toBeTruthy();
    expect(screen.getByText('Kerala, India')).toBeTruthy();
    expect(screen.getByText('Kochi Fort')).toBeTruthy();
    expect(screen.queryByText('Home')).toBeNull();
  });
});

describe('saved places', () => {
  test('lists every saved place for an empty field', async () => {
    await render(<LocationsScreen />);
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Hamad International Airport')).toBeTruthy();
    expect(screen.getByText('Set as pickup')).toBeTruthy();
  });

  test('filters the saved places as the user types fewer than three characters', async () => {
    await render(<LocationsScreen />);
    await type('ho');
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.queryByText('Hamad International Airport')).toBeNull();
  });

  test('explains when nothing matches', async () => {
    await render(<LocationsScreen />);
    await type('zz');
    expect(screen.getByText(/No saved places match that\. Keep typing/)).toBeTruthy();
  });

  test('choosing one fills the pickup and moves on to the drop-off', async () => {
    await render(<LocationsScreen />);
    await fireEvent.press(screen.getByText('Home'));

    expect(field('Pickup').props.value).toBe('Home · Villa 12, Street 840');
    expect(screen.getByText('Set as drop-off')).toBeTruthy();
  });
});

describe('selecting a live suggestion', () => {
  const chooseKochi = async () => {
    await render(<LocationsScreen />);
    await type('Kochi');
    await act(async () => pending[0]!.resolve(suggestion('place/1', 'Kochi, India')));
    await fireEvent.press(screen.getByText('Kochi'));
  };

  test('looks up the place details with the autocomplete session and fills the field', async () => {
    await chooseKochi();
    const request = pending[1]!;
    expect(request.url).toContain('/places/place%2F1?sessionToken=');

    await act(async () => request.resolve(details(9.9, 76.2, 'Kochi, Kerala, India')));
    expect(field('Pickup').props.value).toBe('Kochi, Kerala, India');
    expect(screen.getByText('Set as drop-off')).toBeTruthy();
  });

  test('alerts when the details cannot be loaded', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await chooseKochi();
    await act(async () => pending[1]!.resolve({ ok: false, status: 403, json: async () => ({}) }));

    expect(alert).toHaveBeenCalledWith('Could not select place', expect.any(String));
    expect(field('Pickup').props.value).toBe('Kochi');
  });

  test('a newer selection supersedes the details request still in flight', async () => {
    await chooseKochi();
    const first = pending[1]!;
    await fireEvent.press(screen.getByText('Kochi'));
    expect(first.signal.aborted).toBe(true);
  });

  test('a rejected details request is aborted silently on unmount', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await chooseKochi();
    const request = pending[1]!;
    await screen.unmount();
    await act(async () => request.reject(new Error('aborted')));
    expect(alert).not.toHaveBeenCalled();
  });
});

describe('editing the fields', () => {
  test('the clear button empties a field', async () => {
    await render(<LocationsScreen />);
    await fireEvent.press(screen.getByText('Home'));
    await fireEvent.press(screen.getByLabelText('Clear pickup'));
    expect(field('Pickup').props.value).toBe('');
    expect(screen.queryByLabelText('Clear pickup')).toBeNull();
  });

  test('swap exchanges pickup and drop-off', async () => {
    await render(<LocationsScreen />);
    await fireEvent.press(screen.getByText('Home'));
    await fireEvent.press(screen.getByText('Marina Office Tower'));
    await fireEvent.press(screen.getByLabelText('Swap pickup and drop-off'));

    expect(field('Pickup').props.value).toMatch(/^Marina Office Tower/);
    expect(field('Drop-off').props.value).toMatch(/^Home/);
  });

  test('focusing a field makes it the target of the next selection', async () => {
    await render(<LocationsScreen />);
    await fireEvent(field('Drop-off'), 'focus');
    expect(screen.getByText('Set as drop-off')).toBeTruthy();
  });

  test('editing a chosen place discards it, so Next asks for a suggestion again', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await render(<LocationsScreen />);
    await fireEvent.press(screen.getByText('Home'));
    await fireEvent.press(screen.getByText('Marina Office Tower'));
    await fireEvent.changeText(field('Pickup'), 'Home sw');
    await fireEvent.press(screen.getByText('Next'));

    expect(alert).toHaveBeenCalledWith('Choose locations from suggestions', expect.any(String));
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe('continuing', () => {
  test('pushes the route with both labels and coordinates', async () => {
    await render(<LocationsScreen />);
    await fireEvent.press(screen.getByText('Home'));
    await fireEvent.press(screen.getByText('Marina Office Tower'));
    await fireEvent.press(screen.getByText('Next'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/route',
      params: {
        pickup: 'Home · Villa 12, Street 840',
        dropoff: 'Marina Office Tower · Level 14, Al Fardan Rd',
        pickupLat: '25.3231',
        pickupLng: '51.5284',
        dropoffLat: '25.4195',
        dropoffLng: '51.5455',
      },
    });
  });

  test('asks for both places when none are chosen', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await render(<LocationsScreen />);
    await fireEvent.press(screen.getByText('Next'));

    expect(alert).toHaveBeenCalledWith('Choose locations from suggestions', expect.any(String));
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('asks for the drop-off when only the pickup is chosen', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await render(<LocationsScreen />);
    await fireEvent.press(screen.getByText('Home'));
    await fireEvent.press(screen.getByText('Next'));

    expect(alert).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('rejects an identical pickup and drop-off', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await render(<LocationsScreen />);
    await fireEvent.press(screen.getByText('Home'));
    await fireEvent.press(screen.getByText('Home'));
    await fireEvent.press(screen.getByText('Next'));

    expect(alert).toHaveBeenCalledWith('Choose different locations', expect.any(String));
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('the back button returns to the previous screen', async () => {
    await render(<LocationsScreen />);
    await fireEvent.press(screen.getByLabelText('Go back'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});

describe('use current location', () => {
  test('fills the pickup with the reverse-geocoded address', async () => {
    await render(<LocationsScreen />);
    await fireEvent.press(screen.getByText('Use current'));
    await settle();

    expect(field('Pickup').props.value).toBe('Pinned St, Doha');
    expect(screen.getByText('Set as drop-off')).toBeTruthy();
  });

  test('explains a denied permission without changing the field', async () => {
    requestPermission.mockResolvedValue({ status: 'denied' });
    await render(<LocationsScreen />);
    await fireEvent.press(screen.getByText('Use current'));
    await settle();

    expect(screen.getByText(/Location permission was denied/)).toBeTruthy();
    expect(field('Pickup').props.value).toBe('');
  });

  test('explains a position failure', async () => {
    getPosition.mockRejectedValue(new Error('off'));
    await render(<LocationsScreen />);
    await fireEvent.press(screen.getByText('Use current'));
    await settle();
    expect(screen.getByText(/Could not get your location/)).toBeTruthy();
  });
});

describe('pick on map', () => {
  test('opens the picker for the pickup, centred on the default location', async () => {
    await render(<LocationsScreen />);
    expect(mapProps().visible).toBe(false);

    await fireEvent.press(screen.getByText('Pick on map'));
    expect(mapProps()).toMatchObject({
      visible: true,
      title: 'Set pickup on map',
      initialCenter: { latitude: 25.2866, longitude: 51.5265 },
    });
  });

  test('centres the drop-off picker on the chosen pickup', async () => {
    await render(<LocationsScreen />);
    await fireEvent.press(screen.getByText('Home'));
    await fireEvent.press(screen.getByText('Pick on map'));

    expect(mapProps().title).toBe('Set drop-off on map');
    expect(mapProps().initialCenter).toMatchObject({ latitude: 25.3231, longitude: 51.5284 });
  });

  test('cancelling closes the picker without choosing anything', async () => {
    await render(<LocationsScreen />);
    await fireEvent.press(screen.getByText('Pick on map'));
    await act(async () => mapProps().onCancel());

    expect(mapProps().visible).toBe(false);
    expect(field('Pickup').props.value).toBe('');
  });

  test('confirming fills the active field with the address under the pin', async () => {
    await render(<LocationsScreen />);
    await fireEvent.press(screen.getByText('Pick on map'));
    await act(async () => mapProps().onConfirm({ latitude: 25.3, longitude: 51.4 }));

    expect(mapProps().visible).toBe(false);
    expect(field('Pickup').props.value).toBe('Pinned St, Doha');
    expect(reverseGeocode).toHaveBeenCalledWith({ latitude: 25.3, longitude: 51.4 });
  });

  test('confirming clears an earlier location notice', async () => {
    requestPermission.mockResolvedValue({ status: 'denied' });
    await render(<LocationsScreen />);
    await fireEvent.press(screen.getByText('Use current'));
    await settle();
    expect(screen.getByText(/Location permission was denied/)).toBeTruthy();

    await fireEvent.press(screen.getByText('Pick on map'));
    await act(async () => mapProps().onConfirm({ latitude: 1, longitude: 2 }));
    expect(screen.queryByText(/Location permission was denied/)).toBeNull();
  });

  test('falls back to the raw coordinates when the address lookup fails', async () => {
    reverseGeocode.mockRejectedValue(new Error('offline'));
    await render(<LocationsScreen />);
    await fireEvent.press(screen.getByText('Pick on map'));
    await act(async () => mapProps().onConfirm({ latitude: 25.3, longitude: 51.4 }));

    expect(field('Pickup').props.value).toBe('25.30000, 51.40000');
  });
});
