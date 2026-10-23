import type { Coordinate } from '../types/geo';

// EXPO_PUBLIC_* values are inlined at build time, so each must be read as a literal property.
export const PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
export const ROUTES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_ROUTES_API_KEY;

export const PLACES_AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';
export const PLACES_DETAILS_URL = 'https://places.googleapis.com/v1/places';
export const ROUTES_COMPUTE_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';
export const GOOGLE_MAPS_DIRECTIONS_URL = 'https://www.google.com/maps/dir/?api=1';

export const AUTOCOMPLETE_FIELD_MASK =
  'suggestions.placePrediction.placeId,suggestions.placePrediction.text.text';
export const PLACE_DETAILS_FIELD_MASK = 'formattedAddress,location,displayName';
export const ROUTES_FIELD_MASK = [
  'routes.duration',
  'routes.distanceMeters',
  'routes.polyline.encodedPolyline',
  'routes.legs.steps.distanceMeters',
  'routes.legs.steps.navigationInstruction',
  'routes.travelAdvisory.speedReadingIntervals',
].join(',');

export const ROUTES_LANGUAGE_CODE = 'en';

export const SEARCH_DEBOUNCE_MS = 300;
export const MIN_SEARCH_QUERY_LENGTH = 3;
export const MAX_ROUTE_STEPS = 20;
export const COORDINATE_FRACTION_DIGITS = 5;

// Map framing.
export const DEFAULT_MAP_CENTER: Coordinate = { latitude: 25.2866, longitude: 51.5265 };
export const MIN_REGION_DELTA = 0.025;
export const REGION_PADDING_FACTOR = 2.3;
export const PICKER_REGION_DELTA = 0.03;
export const MARKER_TRACKING_MS = 800;
export const ROUTE_FIT_PADDING = { top: 90, right: 70, bottom: 90, left: 70 };
export const ROUTE_LINE_WIDTH = 2;
export const ROUTE_LINE_DASH = [5, 4];
