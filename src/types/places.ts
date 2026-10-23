import type { Coordinate } from './geo';

export type PlaceSuggestion = {
  placeId: string;
  description: string;
};

// A place the user committed to, with the coordinates the route is computed from.
export type SelectedPlace = Coordinate & {
  label: string;
};
