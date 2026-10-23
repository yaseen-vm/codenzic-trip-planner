import type { Coordinate } from './geo';

export type TravelMode = 'DRIVE' | 'TWO_WHEELER' | 'WALK';

export type TrafficLevel = 'none' | 'moderate' | 'heavy';

export type RouteStep = {
  title: string;
  subtitle?: string;
  distanceMeters?: number;
  maneuver?: string;
};

export type RouteResult = {
  path: Coordinate[];
  distanceMeters: number;
  durationSeconds: number;
  steps: RouteStep[];
  traffic: TrafficLevel;
};
