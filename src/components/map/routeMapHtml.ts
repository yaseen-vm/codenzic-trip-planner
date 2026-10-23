import { MAP_STRINGS } from '../../constants/strings';
import { COLORS } from '../../constants/theme';
import { serializeForInlineScript } from '../../utils/inlineScriptJson';
import type { RouteMapProps } from './routeMapTypes';

const LEAFLET_VERSION = '1.9.4';
const LEAFLET_BASE_URL = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist`;
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>';

const MAP_BACKGROUND = '#E8EEF0';
const MARKER_SIZE = 18;
const ROUTE_WEIGHT = 5;
const ROUTE_OPACITY = 0.95;
const FIT_PADDING_TOP_LEFT = [50, 60];
const FIT_PADDING_RIGHT = 50;
const MAX_SHEET_PADDING = 360;
const SHEET_PADDING_RATIO = 0.48;
const MAX_ZOOM_WITH_ROUTE = 16;
const MAX_ZOOM_WITHOUT_ROUTE = 15;
const MAX_TILE_ZOOM = 19;

type MapHtmlInput = Pick<RouteMapProps, 'start' | 'end' | 'pickup' | 'dropoff' | 'route'>;

const STYLES = `
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: ${MAP_BACKGROUND}; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    #map { width: 100%; height: 100%; }
    .start-marker, .end-marker { width: ${MARKER_SIZE}px; height: ${MARKER_SIZE}px; border: 3px solid ${COLORS.white}; box-shadow: 0 2px 6px rgba(0,0,0,0.35); }
    .start-marker { background: ${COLORS.orange}; border-radius: 50%; }
    .end-marker { background: ${COLORS.dark}; border-radius: 4px; }
    .leaflet-bar { border: none !important; box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important; border-radius: 10px !important; overflow: hidden; }
    .leaflet-bar a { background-color: ${COLORS.white} !important; color: ${COLORS.dark} !important; border-bottom: 1px solid ${COLORS.border} !important; width: 34px !important; height: 34px !important; line-height: 34px !important; font-size: 16px !important; }
    .leaflet-bar a:hover { background-color: ${COLORS.background} !important; }
    .leaflet-top.leaflet-right { top: 14px; right: 14px; }
    .leaflet-control-attribution { font-size: 9px !important; background: rgba(255,255,255,0.7) !important; }`;

/**
 * Builds the self-contained Leaflet page rendered inside the web map iframe. Every dynamic value is
 * serialized with `serializeForInlineScript` so place names cannot break out of the script element.
 */
export function buildRouteMapHtml({ start, end, pickup, dropoff, route }: MapHtmlInput): string {
  const data = {
    start: serializeForInlineScript(start),
    end: serializeForInlineScript(end),
    pickup: serializeForInlineScript(pickup),
    dropoff: serializeForInlineScript(dropoff),
    route: serializeForInlineScript(route),
    pickupHeading: serializeForInlineScript(MAP_STRINGS.pickupMarker),
    destinationHeading: serializeForInlineScript(MAP_STRINGS.destinationMarker),
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="${LEAFLET_BASE_URL}/leaflet.css" />
  <script src="${LEAFLET_BASE_URL}/leaflet.js"></script>
  <style>${STYLES}
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    (function() {
      const start = ${data.start};
      const end = ${data.end};
      const pickup = ${data.pickup};
      const dropoff = ${data.dropoff};
      const route = ${data.route};

      const map = L.map('map', { zoomControl: false, attributionControl: true });
      L.control.zoom({ position: 'topright' }).addTo(map);

      L.tileLayer('${TILE_URL}', {
        maxZoom: ${MAX_TILE_ZOOM},
        subdomains: 'abcd',
        attribution: '${TILE_ATTRIBUTION}'
      }).addTo(map);

      function markerIcon(className) {
        return L.divIcon({
          className: className + '-wrap',
          html: '<div class="' + className + '"></div>',
          iconSize: [${MARKER_SIZE}, ${MARKER_SIZE}],
          iconAnchor: [${MARKER_SIZE / 2}, ${MARKER_SIZE / 2}]
        });
      }

      function popupContent(label, heading) {
        const container = document.createElement('div');
        const title = document.createElement('strong');
        title.textContent = heading;
        const value = document.createElement('div');
        value.textContent = label;
        container.appendChild(title);
        container.appendChild(value);
        return container;
      }

      L.marker([start.latitude, start.longitude], { icon: markerIcon('start-marker'), title: pickup })
        .bindPopup(popupContent(pickup, ${data.pickupHeading}))
        .addTo(map);

      L.marker([end.latitude, end.longitude], { icon: markerIcon('end-marker'), title: dropoff })
        .bindPopup(popupContent(dropoff, ${data.destinationHeading}))
        .addTo(map);

      function fitRoute() {
        const bottomPadding = Math.min(window.innerHeight * ${SHEET_PADDING_RATIO}, ${MAX_SHEET_PADDING});
        const padding = {
          paddingTopLeft: [${FIT_PADDING_TOP_LEFT.join(', ')}],
          paddingBottomRight: [${FIT_PADDING_RIGHT}, bottomPadding]
        };
        if (route && route.length > 1) {
          const latLngs = route.map(function(pt) { return [pt.latitude, pt.longitude]; });
          const polyline = L.polyline(latLngs, {
            color: '${COLORS.orange}',
            weight: ${ROUTE_WEIGHT},
            opacity: ${ROUTE_OPACITY},
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);
          map.fitBounds(polyline.getBounds(), Object.assign({ maxZoom: ${MAX_ZOOM_WITH_ROUTE} }, padding));
        } else {
          const bounds = L.latLngBounds([
            [start.latitude, start.longitude],
            [end.latitude, end.longitude]
          ]);
          map.fitBounds(bounds, Object.assign({ maxZoom: ${MAX_ZOOM_WITHOUT_ROUTE} }, padding));
        }
      }

      fitRoute();
      window.addEventListener('resize', function() { map.invalidateSize(); });
    })();
  </script>
</body>
</html>`;
}
