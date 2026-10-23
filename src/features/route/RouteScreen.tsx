import { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ROUTE_STRINGS } from '../../constants/strings';
import { parseCoordinate } from '../../utils/coordinates';
import InvalidRouteState from './InvalidRouteState';
import RouteDetails from './RouteDetails';

const LOCATIONS_ROUTE = '/locations';

type RouteParams = {
  pickup?: string;
  dropoff?: string;
  pickupLat?: string;
  pickupLng?: string;
  dropoffLat?: string;
  dropoffLng?: string;
};

export default function RouteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<RouteParams>();
  const start = useMemo(
    () => parseCoordinate(params.pickupLat, params.pickupLng),
    [params.pickupLat, params.pickupLng],
  );
  const end = useMemo(
    () => parseCoordinate(params.dropoffLat, params.dropoffLng),
    [params.dropoffLat, params.dropoffLng],
  );

  if (!start || !end) {
    return <InvalidRouteState onChooseLocations={() => router.replace(LOCATIONS_ROUTE)} />;
  }

  return (
    <RouteDetails
      start={start}
      end={end}
      pickup={params.pickup ?? ROUTE_STRINGS.defaultPickup}
      dropoff={params.dropoff ?? ROUTE_STRINGS.defaultDropoff}
    />
  );
}
