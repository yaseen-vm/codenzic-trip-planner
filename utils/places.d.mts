export type PlaceSuggestion = { placeId: string; description: string };
export class PlacesError extends Error {}
export function parseSuggestions(data: unknown): PlaceSuggestion[];
export function fetchSuggestions(options: {
  query: string;
  apiKey: string;
  sessionToken: string;
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
}): Promise<PlaceSuggestion[]>;
