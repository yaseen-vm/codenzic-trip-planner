import type { Coordinate, MapRegion } from '../../types/geo';

export interface RouteMapProps {
  start: Coordinate;
  pickup: string;
  end: Coordinate;
  dropoff: string;
  route: Coordinate[];
  region: MapRegion;
  // Honoured on native only; the web map has a single basemap.
  satellite?: boolean;
}
