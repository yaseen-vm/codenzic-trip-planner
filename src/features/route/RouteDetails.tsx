import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Layers, Navigation, TriangleAlert } from 'lucide-react-native';
import FloatingIconButton from '../../components/FloatingIconButton';
import RouteMap from '../../components/map/RouteMap';
import PrimaryButton from '../../components/PrimaryButton';
import SectionLabel from '../../components/SectionLabel';
import TripPlaces from '../../components/TripPlaces';
import { ROUTE_STRINGS } from '../../constants/strings';
import { COLORS, FONTS, RADIUS, SHADOWS, SIZES, SPACING } from '../../constants/theme';
import { useRoute } from '../../hooks/useRoute';
import type { Coordinate } from '../../types/geo';
import { regionAround } from '../../utils/mapRegion';
import ModeSelector from './ModeSelector';
import RouteSummary from './RouteSummary';
import { confirmStartNavigation } from './startNavigation';
import StepList from './StepList';
import { DEFAULT_TRAVEL_MODE } from './travelModes';

interface RouteDetailsProps {
  start: Coordinate;
  end: Coordinate;
  pickup: string;
  dropoff: string;
}

const MIN_MAP_HEIGHT = 160;
const SHEET_OVERLAP = -28;
const SHEET_MAX_HEIGHT = '64%';
const SHEET_MIN_HEIGHT = 380;
const HANDLE_WIDTH = 40;
const HANDLE_HEIGHT = 4;
const BANNER_HEIGHT = 36;
const BANNER_BOTTOM = 48;
const STEPS_MIN_HEIGHT = 60;

const MIN_ROUTE_POINTS = 2;
const NO_PATH: Coordinate[] = [];
const NO_STEPS: never[] = [];

const TRAFFIC_MESSAGES = {
  none: '',
  moderate: ROUTE_STRINGS.moderateTraffic,
  heavy: ROUTE_STRINGS.heavyTraffic,
} as const;

// Map, route summary and turn-by-turn sheet for a pair of valid coordinates.
export default function RouteDetails({ start, end, pickup, dropoff }: RouteDetailsProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState(DEFAULT_TRAVEL_MODE);
  const [satellite, setSatellite] = useState(false);
  const state = useRoute({ start, end, mode });
  const region = useMemo(() => regionAround(start, end), [start, end]);

  const route = state.status === 'ready' ? state.route : null;
  const trafficText = route && TRAFFIC_MESSAGES[route.traffic];
  const canNavigate = Boolean(route && route.path.length >= MIN_ROUTE_POINTS);

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
            route={route?.path ?? NO_PATH}
            region={region}
            satellite={satellite}
          />
          {trafficText ? (
            <View style={styles.trafficBanner}>
              <TriangleAlert size={SIZES.iconSm} color={COLORS.white} />
              <Text style={styles.trafficText}>{trafficText}</Text>
            </View>
          ) : null}
        </View>

        <FloatingIconButton label={ROUTE_STRINGS.backToLocations} onPress={() => router.back()}>
          <ChevronLeft size={SIZES.iconLg} color={COLORS.text} />
        </FloatingIconButton>
        <FloatingIconButton
          label={ROUTE_STRINGS.toggleLayers}
          onPress={() => setSatellite((value) => !value)}
          style={styles.layersButton}
        >
          <Layers size={20} color={COLORS.text} />
        </FloatingIconButton>

        <View style={[styles.sheet, { paddingBottom: SPACING.lg + insets.bottom }]}>
          <View style={styles.handle} />
          <RouteSummary state={state} />
          <ModeSelector mode={mode} onChange={setMode} />
          <TripPlaces pickup={pickup} dropoff={dropoff} tinted />
          <SectionLabel style={styles.sectionLabel}>{ROUTE_STRINGS.turnByTurn}</SectionLabel>
          <View style={styles.steps}>
            <StepList
              loading={state.status === 'loading'}
              steps={route?.steps ?? NO_STEPS}
              message={state.status === 'error' ? state.message : undefined}
            />
          </View>
          <View style={styles.start}>
            <PrimaryButton
              label={ROUTE_STRINGS.startNavigation}
              icon={<Navigation size={20} color={COLORS.white} />}
              disabled={!canNavigate}
              onPress={() => confirmStartNavigation(start, end, mode)}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  container: { flex: 1, backgroundColor: COLORS.mapBackground },
  mapArea: { flex: 1, minHeight: MIN_MAP_HEIGHT },
  layersButton: { left: undefined, right: SPACING.lg },
  trafficBanner: {
    position: 'absolute',
    left: SPACING.lg,
    bottom: BANNER_BOTTOM,
    height: BANNER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: 14,
    borderRadius: BANNER_HEIGHT / 2,
    backgroundColor: COLORS.banner,
    zIndex: 6,
  },
  trafficText: { color: COLORS.white, fontFamily: FONTS.bold, fontSize: 13 },
  sheet: {
    marginTop: SHEET_OVERLAP,
    maxHeight: SHEET_MAX_HEIGHT,
    minHeight: SHEET_MIN_HEIGHT,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.sheet,
    borderTopRightRadius: RADIUS.sheet,
    paddingHorizontal: SPACING.xl,
    paddingTop: 10,
    zIndex: 10,
    ...SHADOWS.sheet,
  },
  handle: {
    width: HANDLE_WIDTH,
    height: HANDLE_HEIGHT,
    borderRadius: HANDLE_HEIGHT / 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  sectionLabel: { marginBottom: SPACING.sm },
  steps: { flex: 1, minHeight: STEPS_MIN_HEIGHT },
  start: { marginTop: SPACING.md },
});
