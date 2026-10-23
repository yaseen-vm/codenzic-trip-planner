import { act, fireEvent, render, screen } from '@testing-library/react-native';
import MapPicker from '../../../src/components/map/MapPicker';
import { PICKER_REGION_DELTA } from '../../../src/constants/config';
import { lastMapProps, resetMapMocks } from '../../mocks/reactNativeMaps';

jest.mock('react-native-maps', () => jest.requireActual('../../mocks/reactNativeMaps'));
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);

const center = { latitude: 1, longitude: 2 };

const picker = (props: Partial<React.ComponentProps<typeof MapPicker>> = {}) => {
  const onCancel = jest.fn();
  const onConfirm = jest.fn();
  const element = (extra: Partial<React.ComponentProps<typeof MapPicker>> = {}) => (
    <MapPicker
      visible
      title="Set pickup on map"
      initialCenter={center}
      onCancel={onCancel}
      onConfirm={onConfirm}
      {...props}
      {...extra}
    />
  );
  return { onCancel, onConfirm, element };
};

beforeEach(resetMapMocks);

test('renders nothing while hidden', async () => {
  await render(picker({ visible: false }).element());
  expect(screen.queryByText('Set pickup on map')).toBeNull();
});

test('opens on the initial centre at the picker zoom level', async () => {
  await render(picker().element());
  expect(lastMapProps().initialRegion).toEqual({
    ...center,
    latitudeDelta: PICKER_REGION_DELTA,
    longitudeDelta: PICKER_REGION_DELTA,
  });
});

test('shows a loading hint until the map is ready', async () => {
  await render(picker().element());
  expect(screen.getByText('Loading map…')).toBeTruthy();

  await act(async () => lastMapProps().onMapReady());
  expect(screen.getByText('Move the map to place the pin on your spot.')).toBeTruthy();
});

test('confirms the initial centre when the map was never moved', async () => {
  const { onConfirm, element } = picker();
  await render(element());
  await fireEvent.press(screen.getByText('Confirm location'));
  expect(onConfirm).toHaveBeenCalledWith(center);
});

test('confirms the point under the pin after the map moves', async () => {
  const { onConfirm, element } = picker();
  await render(element());

  await act(async () =>
    lastMapProps().onRegionChangeComplete({
      latitude: 5,
      longitude: 6,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    }),
  );
  await fireEvent.press(screen.getByText('Confirm location'));
  expect(onConfirm).toHaveBeenCalledWith({ latitude: 5, longitude: 6 });
});

test('a previous pan never leaks into the next time the picker opens', async () => {
  const { onConfirm, element } = picker();
  await render(element());
  await act(async () =>
    lastMapProps().onRegionChangeComplete({
      latitude: 5,
      longitude: 6,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    }),
  );

  await screen.rerender(element({ visible: false }));
  await screen.rerender(element({ visible: true }));
  await fireEvent.press(screen.getByText('Confirm location'));
  expect(onConfirm).toHaveBeenLastCalledWith(center);
});

test('adopts a new initial centre', async () => {
  const { onConfirm, element } = picker();
  await render(element());
  await screen.rerender(element({ initialCenter: { latitude: 7, longitude: 8 } }));

  await fireEvent.press(screen.getByText('Confirm location'));
  expect(onConfirm).toHaveBeenLastCalledWith({ latitude: 7, longitude: 8 });
});

test('the close button cancels', async () => {
  const { onCancel, element } = picker();
  await render(element());
  await fireEvent.press(screen.getByLabelText('Close map'));
  expect(onCancel).toHaveBeenCalledTimes(1);
});
