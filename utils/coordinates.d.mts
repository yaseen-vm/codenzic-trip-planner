export type Coordinate = {
  latitude: number;
  longitude: number;
};

export function parseCoordinate(latitude?: string, longitude?: string): Coordinate | null;
