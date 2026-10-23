const METERS_PER_KM = 1000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const MS_PER_SECOND = 1000;

export function formatDistance(meters: number): string {
  return meters < METERS_PER_KM
    ? `${Math.round(meters)} m`
    : `${(meters / METERS_PER_KM).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  if (seconds < SECONDS_PER_HOUR) {
    return `${Math.max(1, Math.round(seconds / SECONDS_PER_MINUTE))} min`;
  }
  const hours = Math.floor(seconds / SECONDS_PER_HOUR);
  const minutes = Math.round((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  return `${hours} hr ${minutes} min`;
}

/** Local wall-clock arrival time (HH:MM) for a trip of `seconds` that starts at `startedAtMs`. */
export function formatArrival(seconds: number, startedAtMs: number): string {
  const arrival = new Date(startedAtMs + seconds * MS_PER_SECOND);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(arrival.getHours())}:${pad(arrival.getMinutes())}`;
}

export const formatCoordinate = (latitude: number, longitude: number, digits: number): string =>
  `${latitude.toFixed(digits)}, ${longitude.toFixed(digits)}`;
