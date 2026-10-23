export type Coordinate = {
  latitude: number;
  longitude: number;
};

export function decodePolyline(encoded: string): Coordinate[];
