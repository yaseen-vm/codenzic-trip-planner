import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';
import { ArrowUp, CornerUpLeft, CornerUpRight, Merge, RotateCw, Ship } from 'lucide-react-native';
import { maneuverIcon } from '../../../src/features/route/maneuverIcon';
import ModeSelector from '../../../src/features/route/ModeSelector';
import RouteSummary from '../../../src/features/route/RouteSummary';
import {
  buildNavigationUrl,
  confirmStartNavigation,
} from '../../../src/features/route/startNavigation';
import StepList from '../../../src/features/route/StepList';
import type { RouteState } from '../../../src/hooks/useRoute';
import type { RouteStep } from '../../../src/types/route';
import { END, START } from '../../helpers';

describe('maneuverIcon', () => {
  test.each([
    [undefined, ArrowUp],
    ['', ArrowUp],
    ['STRAIGHT', ArrowUp],
    ['SOMETHING_NEW', ArrowUp],
    ['ROUNDABOUT_LEFT', RotateCw],
    ['UTURN_RIGHT', RotateCw],
    ['TURN_LEFT', CornerUpLeft],
    ['KEEP_LEFT', CornerUpLeft],
    ['TURN_RIGHT', CornerUpRight],
    ['RAMP_RIGHT', CornerUpRight],
    ['MERGE', Merge],
    ['FERRY', Ship],
    ['FERRY_TRAIN', Ship],
  ])('%p -> matching glyph', (maneuver, expected) => {
    expect(maneuverIcon(maneuver)).toBe(expected);
  });
});

describe('buildNavigationUrl', () => {
  test.each([
    ['DRIVE', 'driving'],
    ['TWO_WHEELER', 'bicycling'],
    ['WALK', 'walking'],
  ] as const)('builds a Google Maps link for %s', (mode, travelmode) => {
    expect(buildNavigationUrl(START, END, mode)).toBe(
      `https://www.google.com/maps/dir/?api=1&origin=9.9,76.2&destination=10,76.3&travelmode=${travelmode}`,
    );
  });
});

describe('confirmStartNavigation', () => {
  let alert: jest.SpyInstance;
  let openURL: jest.SpyInstance;

  beforeEach(() => {
    alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue();
    alert.mockClear();
    openURL.mockClear();
  });
  afterEach(() => jest.restoreAllMocks());

  test('asks before leaving the app and opens nothing yet', () => {
    confirmStartNavigation(START, END, 'DRIVE');
    expect(alert).toHaveBeenCalledWith(
      'Open turn-by-turn navigation?',
      expect.any(String),
      expect.any(Array),
    );
    expect(openURL).not.toHaveBeenCalled();
  });

  test('opens Google Maps with the trip when confirmed', () => {
    confirmStartNavigation(START, END, 'WALK');
    const buttons = alert.mock.calls[0]![2] as { text: string; onPress?: () => void }[];
    buttons.find((b) => b.text === 'Open Maps')!.onPress!();
    expect(openURL).toHaveBeenCalledWith(buildNavigationUrl(START, END, 'WALK'));
  });

  test('does nothing when cancelled', () => {
    confirmStartNavigation(START, END, 'DRIVE');
    const buttons = alert.mock.calls[0]![2] as { text: string; onPress?: () => void }[];
    const cancel = buttons.find((b) => b.text === 'Cancel')!;
    expect(cancel.onPress).toBeUndefined();
    expect(openURL).not.toHaveBeenCalled();
  });
});

describe('ModeSelector', () => {
  test('lists every mode and marks the current one as selected', async () => {
    await render(<ModeSelector mode="WALK" onChange={jest.fn()} />);

    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Walk', selected: true })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Drive', selected: false })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ride', selected: false })).toBeTruthy();
  });

  test('reports the chosen mode', async () => {
    const onChange = jest.fn();
    await render(<ModeSelector mode="DRIVE" onChange={onChange} />);

    await fireEvent.press(screen.getByText('Ride'));
    expect(onChange).toHaveBeenCalledWith('TWO_WHEELER');
  });
});

describe('RouteSummary', () => {
  const ready = (overrides = {}): RouteState => ({
    status: 'ready',
    receivedAt: new Date(2024, 0, 1, 8, 0, 0).getTime(),
    route: {
      path: [],
      distanceMeters: 5000,
      durationSeconds: 600,
      steps: [],
      traffic: 'none',
      ...overrides,
    },
  });

  test('shows a placeholder while loading', async () => {
    await render(<RouteSummary state={{ status: 'loading' }} />);
    expect(screen.getByText('Calculating…')).toBeTruthy();
    expect(screen.getByText('—')).toBeTruthy();
  });

  test('shows duration, distance and arrival time when ready', async () => {
    await render(<RouteSummary state={ready()} />);
    expect(screen.getByText('10 min')).toBeTruthy();
    expect(screen.getByText(/5\.0 km/)).toBeTruthy();
    expect(screen.getByText(/arrive 08:10/)).toBeTruthy();
  });

  test('shows the failure headline and an unavailable distance on error', async () => {
    await render(
      <RouteSummary state={{ status: 'error', headline: 'API setup required', message: 'x' }} />,
    );
    expect(screen.getByText('API setup required')).toBeTruthy();
    expect(screen.getByText('Route unavailable')).toBeTruthy();
    expect(screen.queryByText(/arrive/)).toBeNull();
  });
});

describe('StepList', () => {
  const steps: RouteStep[] = [
    { title: 'Turn left', subtitle: 'onto Main St', distanceMeters: 120, maneuver: 'TURN_LEFT' },
    { title: 'Continue' },
  ];

  test('shows a spinner while loading, ignoring any steps', async () => {
    await render(<StepList loading steps={steps} />);
    expect(screen.queryByText('Turn left')).toBeNull();
  });

  test('shows the placeholder when there are no steps', async () => {
    await render(<StepList loading={false} steps={[]} />);
    expect(screen.getByText('Route directions will appear here.')).toBeTruthy();
  });

  test('shows the failure message instead of the placeholder when given', async () => {
    await render(<StepList loading={false} steps={[]} message="Quota exceeded" />);
    expect(screen.getByText('Quota exceeded')).toBeTruthy();
    expect(screen.queryByText('Route directions will appear here.')).toBeNull();
  });

  test('renders each step with its optional subtitle and distance', async () => {
    await render(<StepList loading={false} steps={steps} />);
    expect(screen.getByText('Turn left')).toBeTruthy();
    expect(screen.getByText('onto Main St')).toBeTruthy();
    expect(screen.getByText('120 m')).toBeTruthy();
    expect(screen.getByText('Continue')).toBeTruthy();
    expect(screen.getAllByText(/ m$/)).toHaveLength(1);
  });

  test('settles after rerendering from loading to loaded', async () => {
    await render(<StepList loading steps={steps} />);
    await act(async () => {
      screen.rerender(<StepList loading={false} steps={steps} />);
    });
    expect(screen.getByText('Continue')).toBeTruthy();
  });
});
