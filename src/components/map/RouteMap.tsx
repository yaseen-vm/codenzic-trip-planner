import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import {
  MARKER_TRACKING_MS,
  ROUTE_FIT_PADDING,
  ROUTE_LINE_DASH,
  ROUTE_LINE_WIDTH,
} from '../../constants/config';
import { MAP_STYLE } from '../../constants/mapStyle';
import { MAP_STRINGS } from '../../constants/strings';
import { COLORS, SPACING } from '../../constants/theme';
import { MAP_PROVIDER } from './mapConfig';
import { DropPin, VehiclePin } from './RoutePins';
import type { RouteMapProps } from './routeMapTypes';

export type { RouteMapProps } from './routeMapTypes';

const MARKER_ANCHOR = { x: 0.5, y: 0.5 };
const MIN_ROUTE_POINTS = 2;

export default function RouteMap({
  start,
  pickup,
  end,
  dropoff,
  route,
  region,
  satellite,
}: RouteMapProps) {
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<MapView>(null);
  // Custom marker views need a brief re-render window before snapshotting.
  const [tracking, setTracking] = useState(true);
  const hasRoute = route.length >= MIN_ROUTE_POINTS;

  useEffect(() => {
    const id = setTimeout(() => setTracking(false), MARKER_TRACKING_MS);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (mapReady && hasRoute) {
      mapRef.current?.fitToCoordinates(route, { edgePadding: ROUTE_FIT_PADDING, animated: true });
    }
  }, [mapReady, hasRoute, route]);

  return (
    <>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={MAP_PROVIDER}
        mapType={satellite ? 'hybrid' : 'standard'}
        customMapStyle={satellite ? undefined : MAP_STYLE}
        initialRegion={region}
        onMapReady={() => setMapReady(true)}
        toolbarEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        <Marker
          coordinate={start}
          title={MAP_STRINGS.pickupMarker}
          description={pickup}
          anchor={MARKER_ANCHOR}
          tracksViewChanges={tracking}
        >
          <VehiclePin />
        </Marker>
        <Marker
          coordinate={end}
          title={MAP_STRINGS.destinationMarker}
          description={dropoff}
          anchor={MARKER_ANCHOR}
          tracksViewChanges={tracking}
        >
          <DropPin />
        </Marker>
        {hasRoute ? (
          <Polyline
            coordinates={route}
            strokeColor={COLORS.orange}
            strokeWidth={ROUTE_LINE_WIDTH}
            lineDashPattern={ROUTE_LINE_DASH}
          />
        ) : null}
      </MapView>

      {!mapReady ? (
        <View style={styles.mapLoading}>
          <ActivityIndicator accessibilityLabel={MAP_STRINGS.loadingMap} color={COLORS.orange} />
        </View>
      ) : null}
    </>
  );
}

const LOADER_TOP = 65;
const LOADER_RADIUS = 20;

const styles = StyleSheet.create({
  mapLoading: {
    position: 'absolute',
    top: LOADER_TOP,
    alignSelf: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.sm + 1,
    borderRadius: LOADER_RADIUS,
    elevation: 3,
    zIndex: 5,
  },
});
