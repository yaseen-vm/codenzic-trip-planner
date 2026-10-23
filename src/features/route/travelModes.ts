import { ROUTE_STRINGS } from '../../constants/strings';
import type { TravelMode } from '../../types/route';

export const DEFAULT_TRAVEL_MODE: TravelMode = 'DRIVE';

export const TRAVEL_MODES: readonly { key: TravelMode; label: string }[] = [
  { key: 'DRIVE', label: ROUTE_STRINGS.modeDrive },
  { key: 'TWO_WHEELER', label: ROUTE_STRINGS.modeRide },
  { key: 'WALK', label: ROUTE_STRINGS.modeWalk },
];

// Value of Google Maps' `travelmode` URL parameter for each routing mode.
export const GOOGLE_MAPS_TRAVEL_MODE: Record<TravelMode, string> = {
  DRIVE: 'driving',
  TWO_WHEELER: 'bicycling',
  WALK: 'walking',
};
