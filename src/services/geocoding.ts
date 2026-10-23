import * as Location from 'expo-location';
import { COORDINATE_FRACTION_DIGITS } from '../constants/config';
import { formatCoordinate } from '../utils/format';

/** Turns coordinates into a readable address, falling back to the raw coordinates. */
export async function describeCoordinate(latitude: number, longitude: number): Promise<string> {
  try {
    const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
    const parts = [address?.name, address?.street, address?.city].filter(
      (part, index, all): part is string => Boolean(part) && all.indexOf(part) === index,
    );
    if (parts.length) return parts.join(', ');
  } catch {
    // Geocoding is best effort; fall through to coordinates.
  }
  return formatCoordinate(latitude, longitude, COORDINATE_FRACTION_DIGITS);
}
