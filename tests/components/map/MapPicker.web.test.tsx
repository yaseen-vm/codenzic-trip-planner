import { fireEvent, render, screen } from '@testing-library/react-native';
import MapPicker from '../../../src/components/map/MapPicker.web';

const center = { latitude: 1, longitude: 2 };

const renderPicker = (props: Partial<React.ComponentProps<typeof MapPicker>> = {}) => {
  const onCancel = jest.fn();
  const onConfirm = jest.fn();
  const view = render(
    <MapPicker
      visible
      title="Set pickup on map"
      initialCenter={center}
      onCancel={onCancel}
      onConfirm={onConfirm}
      {...props}
    />,
  );
  return { onCancel, onConfirm, view };
};

test('renders nothing while hidden', async () => {
  await renderPicker({ visible: false }).view;
  expect(screen.queryByText('Set pickup on map')).toBeNull();
});

test('explains that map selection is mobile-only', async () => {
  await renderPicker().view;
  expect(screen.getByText('Set pickup on map')).toBeTruthy();
  expect(screen.getByText(/available in the mobile app/)).toBeTruthy();
});

test('confirms the initial centre', async () => {
  const { onConfirm, view } = renderPicker();
  await view;
  await fireEvent.press(screen.getByText('Use map centre'));
  expect(onConfirm).toHaveBeenCalledWith(center);
});

test('tapping the backdrop cancels, tapping the card does not', async () => {
  const { onCancel, view } = renderPicker();
  await view;

  await fireEvent.press(screen.getByText('Set pickup on map'));
  expect(onCancel).not.toHaveBeenCalled();

  await fireEvent.press(screen.getByLabelText('Close map'));
  expect(onCancel).toHaveBeenCalledTimes(1);
});
