import { useEffect, useState } from 'react';
import { ROUTES_API_KEY } from '../constants/config';
import { ROUTE_STRINGS } from '../constants/strings';
import { fetchRoute, RoutesApiError } from '../services/routesApi';
import type { Coordinate } from '../types/geo';
import type { RouteResult, TravelMode } from '../types/route';

export type RouteState =
  | { status: 'loading' }
  | { status: 'ready'; route: RouteResult; receivedAt: number }
  | { status: 'error'; headline: string; message: string };

type SettledState = Exclude<RouteState, { status: 'loading' }>;

const LOADING: RouteState = { status: 'loading' };

const MISSING_KEY: RouteState = {
  status: 'error',
  headline: ROUTE_STRINGS.configurationRequired,
  message: ROUTE_STRINGS.missingRoutesKey,
};

function toErrorState(error: unknown): SettledState {
  return {
    status: 'error',
    headline: ROUTE_STRINGS.apiSetupRequired,
    message:
      error instanceof RoutesApiError || error instanceof Error
        ? error.message
        : ROUTE_STRINGS.genericFailure,
  };
}

type UseRouteOptions = {
  start: Coordinate;
  end: Coordinate;
  mode: TravelMode;
  apiKey?: string;
};

/**
 * Loads the route for the given endpoints and mode. A change of inputs aborts the in-flight
 * request, and the state is keyed by its inputs so a stale answer is never shown for new ones.
 */
export function useRoute({
  start,
  end,
  mode,
  apiKey = ROUTES_API_KEY,
}: UseRouteOptions): RouteState {
  const requestKey = [mode, start.latitude, start.longitude, end.latitude, end.longitude].join('|');
  const [settled, setSettled] = useState<{ key: string; state: SettledState } | null>(null);

  useEffect(() => {
    if (!apiKey) return;
    const controller = new AbortController();
    const settle = (state: SettledState) => {
      if (!controller.signal.aborted) setSettled({ key: requestKey, state });
    };

    fetchRoute({ start, end, mode, apiKey, signal: controller.signal })
      .then((route) => settle({ status: 'ready', route, receivedAt: Date.now() }))
      .catch((error: unknown) => settle(toErrorState(error)));

    return () => controller.abort();
  }, [apiKey, requestKey, start, end, mode]);

  if (!apiKey) return MISSING_KEY;
  return settled?.key === requestKey ? settled.state : LOADING;
}
