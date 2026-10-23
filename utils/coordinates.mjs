export function parseCoordinate(latitude, longitude) {
  if (
    typeof latitude !== 'string' ||
    typeof longitude !== 'string' ||
    latitude.trim() === '' ||
    longitude.trim() === ''
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
