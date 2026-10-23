import * as Location from 'expo-location';
import { describeCoordinate } from '../../src/services/geocoding';

jest.mock('expo-location', () => ({ reverseGeocodeAsync: jest.fn() }));

const reverseGeocode = Location.reverseGeocodeAsync as jest.Mock;

describe('describeCoordinate', () => {
  beforeEach(() => reverseGeocode.mockReset());

  test('joins the name, street and city', async () => {
    reverseGeocode.mockResolvedValue([{ name: '12', street: 'Main St', city: 'Doha' }]);
    await expect(describeCoordinate(1, 2)).resolves.toBe('12, Main St, Doha');
    expect(reverseGeocode).toHaveBeenCalledWith({ latitude: 1, longitude: 2 });
  });

  test('drops blank parts and removes duplicates', async () => {
    reverseGeocode.mockResolvedValue([{ name: 'Main St', street: 'Main St', city: null }]);
    await expect(describeCoordinate(1, 2)).resolves.toBe('Main St');
  });

  test('falls back to rounded coordinates when no address parts exist', async () => {
    reverseGeocode.mockResolvedValue([{}]);
    await expect(describeCoordinate(9.931233, 76.267304)).resolves.toBe('9.93123, 76.26730');
  });

  test('falls back to coordinates when the lookup returns nothing', async () => {
    reverseGeocode.mockResolvedValue([]);
    await expect(describeCoordinate(1, 2)).resolves.toBe('1.00000, 2.00000');
  });

  test('falls back to coordinates when geocoding throws', async () => {
    reverseGeocode.mockRejectedValue(new Error('offline'));
    await expect(describeCoordinate(1, 2)).resolves.toBe('1.00000, 2.00000');
  });
});
