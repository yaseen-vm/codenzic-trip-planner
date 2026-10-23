import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import RouteMap, { MapRegion } from '../components/RouteMap';
import TripPlaces from '../components/TripPlaces';
import {
  ArrowUp,
  ChevronLeft,
  CornerUpLeft,
  CornerUpRight,
  Layers,
  Merge,
  Navigation,
  RotateCw,
  Ship,
  TriangleAlert,
} from 'lucide-react-native';
import { COLORS, FONTS, RADIUS } from '../constants/theme';

type TravelMode = 'DRIVE' | 'TWO_WHEELER' | 'WALK';
type Coordinate = { latitude: number; longitude: number };
type Step = { title: string; subtitle?: string; distanceMeters?: number; maneuver?: string };
const ROUTES_KEY = process.env.EXPO_PUBLIC_GOOGLE_ROUTES_API_KEY;
const MAX_STEPS = 20;

const MODES: { key: TravelMode; label: string }[] = [
  { key: 'DRIVE', label: 'Drive' },
  { key: 'TWO_WHEELER', label: 'Ride' },
  { key: 'WALK', label: 'Walk' },
];

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

function formatDistance(meters: number) {
  return meters < 1000 ? Math.round(meters) + ' m' : (meters / 1000).toFixed(1) + ' km';
}

function formatDuration(seconds: number) {
  return seconds < 3600
    ? Math.max(1, Math.round(seconds / 60)) + ' min'
    : Math.floor(seconds / 3600) + ' hr ' + Math.round((seconds % 3600) / 60) + ' min';
}

function formatArrival(seconds: number) {
  const arrival = new Date(Date.now() + seconds * 1000);
  const hours = String(arrival.getHours()).padStart(2, '0');
  const minutes = String(arrival.getMinutes()).padStart(2, '0');
  return hours + ':' + minutes;
}

function maneuverIcon(maneuver?: string) {
  if (!maneuver) return ArrowUp;
  if (maneuver.startsWith('ROUNDABOUT') || maneuver.startsWith('UTURN')) return RotateCw;
  if (maneuver.includes('LEFT')) return CornerUpLeft;
  if (maneuver.includes('RIGHT')) return CornerUpRight;
  if (maneuver === 'MERGE') return Merge;
  if (maneuver === 'FERRY' || maneuver === 'FERRY_TRAIN') return Ship;
  return ArrowUp;
}

