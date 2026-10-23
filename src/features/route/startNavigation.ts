import { Alert, Linking } from 'react-native';
import { GOOGLE_MAPS_DIRECTIONS_URL } from '../../constants/config';
import { ROUTE_STRINGS } from '../../constants/strings';
import type { Coordinate } from '../../types/geo';
import type { TravelMode } from '../../types/route';
import { GOOGLE_MAPS_TRAVEL_MODE } from './travelModes';

const toParam = ({ latitude, longitude }: Coordinate) => `${latitude},${longitude}`;

export function buildNavigationUrl(start: Coordinate, end: Coordinate, mode: TravelMode): string {
  return (
    `${GOOGLE_MAPS_DIRECTIONS_URL}&origin=${toParam(start)}&destination=${toParam(end)}` +
    `&travelmode=${GOOGLE_MAPS_TRAVEL_MODE[mode]}`
  );
}

/** Asks for confirmation, then hands the trip over to Google Maps for live guidance. */
export function confirmStartNavigation(start: Coordinate, end: Coordinate, mode: TravelMode) {
  Alert.alert(ROUTE_STRINGS.navigationPromptTitle, ROUTE_STRINGS.navigationPromptMessage, [
    { text: ROUTE_STRINGS.cancel, style: 'cancel' },
    {
      text: ROUTE_STRINGS.openMaps,
      onPress: () => {
        Linking.openURL(buildNavigationUrl(start, end, mode));
      },
    },
  ]);
}
