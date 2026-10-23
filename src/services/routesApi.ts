import {
  MAX_ROUTE_STEPS,
  ROUTES_COMPUTE_URL,
  ROUTES_FIELD_MASK,
  ROUTES_LANGUAGE_CODE,
} from '../constants/config';
import { ROUTE_STRINGS } from '../constants/strings';
import type { Coordinate } from '../types/geo';
import type { RouteResult, RouteStep, TrafficLevel, TravelMode } from '../types/route';
import { decodePolyline } from '../utils/polyline';

type FetchImpl = typeof fetch;

export type RoutesErrorKind = 'api-disabled' | 'request-failed' | 'invalid-response';

export class RoutesApiError extends Error {
  readonly kind: RoutesErrorKind;

  constructor(kind: RoutesErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

// Google reports a disabled API only through free-text messages.
const API_DISABLED_HINTS = ['routes api has not been used', 'disabled'];
const TRAFFIC_AWARE_MODES: readonly TravelMode[] = ['DRIVE'];
const STEP_LINE_BREAK = '\n';
const DURATION_RADIX = 10;

type RawStep = {
  distanceMeters?: number;
  navigationInstruction?: { instructions?: string; maneuver?: string };
};

type RawRoute = {
  duration?: string;
  distanceMeters?: number;
  polyline?: { encodedPolyline?: string };
  legs?: { steps?: RawStep[] }[];
  travelAdvisory?: { speedReadingIntervals?: { speed?: string }[] };
};

type RawResponse = { routes?: RawRoute[]; error?: { message?: string } };

const toLatLng = ({ latitude, longitude }: Coordinate) => ({
  location: { latLng: { latitude, longitude } },
});

export function buildRoutesRequest(start: Coordinate, end: Coordinate, mode: TravelMode) {
  const trafficAware = TRAFFIC_AWARE_MODES.includes(mode);
  return {
    origin: toLatLng(start),
    destination: toLatLng(end),
    travelMode: mode,
    routingPreference: trafficAware ? 'TRAFFIC_AWARE' : 'TRAFFIC_UNAWARE',
    extraComputations: trafficAware ? ['TRAFFIC_ON_POLYLINE'] : undefined,
    computeAlternativeRoutes: false,
    languageCode: ROUTES_LANGUAGE_CODE,
    units: 'METRIC',
  };
}

function parseStep(raw: RawStep): RouteStep {
  const [title = '', ...rest] = (raw.navigationInstruction?.instructions ?? '').split(
    STEP_LINE_BREAK,
  );
  return {
    title: title.trim(),
    subtitle: rest.join(' ').trim() || undefined,
    distanceMeters: raw.distanceMeters,
    maneuver: raw.navigationInstruction?.maneuver,
  };
}

export const parseSteps = (rawSteps: RawStep[] = []): RouteStep[] =>
  rawSteps
    .map(parseStep)
    .filter((step) => step.title)
    .slice(0, MAX_ROUTE_STEPS);

export function classifyTraffic(route: RawRoute): TrafficLevel {
  const speeds = (route.travelAdvisory?.speedReadingIntervals ?? []).map((i) => i.speed);
  if (speeds.includes('TRAFFIC_JAM')) return 'heavy';
  if (speeds.includes('SLOW')) return 'moderate';
  return 'none';
}

function parseRoute(raw: RawRoute): RouteResult {
  const encoded = raw.polyline?.encodedPolyline;
  if (typeof encoded !== 'string' || typeof raw.distanceMeters !== 'number') {
    throw new RoutesApiError('invalid-response', ROUTE_STRINGS.unexpectedResponse);
  }

  let path: Coordinate[];
  try {
    path = decodePolyline(encoded);
  } catch {
    throw new RoutesApiError('invalid-response', ROUTE_STRINGS.unexpectedResponse);
  }

  return {
    path,
    distanceMeters: raw.distanceMeters,
    durationSeconds: Number.parseInt(raw.duration ?? '0s', DURATION_RADIX),
    steps: parseSteps(raw.legs?.[0]?.steps),
    traffic: classifyTraffic(raw),
  };
}

function toRequestError(data: RawResponse | null): RoutesApiError {
  const message = data?.error?.message ?? ROUTE_STRINGS.noRoute;
  const lowered = message.toLowerCase();
  return API_DISABLED_HINTS.some((hint) => lowered.includes(hint))
    ? new RoutesApiError('api-disabled', ROUTE_STRINGS.apiDisabled)
    : new RoutesApiError('request-failed', message);
}

type FetchRouteOptions = {
  start: Coordinate;
  end: Coordinate;
  mode: TravelMode;
  apiKey: string;
  signal?: AbortSignal;
  fetchImpl?: FetchImpl;
};

export async function fetchRoute({
  start,
  end,
  mode,
  apiKey,
  signal,
  fetchImpl = fetch,
}: FetchRouteOptions): Promise<RouteResult> {
  const response = await fetchImpl(ROUTES_COMPUTE_URL, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': ROUTES_FIELD_MASK,
    },
    body: JSON.stringify(buildRoutesRequest(start, end, mode)),
  });

  let data: RawResponse | null = null;
  try {
    data = await response.json();
  } catch {
    // A non-JSON body is treated like an empty error payload below.
  }

  const first = data?.routes?.[0];
  if (!response.ok || !first) throw toRequestError(data);
  return parseRoute(first);
}
