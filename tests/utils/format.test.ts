import {
  formatArrival,
  formatCoordinate,
  formatDistance,
  formatDuration,
} from '../../src/utils/format';

describe('formatDistance', () => {
  test.each([
    [0, '0 m'],
    [999, '999 m'],
    [1000, '1.0 km'],
    [1250, '1.3 km'],
    [12345, '12.3 km'],
  ])('%p m -> %p', (meters, expected) => {
    expect(formatDistance(meters)).toBe(expected);
  });
});

describe('formatDuration', () => {
  test.each([
    [0, '1 min'],
    [10, '1 min'],
    [600, '10 min'],
    [3599, '60 min'],
    [3600, '1 hr 0 min'],
    [5400, '1 hr 30 min'],
    [7260, '2 hr 1 min'],
  ])('%p s -> %p', (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });
});

describe('formatArrival', () => {
  test('adds the duration to the start time and zero-pads hours and minutes', () => {
    const start = new Date(2024, 0, 1, 8, 5, 0).getTime();
    expect(formatArrival(60, start)).toBe('08:06');
    expect(formatArrival(0, start)).toBe('08:05');
  });

  test('wraps past midnight', () => {
    const start = new Date(2024, 0, 1, 23, 50, 0).getTime();
    expect(formatArrival(20 * 60, start)).toBe('00:10');
  });
});

describe('formatCoordinate', () => {
  test('rounds both components to the requested digits', () => {
    expect(formatCoordinate(9.931233, 76.267304, 5)).toBe('9.93123, 76.26730');
  });
});
