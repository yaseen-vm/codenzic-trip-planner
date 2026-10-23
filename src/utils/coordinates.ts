import type { Coordinate } from '../types/geo';

export const MAX_LATITUDE = 90;
export const MAX_LONGITUDE = 180;

// Plain decimals only: Number() would also accept hex ("0x10") and exponent ("1e1") forms.
const DECIMAL = /^[+-]?(\d+\.?\d*|\.\d+)$/;

const parseDecimal = (value: unknown, limit: number): number | null => {
  if (typeof value !== 'string' || !DECIMAL.test(value.trim())) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && Math.abs(parsed) <= limit ? parsed : null;
};

/** Parses route-param strings into a coordinate, or null when either part is missing or invalid. */
export function parseCoordinate(latitude: unknown, longitude: unknown): Coordinate | null {
  const lat = parseDecimal(latitude, MAX_LATITUDE);
  const lng = parseDecimal(longitude, MAX_LONGITUDE);
  return lat === null || lng === null ? null : { latitude: lat, longitude: lng };
}

export const areSameCoordinate = (a: Coordinate, b: Coordinate): boolean =>
  a.latitude === b.latitude && a.longitude === b.longitude;
