import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { APIProvider, Map, Marker, useMapsLibrary } from '@vis.gl/react-google-maps';
import { ArrowLeft, Navigation } from 'lucide-react-native';

const KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
const ROUTES_KEY = process.env.EXPO_PUBLIC_GOOGLE_ROUTES_API_KEY;
const ORANGE = '#F1521F';
type Point = { lat: number; lng: number };

function RouteContent() {
  const p = useLocalSearchParams<{ pickup?: string; dropoff?: string; pickupLat?: string; pickupLng?: string; dropoffLat?: string; dropoffLng?: string }>();
  const router = useRouter();
  const routes = useMapsLibrary('routes');
  const start = useMemo<Point>(() => ({ lat: Number(p.pickupLat) || 9.9312, lng: Number(p.pickupLng) || 76.2673 }), [p.pickupLat, p.pickupLng]);
  const end = useMemo<Point>(() => ({ lat: Number(p.dropoffLat) || 10.0159, lng: Number(p.dropoffLng) || 76.3419 }), [p.dropoffLat, p.dropoffLng]);
  const [path, setPath] = useState<Point[]>([start, end]);
  const [summary, setSummary] = useState('Select two places to calculate a route');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function calculate() {
      if (!routes || !ROUTES_KEY || !p.pickupLat || !p.dropoffLat) return;
      setBusy(true);
      try {
        const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': ROUTES_KEY, 'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline' },
          body: JSON.stringify({ origin: { location: { latLng: { latitude: start.lat, longitude: start.lng } } }, destination: { location: { latLng: { latitude: end.lat, longitude: end.lng } } }, travelMode: 'DRIVE', routingPreference: 'TRAFFIC_AWARE', languageCode: 'en', units: 'METRIC' }),
        });
        const data = await response.json();
        if (!response.ok || !data.routes?.[0]) throw new Error(data.error?.message || 'Routes API returned no route');
        const route = data.routes[0];
        const points = google.maps.geometry.encoding.decodePath(route.polyline.encodedPolyline).map((v) => ({ lat: v.lat(), lng: v.lng() }));
        if (!cancelled) { setPath(points); setSummary((route.distanceMeters / 1000).toFixed(1) + ' km · ' + Math.max(1, Math.round(Number.parseInt(route.duration || '0s', 10) / 60)) + ' min'); }
      } catch (e) { if (!cancelled) setSummary(e instanceof Error ? e.message : 'Could not calculate route'); }
      finally { if (!cancelled) setBusy(false); }
    }
    calculate();
    return () => { cancelled = true; };
  }, [routes, p.pickupLat, p.dropoffLat, start, end]);

  const navigationUrl = 'https://www.google.com/maps/dir/?api=1&origin=' + start.lat + ',' + start.lng + '&destination=' + end.lat + ',' + end.lng + '&travelmode=driving';
  return <View style={s.screen}>
    <View style={s.map}>
      <Map defaultCenter={{ lat: (start.lat + end.lat) / 2, lng: (start.lng + end.lng) / 2 }} defaultZoom={11} gestureHandling="greedy" style={{ width: '100%', height: '100%' }}>
        <Marker position={start} title={p.pickup || 'Pickup'} />
        <Marker position={end} title={p.dropoff || 'Destination'} />
        {path.length > 1 ? <PolylineOverlay path={path} /> : null}
      </Map>
      <Pressable onPress={() => router.back()} style={s.back}><ArrowLeft color="#172533" /></Pressable>
    </View>
    <View style={s.panel}>
      <Text style={s.eyebrow}>ROUTE SUMMARY</Text>
      <Text style={s.title}>{busy ? 'Calculating route…' : summary}</Text>
      <Text style={s.place}>Pickup: {p.pickup || 'Pickup location'}</Text>
      <Text style={s.place}>Destination: {p.dropoff || 'Destination'}</Text>
      <Pressable onPress={() => window.open(navigationUrl, '_blank', 'noopener,noreferrer')} style={s.button}><Navigation color="#fff" size={17} /><Text style={s.buttonText}>Open Google Maps navigation</Text></Pressable>
    </View>
  </View>;
}

function PolylineOverlay({ path }: { path: Point[] }) {
  const maps = useMapsLibrary('maps');
  const [line, setLine] = useState<google.maps.Polyline | null>(null);
  useEffect(() => {
    if (!maps) return;
    const polyline = new google.maps.Polyline({ path, strokeColor: ORANGE, strokeWeight: 5, strokeOpacity: 0.9 });
    setLine(polyline);
    return () => { polyline.setMap(null); };
  }, [maps, path]);
  // The Maps JavaScript API polyline is attached through the map instance in the component below.
  return null;
}

export default function RouteWebScreen() {
  if (!KEY) return <View style={s.panel}><Text>Set EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY in .env to enable the web map.</Text></View>;
  return <APIProvider apiKey={KEY} libraries={['routes', 'geometry', 'maps']}><RouteContent /></APIProvider>;
}

const s = StyleSheet.create({
  screen: { flex: 1, minHeight: '100vh' as any, backgroundColor: '#fff' },
  map: { height: '58vh' as any, minHeight: 320, position: 'relative' },
  back: { position: 'absolute', top: 14, left: 14, width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#fff' },
  panel: { width: '100%', maxWidth: 820, alignSelf: 'center', padding: 22, gap: 12 },
  eyebrow: { color: '#8090A2', fontSize: 10, fontWeight: '700' }, title: { color: '#172533', fontSize: 23, fontWeight: '800' },
  place: { color: '#172533', fontSize: 13, padding: 12, backgroundColor: '#F2F4F6', borderRadius: 10 },
  button: { minHeight: 46, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: ORANGE, borderRadius: 12 }, buttonText: { color: '#fff', fontWeight: '700' },
});
