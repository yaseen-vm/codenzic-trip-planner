import { useCallback, useEffect, useRef, useState } from 'react';
import { MIN_SEARCH_QUERY_LENGTH, PLACES_API_KEY, SEARCH_DEBOUNCE_MS } from '../constants/config';
import { fetchSuggestions } from '../services/placesApi';
import type { PlaceSuggestion } from '../types/places';
import { createSessionToken } from '../utils/sessionToken';

type UsePlaceSuggestionsOptions = {
  query: string;
  // False while the query already matches a committed place, so no lookup is needed.
  enabled: boolean;
  apiKey?: string;
  debounceMs?: number;
};

type Settled = { query: string; suggestions: PlaceSuggestion[]; failed: boolean };

export type PlaceSuggestionsResult = {
  suggestions: PlaceSuggestion[];
  loading: boolean;
  failed: boolean;
  sessionToken: () => string;
  endSession: () => void;
};

const NO_SUGGESTIONS: PlaceSuggestion[] = [];

/** Debounced, abortable Places autocomplete for the current query. */
export function usePlaceSuggestions({
  query,
  enabled,
  apiKey = PLACES_API_KEY,
  debounceMs = SEARCH_DEBOUNCE_MS,
}: UsePlaceSuggestionsOptions): PlaceSuggestionsResult {
  const trimmed = query.trim();
  const active = enabled && Boolean(apiKey) && trimmed.length >= MIN_SEARCH_QUERY_LENGTH;
  const [settled, setSettled] = useState<Settled | null>(null);
  const token = useRef<string | null>(null);
  const sessionToken = useCallback(() => (token.current ??= createSessionToken()), []);

  useEffect(() => {
    if (!active || !apiKey) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchSuggestions({
        query,
        apiKey,
        sessionToken: sessionToken(),
        signal: controller.signal,
      })
        .then((suggestions) => {
          if (!controller.signal.aborted) setSettled({ query, suggestions, failed: false });
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setSettled({ query, suggestions: NO_SUGGESTIONS, failed: true });
          }
        });
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [active, apiKey, query, debounceMs, sessionToken]);

  const endSession = useCallback(() => {
    token.current = null;
  }, []);

  if (!active) {
    return { suggestions: NO_SUGGESTIONS, loading: false, failed: false, sessionToken, endSession };
  }
  const current = settled?.query === query;
  return {
    // Keep showing the previous results while the next query loads to avoid list flicker.
    suggestions: settled?.suggestions ?? NO_SUGGESTIONS,
    loading: !current,
    failed: current && settled.failed,
    sessionToken,
    endSession,
  };
}
