// Plain decimals only: Number() would also accept hex ("0x10") and exponent ("1e1") forms.
const DECIMAL = /^[+-]?(\d+\.?\d*|\.\d+)$/;

export function parseCoordinate(latitude, longitude) {
  if (
    typeof latitude !== 'string' ||
    typeof longitude !== 'string' ||
    !DECIMAL.test(latitude.trim()) ||
    !DECIMAL.test(longitude.trim())
  ) {
    return null;
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  return { latitude: lat, longitude: lng };
}
