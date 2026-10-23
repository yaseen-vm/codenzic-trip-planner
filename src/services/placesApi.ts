import {
  AUTOCOMPLETE_FIELD_MASK,
  PLACES_AUTOCOMPLETE_URL,
  PLACES_DETAILS_URL,
  PLACE_DETAILS_FIELD_MASK,
} from '../constants/config';
import type { PlaceSuggestion, SelectedPlace } from '../types/places';

type FetchImpl = typeof fetch;

export class PlacesError extends Error {}

const UNEXPECTED_RESPONSE = 'Unexpected Places response';
const UNEXPECTED_PREDICTION = 'Unexpected Places prediction';
const MISSING_COORDINATES = 'Coordinates were not returned';

const buildHeaders = (apiKey: string, fieldMask: string) => ({
  'Content-Type': 'application/json',
  'X-Goog-Api-Key': apiKey,
  'X-Goog-FieldMask': fieldMask,
});

/**
 * Validates a Places autocomplete payload. A missing `suggestions` key is a valid
 * empty result; anything structurally wrong is an error, never an empty list.
 */
export function parseSuggestions(data: unknown): PlaceSuggestion[] {
  if (data === null || typeof data !== 'object') throw new PlacesError(UNEXPECTED_RESPONSE);

  const items = (data as { suggestions?: unknown }).suggestions ?? [];
  if (!Array.isArray(items)) throw new PlacesError(UNEXPECTED_RESPONSE);

  return items.flatMap((item): PlaceSuggestion[] => {
    const prediction = item?.placePrediction;
    if (!prediction) return [];

    const description = prediction.text?.text;
    if (typeof prediction.placeId !== 'string' || typeof description !== 'string') {
      throw new PlacesError(UNEXPECTED_PREDICTION);
    }
    return [{ placeId: prediction.placeId, description }];
  });
}

type SuggestionOptions = {
  query: string;
  apiKey: string;
  sessionToken: string;
  signal?: AbortSignal;
  fetchImpl?: FetchImpl;
};

export async function fetchSuggestions({
  query,
  apiKey,
  sessionToken,
  signal,
  fetchImpl = fetch,
}: SuggestionOptions): Promise<PlaceSuggestion[]> {
  const response = await fetchImpl(PLACES_AUTOCOMPLETE_URL, {
    method: 'POST',
    signal,
    headers: buildHeaders(apiKey, AUTOCOMPLETE_FIELD_MASK),
    body: JSON.stringify({ input: query, sessionToken }),
  });
  if (!response.ok) throw new PlacesError(`Places autocomplete failed (${response.status})`);
  return parseSuggestions(await response.json());
}

type PlaceDetailsOptions = {
  place: PlaceSuggestion;
  apiKey: string;
  sessionToken?: string;
  signal?: AbortSignal;
  fetchImpl?: FetchImpl;
};

/** Resolves a suggestion into a labelled coordinate. */
export async function fetchPlaceDetails({
  place,
  apiKey,
  sessionToken,
  signal,
  fetchImpl = fetch,
}: PlaceDetailsOptions): Promise<SelectedPlace> {
  const query = sessionToken ? `?sessionToken=${encodeURIComponent(sessionToken)}` : '';
  const response = await fetchImpl(
    `${PLACES_DETAILS_URL}/${encodeURIComponent(place.placeId)}${query}`,
    { signal, headers: buildHeaders(apiKey, PLACE_DETAILS_FIELD_MASK) },
  );
  if (!response.ok) throw new PlacesError(`Places details failed (${response.status})`);

  const data = await response.json();
  const location = data?.location;
  if (typeof location?.latitude !== 'number' || typeof location?.longitude !== 'number') {
    throw new PlacesError(MISSING_COORDINATES);
  }
  return {
    label: data.formattedAddress ?? data.displayName?.text ?? place.description,
    latitude: location.latitude,
    longitude: location.longitude,
  };
}