export default function RouteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
  const [arrival, setArrival] = useState('');
  const [steps, setSteps] = useState<Step[]>([]);
  const [message, setMessage] = useState('');
  const [traffic, setTraffic] = useState('');
  const [loading, setLoading] = useState(false);
  const [satellite, setSatellite] = useState(false);

  const region: MapRegion = useMemo(
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
    function showError(text: string, durationText: string) {
      setRoute([]);
      setDistance('Route unavailable');
      setDuration(durationText);
      setArrival('');
      setTraffic('');
      setSteps([]);
      setMessage(text);
    }
    async function fetchRoute() {
      if (!ROUTES_KEY || !params.pickupLat || !params.dropoffLat) {
        showError(
          'Add EXPO_PUBLIC_GOOGLE_ROUTES_API_KEY to calculate road routes and travel time.',
          'Configuration required',
        );
        return;
      }
      setLoading(true);
      setMessage('');
      try {
        const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': ROUTES_KEY,
            'X-Goog-FieldMask':
              'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.steps.distanceMeters,routes.legs.steps.navigationInstruction,routes.travelAdvisory.speedReadingIntervals',
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
            extraComputations: mode === 'DRIVE' ? ['TRAFFIC_ON_POLYLINE'] : undefined,
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
        const seconds = Number.parseInt(first.duration ?? '0s', 10);
        setRoute(decodePolyline(first.polyline.encodedPolyline));
        setDistance(formatDistance(first.distanceMeters));
        setDuration(formatDuration(seconds));
        setArrival(formatArrival(seconds));

        const speeds: string[] = (first.travelAdvisory?.speedReadingIntervals ?? []).map(
          (interval: any) => interval.speed,
        );
        setTraffic(
          speeds.includes('TRAFFIC_JAM')
            ? 'Heavy traffic on your route'
            : speeds.includes('SLOW')
              ? 'Moderate traffic on your route'
              : '',
        );

        setSteps(
          (first.legs?.[0]?.steps ?? [])
            .map((step: any) => {
              const [title, ...rest] = String(step.navigationInstruction?.instructions ?? '').split(
                '\n',
              );
              return {
                title: (title ?? '').trim(),
                subtitle: rest.join(' ').trim() || undefined,
                distanceMeters: step.distanceMeters,
                maneuver: step.navigationInstruction?.maneuver,
              } as Step;
            })
            .filter((step: Step) => step.title)
            .slice(0, MAX_STEPS),
        );
      } catch (error) {
        if (!cancelled) {
          showError(
            error instanceof Error ? error.message : 'Could not calculate a route.',
            'API setup required',
          );
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
          Linking.openURL(url);
        },
      },
    ]);
  };

  const unavailable = loading || route.length < 2;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.mapArea}>
          <RouteMap
            start={start}
            pickup={pickup}
            end={end}
            dropoff={dropoff}
            route={route}
            region={region}
            satellite={satellite}
          />
          {traffic ? (
            <View style={styles.trafficBanner}>
              <TriangleAlert size={16} color={COLORS.white} />
              <Text style={styles.trafficText}>{traffic}</Text>
            </View>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back to locations"
          onPress={() => router.back()}
          style={styles.mapButton}
        >
          <ChevronLeft size={24} color={COLORS.text} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle map layers"
          onPress={() => setSatellite((value) => !value)}
          style={[styles.mapButton, styles.mapLayers]}
        >
          <Layers size={20} color={COLORS.text} />
        </Pressable>

        <View style={[styles.bottomSheet, { paddingBottom: 16 + insets.bottom }]}>
          <View style={styles.handle} />
          <View style={styles.summaryHeader}>
            <View style={styles.summaryMain}>
              <Text style={styles.eyebrow}>Fastest route</Text>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
                style={styles.duration}
              >
                {loading ? 'Calculating…' : duration || '—'}
              </Text>
            </View>
            <Text style={styles.distance}>
              {distance || '—'}
              {arrival ? (
                <>
                  <Text style={styles.distanceDot}> · </Text>
                  {'arrive '}
                  {arrival}
                </>
              ) : null}
            </Text>
          </View>
          <View style={styles.modeRow}>
            {MODES.map((item) => {
              const active = mode === item.key;
              return (
                <Pressable
                  key={item.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setMode(item.key)}
                  style={[styles.modeButton, active && styles.modeButtonActive]}
                >
                  <Text style={[styles.modeText, active && styles.modeTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <TripPlaces pickup={pickup} dropoff={dropoff} tinted />
          <Text style={styles.sectionLabel}>Turn by turn</Text>
          <View style={styles.stepsContainer}>
            {loading ? (
              <ActivityIndicator color={COLORS.orange} style={{ marginTop: 12 }} />
            ) : steps.length ? (
              <ScrollView
                style={styles.stepsScroll}
                contentContainerStyle={styles.stepsContent}
                showsVerticalScrollIndicator={false}
              >
                {steps.map((step, index) => {
                  const Icon = maneuverIcon(step.maneuver);
                  return (
                    <View key={index} style={[styles.stepRow, index > 0 && styles.stepDivider]}>
                      <View style={styles.stepIcon}>
                        <Icon size={16} color={COLORS.text} />
                      </View>
                      <View style={styles.stepText}>
                        <Text style={styles.stepTitle}>{step.title}</Text>
                        {step.subtitle ? (
                          <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                        ) : null}
                      </View>
                      {step.distanceMeters ? (
                        <Text style={styles.stepDistance}>
                          {formatDistance(step.distanceMeters)}
                        </Text>
                      ) : null}
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={styles.emptyText}>
                {message || 'Route directions will appear here.'}
              </Text>
            )}
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={startNavigation}
            disabled={unavailable}
            style={[styles.startButton, unavailable && { opacity: 0.5 }]}
          >
            <Navigation size={20} color={COLORS.white} />
            <Text style={styles.startText}>Start navigation</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  container: { flex: 1, backgroundColor: '#E9E3D9' },
  mapButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: RADIUS.control,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 10,
  },
  mapLayers: { left: undefined, right: 16 },
  mapArea: { flex: 1, minHeight: 160 },
  trafficBanner: {
    position: 'absolute',
    left: 16,
    bottom: 48,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: COLORS.banner,
    zIndex: 6,
  },
  trafficText: { color: COLORS.white, fontFamily: FONTS.bold, fontSize: 13 },
  bottomSheet: {
    marginTop: -28,
    maxHeight: '64%',
    minHeight: 380,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.sheet,
    borderTopRightRadius: RADIUS.sheet,
    paddingHorizontal: 20,
    paddingTop: 10,
    elevation: 8,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    zIndex: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  summaryMain: { flex: 1, marginRight: 12 },
  eyebrow: {
    color: COLORS.faint,
    fontFamily: FONTS.extraBold,
    fontSize: 13,
    lineHeight: 19.5,
    letterSpacing: 1.04,
  },
  duration: {
    color: COLORS.text,
    fontFamily: FONTS.extraBold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.85,
  },
  distance: {
    color: COLORS.muted,
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 6,
  },
  distanceDot: { color: COLORS.faint },
  modeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  modeButton: {
    flex: 1,
    height: 43,
    borderRadius: RADIUS.control,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonActive: { backgroundColor: COLORS.paleOrange, borderColor: COLORS.orange },
  modeText: { color: COLORS.text, fontFamily: FONTS.bold, fontSize: 14 },
  modeTextActive: { color: COLORS.orangeDark },
  sectionLabel: {
    color: COLORS.faint,
    fontFamily: FONTS.extraBold,
    fontSize: 13,
    lineHeight: 19.5,
    letterSpacing: 1.04,
    marginBottom: 8,
  },
  stepsContainer: { flex: 1, minHeight: 60 },
  stepsScroll: { flex: 1 },
  stepsContent: { paddingBottom: 6 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, minHeight: 66 },
  stepDivider: { borderTopWidth: 1, borderTopColor: COLORS.border },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepText: { flex: 1, minWidth: 0, marginLeft: 12 },
  stepTitle: { color: COLORS.text, fontFamily: FONTS.bold, fontSize: 15, lineHeight: 20.6 },
  stepSubtitle: {
    color: COLORS.muted,
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19.5,
    marginTop: 2,
  },
  stepDistance: {
    color: COLORS.muted,
    fontFamily: FONTS.bold,
    fontSize: 13,
    lineHeight: 19.5,
    marginLeft: 12,
    marginTop: 2,
  },
  emptyText: { color: COLORS.muted, fontFamily: FONTS.regular, fontSize: 14, lineHeight: 20 },
  startButton: {
    height: 56,
    borderRadius: RADIUS.control,
    backgroundColor: COLORS.orange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  startText: { color: COLORS.white, fontFamily: FONTS.extraBold, fontSize: 17 },
});
