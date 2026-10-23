import { forwardRef, useImperativeHandle } from 'react';

// Records the props each map primitive receives so tests can assert on them and trigger callbacks.
export const fitToCoordinates = jest.fn();
export const mapViewProps: any[] = [];
export const markerProps: any[] = [];
export const polylineProps: any[] = [];

export const resetMapMocks = () => {
  fitToCoordinates.mockClear();
  mapViewProps.length = 0;
  markerProps.length = 0;
  polylineProps.length = 0;
};

export const lastMapProps = () => mapViewProps.at(-1);

const MapView = forwardRef((props: any, ref) => {
  mapViewProps.push(props);
  useImperativeHandle(ref, () => ({ fitToCoordinates }));
  return props.children ?? null;
});
MapView.displayName = 'MockMapView';

export const Marker = (props: any) => {
  markerProps.push(props);
  return props.children ?? null;
};

export const Polyline = (props: any) => {
  polylineProps.push(props);
  return null;
};

export const PROVIDER_GOOGLE = 'google';
export type Region = { latitude: number; longitude: number };

export default MapView;
