import { MIN_REGION_DELTA, REGION_PADDING_FACTOR } from '../../src/constants/config';
import { regionAround } from '../../src/utils/mapRegion';

describe('regionAround', () => {
  test('centres between the two points and pads the span', () => {
    const region = regionAround({ latitude: 10, longitude: 20 }, { latitude: 12, longitude: 26 });
    expect(region.latitude).toBe(11);
    expect(region.longitude).toBe(23);
    expect(region.latitudeDelta).toBeCloseTo(2 * REGION_PADDING_FACTOR);
    expect(region.longitudeDelta).toBeCloseTo(6 * REGION_PADDING_FACTOR);
  });

  test('never zooms tighter than the minimum delta, even for identical points', () => {
    const point = { latitude: 5, longitude: 5 };
    const region = regionAround(point, point);
    expect(region.latitudeDelta).toBe(MIN_REGION_DELTA);
    expect(region.longitudeDelta).toBe(MIN_REGION_DELTA);
  });

  test('does not depend on argument order', () => {
    const a = { latitude: 1, longitude: 2 };
    const b = { latitude: 3, longitude: 9 };
    expect(regionAround(a, b)).toEqual(regionAround(b, a));
  });
});
