import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { MAP_PROVIDER, MAP_STYLE } from './mapConfig';

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export interface RouteMapProps {
  start: Coordinate;
  pickup: string;
  end: Coordinate;
  dropoff: string;
  route: Coordinate[];
  region: MapRegion;
  satellite?: boolean;
}

const STROKE = { stroke: '#fff', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

function VehiclePin() {
  return (
    <Svg width={36} height={36} viewBox="5 10 36 36">
      <Rect x={5} y={10} width={36} height={36} rx={18} fill="#F25424" />
      <Rect x={6} y={11} width={34} height={34} rx={17} stroke="#fff" strokeWidth={2} fill="none" />
      <Path
        d="M24.3401 31.99V23.9929C24.3401 23.2567 23.7431 22.66 23.0068 22.66H17.6734C16.937 22.66 16.3401 23.2567 16.3401 23.9929V31.3236C16.3401 31.6916 16.6386 31.99 17.0068 31.99H18.3401"
        fill="none"
        {...STROKE}
      />
      <Path d="M25 32H21" fill="none" {...STROKE} />
      <Path
        d="M27.6713 32H29.0038C29.3718 32 29.6701 31.7014 29.6701 31.333V28.8985C29.6698 28.7471 29.6181 28.6003 29.5235 28.4822L27.205 25.5808C27.0787 25.4226 26.8876 25.3303 26.6853 25.33H24.3401"
        fill="none"
        {...STROKE}
      />
      <Path
        d="M25 31.995C25 31.2577 25.5977 30.66 26.335 30.66C27.0723 30.66 27.67 31.2577 27.67 31.995C27.67 32.7323 27.0723 33.33 26.335 33.33C25.5977 33.33 25 32.7323 25 31.995Z"
        fill="none"
        {...STROKE}
      />
      <Path
        d="M18.3401 31.995C18.3401 31.2577 18.9378 30.66 19.6751 30.66C20.4124 30.66 21.0101 31.2577 21.0101 31.995C21.0101 32.7323 20.4124 33.33 19.6751 33.33C18.9378 33.33 18.3401 32.7323 18.3401 31.995Z"
        fill="none"
        {...STROKE}
      />
    </Svg>
  );
}

function DropPin() {
  return (
    <Svg width={32} height={32} viewBox="18 10 32 32">
      <Rect x={18} y={10} width={32} height={32} rx={16} fill="#17212F" />
      <Rect
        x={19}
        y={11}
        width={30}
        height={30}
        rx={15}
        stroke="#fff"
        strokeWidth={2}
        fill="none"
      />
      <Path
        d="M39.3399 24.7261C39.3399 28.0877 35.6461 31.5887 34.4057 32.67C34.1683 32.8502 33.8415 32.8502 33.6041 32.67C32.3637 31.5887 28.6699 28.0877 28.6699 24.7261C28.6699 21.7514 31.0585 19.34 34.0049 19.34C36.9514 19.34 39.3399 21.7514 39.3399 24.7261Z"
        fill="none"
        {...STROKE}
      />
      <Path
        d="M32 24.67C32 23.5654 32.8954 22.67 34 22.67C35.1046 22.67 36 23.5654 36 24.67C36 25.7746 35.1046 26.67 34 26.67C32.8954 26.67 32 25.7746 32 24.67Z"
        fill="none"
        {...STROKE}
      />
    </Svg>
  );
}

const COLORS = {
  orange: '#F1521F',
  white: '#FFFFFF',
};

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

  useEffect(() => {
    const id = setTimeout(() => setTracking(false), 800);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (mapReady && mapRef.current && route.length > 1) {
      mapRef.current.fitToCoordinates(route, {
        edgePadding: { top: 90, right: 70, bottom: 90, left: 70 },
        animated: true,
      });
    }
  }, [mapReady, route]);

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
          title="Pickup"
          description={pickup}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={tracking}
        >
          <VehiclePin />
        </Marker>
        <Marker
          coordinate={end}
          title="Destination"
          description={dropoff}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={tracking}
        >
          <DropPin />
        </Marker>
        {route.length > 1 ? (
          <Polyline
            coordinates={route}
            strokeColor={COLORS.orange}
            strokeWidth={2}
            lineDashPattern={[5, 4]}
          />
        ) : null}
      </MapView>

      {!mapReady ? (
        <View style={styles.mapLoading}>
          <ActivityIndicator color={COLORS.orange} />
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  mapLoading: {
    position: 'absolute',
    top: 65,
    alignSelf: 'center',
    backgroundColor: COLORS.white,
    padding: 9,
    borderRadius: 20,
    elevation: 3,
    zIndex: 5,
  },
});
