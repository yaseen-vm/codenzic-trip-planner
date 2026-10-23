import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { MAP_STRINGS } from '../../constants/strings';
import { buildRouteMapHtml } from './routeMapHtml';
import type { RouteMapProps } from './routeMapTypes';

export type { RouteMapProps } from './routeMapTypes';

export default function RouteMap({ start, pickup, end, dropoff, route }: RouteMapProps) {
  const mapHtml = useMemo(
    () => buildRouteMapHtml({ start, end, pickup, dropoff, route }),
    [start, end, pickup, dropoff, route],
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      <iframe title={MAP_STRINGS.webMapTitle} srcDoc={mapHtml} style={IFRAME_STYLE} />
    </View>
  );
}

const IFRAME_STYLE = { width: '100%', height: '100%', border: 'none' } as const;
