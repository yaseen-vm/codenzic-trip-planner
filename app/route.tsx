import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { ArrowLeft, Navigation, CarFront, Bike, Footprints } from 'lucide-react-native';

const COLORS = {
  white: '#FFFFFF',
  text: '#172533',
  muted: '#8090A2',
  border: '#E7EBEF',
  orange: '#F1521F',
  paleOrange: '#FFF0EA',
  errorBg: '#FDF2F2',
  errorText: '#C81E1E',
};
type TravelMode = 'DRIVE' | 'TWO_WHEELER' | 'WALK';
type Coordinate = { latitude: number; longitude: number };
const ROUTES_KEY = process.env.EXPO_PUBLIC_GOOGLE_ROUTES_API_KEY;

function decodePolyline(encoded: string): Coordinate[] {
  const points: Coordinate[] = [];
  let index = 0,
    latitude = 0,
    longitude = 0;
  while (index < encoded.length) {
    let result = 0,
      shift = 0,
      byte = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    latitude += result & 1 ? ~(result >> 1) : result >> 1;
    result = 0;
    shift = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    longitude += result & 1 ? ~(result >> 1) : result >> 1;
    points.push({ latitude: latitude / 1e5, longitude: longitude / 1e5 });
  }
  return points;
}

export default function RouteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    pickup?: string;
    dropoff?: string;
    pickupLat?: string;
    pickupLng?: string;
    dropoffLat?: string;
    dropoffLng?: string;
  }>();
  const pickup = params.pickup ?? 'Pickup';
  const dropoff = params.dropoff ?? 'Destination';
  const start: Coordinate = useMemo(
    () => ({
      latitude: Number(params.pickupLat) || 9.9312,
      longitude: Number(params.pickupLng) || 76.2673,
    }),
    [params.pickupLat, params.pickupLng],
  );
  const end: Coordinate = useMemo(
    () => ({
      latitude: Number(params.dropoffLat) || 10.0159,
      longitude: Number(params.dropoffLng) || 76.3419,
    }),
    [params.dropoffLat, params.dropoffLng],
  );
  const [mode, setMode] = useState<TravelMode>('DRIVE');
  const [route, setRoute] = useState<Coordinate[]>([]);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (mapReady && mapRef.current && route.length > 1) {
      mapRef.current.fitToCoordinates(route, {
        edgePadding: { top: 70, right: 70, bottom: 70, left: 70 },
        animated: true,
      });
    }
  }, [mapReady, route]);

  const region: Region = useMemo(
    () => ({
      latitude: (start.latitude + end.latitude) / 2,
      longitude: (start.longitude + end.longitude) / 2,
      latitudeDelta: Math.max(Math.abs(start.latitude - end.latitude) * 2.3, 0.025),
      longitudeDelta: Math.max(Math.abs(start.longitude - end.longitude) * 2.3, 0.025),
    }),
    [start.latitude, start.longitude, end.latitude, end.longitude],
  );

  useEffect(() => {
    let cancelled = false;
    async function fetchRoute() {
      if (!ROUTES_KEY || !params.pickupLat || !params.dropoffLat) {
        setRoute([]);
        setDistance('Route unavailable');
        setDuration('Configuration required');
        setSteps([
          'Add EXPO_PUBLIC_GOOGLE_ROUTES_API_KEY to calculate road routes and travel time.',
        ]);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': ROUTES_KEY,
            'X-Goog-FieldMask':
              'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.steps.navigationInstruction.instructions',
          },
          body: JSON.stringify({
            origin: {
              location: { latLng: { latitude: start.latitude, longitude: start.longitude } },
            },
            destination: {
              location: { latLng: { latitude: end.latitude, longitude: end.longitude } },
            },
            travelMode: mode,
            routingPreference: mode === 'DRIVE' ? 'TRAFFIC_AWARE' : 'TRAFFIC_UNAWARE',
            computeAlternativeRoutes: false,
            languageCode: 'en',
            units: 'METRIC',
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.routes?.[0]) {
          const rawMessage = data.error?.message ?? 'No route returned';
          if (
            rawMessage.toLowerCase().includes('routes api has not been used') ||
            rawMessage.toLowerCase().includes('disabled')
          ) {
            throw new Error(
              'Routes API is disabled in Google Cloud Console. Enable "Routes API" in your Google Cloud Console for project 639677756500.',
            );
          }
          throw new Error(rawMessage);
        }
        const first = data.routes[0];
        if (cancelled) return;
        setRoute(decodePolyline(first.polyline.encodedPolyline));
        setDistance((first.distanceMeters / 1000).toFixed(1) + ' km');
        const seconds = Number.parseInt(first.duration ?? '0s', 10);
        setDuration(
          seconds < 3600
            ? Math.max(1, Math.round(seconds / 60)) + ' min'
            : Math.floor(seconds / 3600) + ' hr ' + Math.round((seconds % 3600) / 60) + ' min',
        );
        setSteps(
          (first.legs?.[0]?.steps ?? [])
            .map((step: any) => step.navigationInstruction?.instructions)
            .filter(Boolean)
            .slice(0, 8),
        );
      } catch (error) {
        if (!cancelled) {
          setRoute([]);
          setDistance('Route unavailable');
          setDuration('API setup required');
          setSteps([error instanceof Error ? error.message : 'Could not calculate a route.']);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchRoute();
    return () => {
      cancelled = true;
    };
  }, [mode, params.pickupLat, params.dropoffLat, start, end]);

  const startNavigation = () => {
    Alert.alert('Open turn-by-turn navigation?', 'This opens Google Maps for live GPS guidance.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open Maps',
        onPress: () => {
          const url =
            'https://www.google.com/maps/dir/?api=1&origin=' +
            start.latitude +
            ',' +
            start.longitude +
            '&destination=' +
            end.latitude +
            ',' +
            end.longitude +
            '&travelmode=' +
            (mode === 'WALK' ? 'walking' : mode === 'TWO_WHEELER' ? 'bicycling' : 'driving');
          import('react-native').then(({ Linking }) => Linking.openURL(url));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.container}>
        {Platform.OS === 'web' ? (
          <View style={styles.webFallback}>
            <Text style={styles.webFallbackTitle}>Interactive Map</Text>
            <Text style={styles.webFallbackSub}>
              Native maps render on mobile (Android/iOS). Use an Android device or emulator to test.
            </Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            provider={PROVIDER_GOOGLE}
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
              pinColor={COLORS.orange}
            />
            <Marker coordinate={end} title="Destination" description={dropoff} />
            {route.length > 1 ? (
              <Polyline
                coordinates={route}
                strokeColor={COLORS.orange}
                strokeWidth={5}
                lineCap="round"
                lineJoin="round"
              />
            ) : null}
          </MapView>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back to locations"
          onPress={() => router.back()}
          style={styles.mapBack}
        >
          <ArrowLeft size={21} color={COLORS.text} />
        </Pressable>

        {!mapReady && Platform.OS !== 'web' ? (
          <View style={styles.mapLoading}>
            <ActivityIndicator color={COLORS.orange} />
          </View>
        ) : null}

        <View style={styles.bottomSheet}>
          <View style={styles.handle} />
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.eyebrow}>ROUTE SUMMARY</Text>
              <Text style={styles.duration}>{loading ? 'Calculating…' : duration || '—'}</Text>
            </View>
            <Text style={styles.distance}>{distance || '—'}</Text>
          </View>
          <View style={styles.modeRow}>
            {(
              [
                { key: 'DRIVE', label: 'Drive', icon: CarFront },
                { key: 'TWO_WHEELER', label: 'Ride', icon: Bike },
                { key: 'WALK', label: 'Walk', icon: Footprints },
              ] as const
            ).map((item) => {
              const active = mode === item.key;
              const Icon = item.icon;
              return (
                <Pressable
                  key={item.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setMode(item.key)}
                  style={[styles.modeButton, active && styles.modeButtonActive]}
                >
                  <Icon size={15} color={active ? COLORS.orange : COLORS.text} />
                  <Text style={[styles.modeText, active && styles.modeTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.placesCard}>
            <View style={styles.placeRail}>
              <View style={styles.startDot} />
              <View style={styles.placeLine} />
              <View style={styles.endDot} />
            </View>
            <View style={styles.placeLabels}>
              <Text numberOfLines={2} style={styles.placeText}>
                {pickup}
              </Text>
              <Text numberOfLines={2} style={styles.placeText}>
                {dropoff}
              </Text>
            </View>
          </View>
          <Text style={styles.sectionLabel}>DIRECTIONS & STATUS</Text>
          <View style={styles.stepsContainer}>
            {loading ? (
              <ActivityIndicator color={COLORS.orange} style={{ marginTop: 12 }} />
            ) : steps.length ? (
              <ScrollView
                style={styles.stepsScroll}
                contentContainerStyle={styles.stepsContent}
                showsVerticalScrollIndicator={true}
              >
                {steps.map((step, index) => (
                  <View key={index} style={styles.stepRow}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                    <Text style={styles.stepTitle}>{step}</Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.emptyText}>Route directions will appear here.</Text>
            )}
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={startNavigation}
            disabled={loading || route.length < 2}
            style={[styles.startButton, (loading || route.length < 2) && { opacity: 0.5 }]}
          >
            <Navigation size={17} color={COLORS.white} />
            <Text style={styles.startText}>Start navigation in Google Maps</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  container: { flex: 1, backgroundColor: '#E8EEF0' },
  webFallback: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F0F4F8',
  },
  webFallbackTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  webFallbackSub: { fontSize: 12, color: COLORS.muted, textAlign: 'center' },
  mapBack: {
    position: 'absolute',
    top: 12,
    left: 13,
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 10,
  },
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
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '58%',
    minHeight: 340,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 9,
    paddingBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    zIndex: 10,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E4E9ED',
    alignSelf: 'center',
    marginBottom: 12,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  eyebrow: { color: '#A0ADBB', fontSize: 9, fontWeight: '700', marginBottom: 3 },
  duration: { color: COLORS.text, fontSize: 23, lineHeight: 28, fontWeight: '800' },
  distance: { color: COLORS.muted, fontSize: 12, marginBottom: 5, fontWeight: '600' },
  modeRow: { flexDirection: 'row', gap: 7, marginBottom: 12 },
  modeButton: {
    flex: 1,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  modeButtonActive: { backgroundColor: COLORS.paleOrange, borderColor: COLORS.orange },
  modeText: { color: COLORS.text, fontSize: 11, fontWeight: '600' },
  modeTextActive: { color: COLORS.orange },
  placesCard: {
    minHeight: 65,
    flexDirection: 'row',
    backgroundColor: '#F4F6F8',
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 10,
    marginBottom: 12,
  },
  placeRail: { width: 15, alignItems: 'center', paddingTop: 4, paddingBottom: 3 },
  startDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.orange },
  placeLine: { flex: 1, width: 1, backgroundColor: '#C9D1D9', marginVertical: 2 },
  endDot: { width: 7, height: 7, borderRadius: 2, backgroundColor: COLORS.text },
  placeLabels: { flex: 1, justifyContent: 'space-between', gap: 8 },
  placeText: { color: COLORS.text, fontSize: 11, fontWeight: '600' },
  sectionLabel: { color: '#A0ADBB', fontSize: 9, fontWeight: '700', marginBottom: 7 },
  stepsContainer: { flex: 1, minHeight: 60 },
  stepsScroll: { flex: 1 },
  stepsContent: { paddingBottom: 6 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F2F4F6',
    textAlign: 'center',
    textAlignVertical: 'center',
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '700',
    overflow: 'hidden',
    marginTop: 2,
  },
  stepTitle: { flex: 1, color: COLORS.text, fontSize: 11, lineHeight: 16 },
  emptyText: { color: COLORS.muted, fontSize: 11, lineHeight: 16 },
  startButton: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: COLORS.orange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  startText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
});
