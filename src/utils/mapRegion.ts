import { MIN_REGION_DELTA, REGION_PADDING_FACTOR } from '../constants/config';
import type { Coordinate, MapRegion } from '../types/geo';

const paddedDelta = (a: number, b: number) =>
  Math.max(Math.abs(a - b) * REGION_PADDING_FACTOR, MIN_REGION_DELTA);

/** A region centred between two points that leaves breathing room around both. */
export function regionAround(a: Coordinate, b: Coordinate): MapRegion {
  return {
    latitude: (a.latitude + b.latitude) / 2,
    longitude: (a.longitude + b.longitude) / 2,
    latitudeDelta: paddedDelta(a.latitude, b.latitude),
    longitudeDelta: paddedDelta(a.longitude, b.longitude),
  };
}
