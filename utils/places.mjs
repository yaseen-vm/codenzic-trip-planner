const AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';

export class PlacesError extends Error {}

/**
 * Validates a Places autocomplete payload. A missing `suggestions` key is a valid
 * empty result; anything structurally wrong is an error, never an empty list.
 */
export function parseSuggestions(data) {
  if (data === null || typeof data !== 'object') {
    throw new PlacesError('Unexpected Places response');
  }
  const items = data.suggestions ?? [];
  if (!Array.isArray(items)) throw new PlacesError('Unexpected Places response');
  return items.flatMap((item) => {
    const prediction = item?.placePrediction;
    if (!prediction) return [];
    const description = prediction.text?.text;
    if (typeof prediction.placeId !== 'string' || typeof description !== 'string') {
      throw new PlacesError('Unexpected Places prediction');
    }
    return [{ placeId: prediction.placeId, description }];
  });
}

export async function fetchSuggestions({ query, apiKey, sessionToken, signal, fetchImpl = fetch }) {
  const response = await fetchImpl(AUTOCOMPLETE_URL, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'suggestions.placePrediction.placeId,suggestions.placePrediction.text.text',
    },
    body: JSON.stringify({ input: query, sessionToken }),
  });
  if (!response.ok) throw new PlacesError('Places autocomplete failed (' + response.status + ')');
  return parseSuggestions(await response.json());
}
