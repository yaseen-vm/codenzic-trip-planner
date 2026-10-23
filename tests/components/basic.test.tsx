import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import BrandMark from '../../src/components/BrandMark';
import FloatingIconButton from '../../src/components/FloatingIconButton';
import NoticeBanner from '../../src/components/NoticeBanner';
import PrimaryButton from '../../src/components/PrimaryButton';
import RouteRail from '../../src/components/RouteRail';
import SectionLabel from '../../src/components/SectionLabel';
import TripPlaces from '../../src/components/TripPlaces';

describe('PrimaryButton', () => {
  test('renders its label and reports presses', async () => {
    const onPress = jest.fn();
    await render(<PrimaryButton label="Go" onPress={onPress} />);

    await fireEvent.press(screen.getByText('Go'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button').props.accessibilityState).toMatchObject({ disabled: false });
  });

  test('disabled blocks presses and is announced as disabled', async () => {
    const onPress = jest.fn();
    await render(<PrimaryButton label="Go" onPress={onPress} disabled />);

    await fireEvent.press(screen.getByText('Go'));
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByRole('button').props.accessibilityState).toMatchObject({ disabled: true });
  });

  test('dimmed looks inactive but still reports presses', async () => {
    const onPress = jest.fn();
    await render(<PrimaryButton label="Go" onPress={onPress} dimmed />);

    await fireEvent.press(screen.getByText('Go'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button').props.accessibilityState).toMatchObject({ disabled: true });
  });

  test('renders an optional icon beside the label', async () => {
    await render(<PrimaryButton label="Go" onPress={jest.fn()} icon={<Text>icon</Text>} />);
    expect(screen.getByText('icon')).toBeTruthy();
  });
});

describe('NoticeBanner', () => {
  test('shows the text without an alert role by default', async () => {
    await render(<NoticeBanner text="Heads up" />);
    expect(screen.getByText('Heads up')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  test('announces itself as an alert when asked', async () => {
    await render(<NoticeBanner text="Problem" alert />);
    expect(screen.getByRole('alert')).toBeTruthy();
  });
});

describe('SectionLabel', () => {
  test('renders its text', async () => {
    await render(<SectionLabel>Turn by turn</SectionLabel>);
    expect(screen.getByText('Turn by turn')).toBeTruthy();
  });
});

describe('FloatingIconButton', () => {
  test('exposes its label, renders children and reports presses', async () => {
    const onPress = jest.fn();
    await render(
      <FloatingIconButton label="Close map" onPress={onPress}>
        <Text>x</Text>
      </FloatingIconButton>,
    );

    await fireEvent.press(screen.getByLabelText('Close map'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByText('x')).toBeTruthy();
  });
});

describe('TripPlaces', () => {
  test('shows pickup and drop-off labels', async () => {
    await render(<TripPlaces pickup="Home" dropoff="Work" />);
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Work')).toBeTruthy();
  });

  test('renders in the tinted variant too', async () => {
    await render(<TripPlaces pickup="Home" dropoff="Work" tinted />);
    expect(screen.getByText('Work')).toBeTruthy();
  });
});

describe('RouteRail and BrandMark', () => {
  test('RouteRail renders without props', async () => {
    await render(<RouteRail />);
    expect(screen.toJSON()).not.toBeNull();
  });

  test('BrandMark exposes the logo label', async () => {
    await render(<BrandMark />);
    expect(screen.getByLabelText('Codenzic logo')).toBeTruthy();
  });
});
