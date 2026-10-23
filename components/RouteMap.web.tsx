import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

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

export default function RouteMap({ start, pickup, end, dropoff, route, region }: RouteMapProps) {
  const mapHtml = useMemo(() => {
    const startJson = JSON.stringify(start);
    const endJson = JSON.stringify(end);
    const pickupJson = JSON.stringify(pickup);
    const dropoffJson = JSON.stringify(dropoff);
    const routeJson = JSON.stringify(route);
    const regionJson = JSON.stringify(region);

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #E8EEF0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    #map {
      width: 100%;
      height: 100%;
    }
    .start-marker {
      width: 18px;
      height: 18px;
      background: #F1521F;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    }
    .end-marker {
      width: 18px;
      height: 18px;
      background: #172533;
      border: 3px solid #FFFFFF;
      border-radius: 4px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    }
    .leaflet-bar {
      border: none !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
      border-radius: 10px !important;
      overflow: hidden;
    }
    .leaflet-bar a {
      background-color: #FFFFFF !important;
      color: #172533 !important;
      border-bottom: 1px solid #E7EBEF !important;
      width: 34px !important;
      height: 34px !important;
      line-height: 34px !important;
      font-size: 16px !important;
    }
    .leaflet-bar a:hover {
      background-color: #F4F6F8 !important;
    }
    .leaflet-top.leaflet-right {
      top: 14px;
      right: 14px;
    }
    .leaflet-control-attribution {
      font-size: 9px !important;
      background: rgba(255,255,255,0.7) !important;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    (function() {
      const start = ${startJson};
      const end = ${endJson};
      const pickup = ${pickupJson};
      const dropoff = ${dropoffJson};
      const route = ${routeJson};
      const region = ${regionJson};

      const map = L.map('map', {
        zoomControl: false,
        attributionControl: true
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>'
      }).addTo(map);

      const startIcon = L.divIcon({
        className: 'start-marker-wrap',
        html: '<div class="start-marker"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      const endIcon = L.divIcon({
        className: 'end-marker-wrap',
        html: '<div class="end-marker"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      L.marker([start.latitude, start.longitude], { icon: startIcon, title: pickup })
        .bindPopup('<b>Pickup</b><br>' + pickup)
        .addTo(map);

      L.marker([end.latitude, end.longitude], { icon: endIcon, title: dropoff })
        .bindPopup('<b>Destination</b><br>' + dropoff)
        .addTo(map);

      function fitRoute() {
        const bottomPadding = Math.min(window.innerHeight * 0.48, 360);
        if (route && route.length > 1) {
          const latLngs = route.map(function(pt) { return [pt.latitude, pt.longitude]; });
          const polyline = L.polyline(latLngs, {
            color: '#F1521F',
            weight: 5,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);

          map.fitBounds(polyline.getBounds(), {
            paddingTopLeft: [50, 60],
            paddingBottomRight: [50, bottomPadding],
            maxZoom: 16
          });
        } else {
          const bounds = L.latLngBounds([
            [start.latitude, start.longitude],
            [end.latitude, end.longitude]
          ]);
          map.fitBounds(bounds, {
            paddingTopLeft: [50, 60],
            paddingBottomRight: [50, bottomPadding],
            maxZoom: 15
          });
        }
      }

      fitRoute();

      window.addEventListener('resize', function() {
        map.invalidateSize();
      });
    })();
  </script>
</body>
</html>`;
  }, [start, end, pickup, dropoff, route, region]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <iframe
        title="Interactive Route Map"
        srcDoc={mapHtml}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
      />
    </View>
  );
}
