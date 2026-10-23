export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type MapRegion = Coordinate & {
  latitudeDelta: number;
  longitudeDelta: number;
};
