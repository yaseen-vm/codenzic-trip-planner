import { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  AlertTriangle,
  Layers,
  Navigation,
  CornerUpRight,
  CarFront,
  Bike,
  Footprints,
  MapPin,
} from 'lucide-react-native';

const COLORS = {
  white: '#FFFFFF',
  text: '#172533',
  muted: '#8090A2',
  border: '#E7EBEF',
  orange: '#F1521F',
  paleOrange: '#FFF0EA',
  road: '#FFFFFF',
  land: '#E9E4D7',
  water: '#A9CEDD',
};

type TravelMode = 'Drive' | 'Ride' | 'Walk';

export default function RouteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ pickup?: string; dropoff?: string }>();
  const pickup = typeof params.pickup === 'string' ? params.pickup : 'Home · Villa 12, Street 840';
  const dropoff = typeof params.dropoff === 'string' ? params.dropoff : 'Marina Office Tower · Level 14, Al Fardan Rd';
  const [mode, setMode] = useState<TravelMode>('Drive');
  const [navigating, setNavigating] = useState(false);
  const [showLayers, setShowLayers] = useState(false);

  const trip = useMemo(() => {
    if (mode === 'Walk') return { duration: '38 min', distance: '2.4 km', arrival: 'arrive 10:56' };
    if (mode === 'Ride') return { duration: '18 min', distance: '8.1 km', arrival: 'arrive 10:36' };
    return { duration: '24 min', distance: '9.6 km', arrival: 'arrive 10:42' };
  }, [mode]);

  const ModeIcon = mode === 'Walk' ? Footprints : mode === 'Ride' ? Bike : CarFront;

  const startNavigation = () => {
    setNavigating(true);
    Alert.alert('Navigation started', 'Live GPS guidance will be available after Maps and Directions API keys are configured.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.water} />
      <View style={styles.screen}>
        <View style={styles.mapArea}>
          <View style={styles.water} />
          <View style={styles.landTop} />
          <View style={styles.landLeft} />
          <View style={styles.landRight} />
          <View style={[styles.road, styles.roadOne]} />
          <View style={[styles.road, styles.roadTwo]} />
          <View style={[styles.road, styles.roadThree]} />
          <View style={[styles.road, styles.roadFour]} />
          <View style={[styles.road, styles.roadFive]} />
          <View style={styles.routeLine} />
          <View style={styles.routeDash} />
          <View style={styles.pickupMarker}><CarFront size={15} color={COLORS.white} /></View>
          <View style={styles.destinationMarker}><MapPin size={15} color={COLORS.white} /></View>

          <Pressable accessibilityRole="button" accessibilityLabel="Go back to locations" onPress={() => router.back()} style={styles.mapBack}>
            <ArrowLeft size={21} color={COLORS.text} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Map layers" onPress={() => setShowLayers((v) => !v)} style={styles.layersButton}>
            <Layers size={20} color={COLORS.text} />
          </Pressable>
          {showLayers ? <View style={styles.layersTip}><Text style={styles.layersTipText}>Map style controls will be available with live maps.</Text></View> : null}

          <View style={styles.trafficPill}>
            <AlertTriangle size={12} color={COLORS.white} />
            <Text style={styles.trafficText}>Heavy traffic near the marina</Text>
          </View>
        </View>

        <View style={styles.sheet}>
          <View style={styles.handle} />
          {navigating ? (
            <View style={styles.navigationBanner}>
              <Navigation size={17} color={COLORS.white} />
              <View style={styles.navigationBannerCopy}>
                <Text style={styles.navigationTitle}>Navigation started</Text>
                <Text style={styles.navigationSubtitle}>Follow the route preview below</Text>
              </View>
              <Pressable onPress={() => setNavigating(false)}><Text style={styles.endText}>End</Text></Pressable>
            </View>
          ) : null}
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.eyebrow}>{navigating ? 'Current route' : 'Fastest route'}</Text>
              <Text style={styles.duration}>{trip.duration}</Text>
            </View>
            <Text style={styles.distance}>{trip.distance}  ·  {trip.arrival}</Text>
          </View>

          <View style={styles.modeRow}>
            {(['Drive', 'Ride', 'Walk'] as TravelMode[]).map((item) => {
              const active = item === mode;
              const Icon = item === 'Walk' ? Footprints : item === 'Ride' ? Bike : CarFront;
              return (
                <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => setMode(item)} style={[styles.modeButton, active && styles.modeButtonActive]}>
                  <Icon size={15} color={active ? COLORS.orange : COLORS.text} />
                  <Text style={[styles.modeText, active && styles.modeTextActive]}>{item}</Text>
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
              <Text numberOfLines={1} style={styles.placeText}>{pickup}</Text>
              <Text numberOfLines={1} style={styles.placeText}>{dropoff}</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Turn by turn</Text>
          <ScrollView style={styles.steps} contentContainerStyle={styles.stepsContent} showsVerticalScrollIndicator={false}>
            <View style={styles.stepRow}>
              <View style={styles.turnIcon}><CornerUpRight size={16} color={COLORS.text} /></View>
              <View style={styles.stepCopy}>
                <Text style={styles.stepTitle}>{mode === 'Walk' ? 'Head north on Street 840' : 'Head north on Street 840'}</Text>
                <Text style={styles.stepHint}>Keep right past the service road</Text>
              </View>
              <Text style={styles.stepDistance}>{mode === 'Walk' ? '120 m' : '450 m'}</Text>
            </View>
            <View style={styles.stepRow}>
              <View style={styles.turnIcon}><CornerUpRight size={16} color={COLORS.text} /></View>
              <View style={styles.stepCopy}>
                <Text style={styles.stepTitle}>Turn right onto Al Istiqal St</Text>
                <Text style={styles.stepHint}>Moderate traffic near the roundabout</Text>
              </View>
              <Text style={styles.stepDistance}>{mode === 'Walk' ? '650 m' : '1.8 km'}</Text>
            </View>
          </ScrollView>

          <Pressable accessibilityRole="button" onPress={startNavigation} style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}>
            <Navigation size={16} color={COLORS.white} />
            <Text style={styles.startText}>{navigating ? 'Resume navigation' : 'Start navigation'}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  screen: { flex: 1, backgroundColor: COLORS.white },
  mapArea: { flex: 1, minHeight: 250, backgroundColor: COLORS.water, overflow: 'hidden' },
  water: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.water },
  landTop: { position: 'absolute', top: 0, left: 0, right: 0, height: '34%', backgroundColor: '#E9E4D7', borderBottomLeftRadius: 100, borderBottomRightRadius: 70, transform: [{ rotate: '-3deg' }] },
  landLeft: { position: 'absolute', left: -30, top: 70, width: '44%', height: '55%', backgroundColor: COLORS.land, borderTopRightRadius: 120, borderBottomRightRadius: 60, transform: [{ rotate: '-12deg' }] },
  landRight: { position: 'absolute', right: -35, top: 40, width: '30%', height: '70%', backgroundColor: COLORS.land, borderTopLeftRadius: 80, borderBottomLeftRadius: 100, transform: [{ rotate: '10deg' }] },
  road: { position: 'absolute', height: 3, backgroundColor: COLORS.road, borderRadius: 2, opacity: 0.95 },
  roadOne: { top: '23%', left: -20, width: '95%', transform: [{ rotate: '17deg' }] },
  roadTwo: { top: '38%', left: -20, width: '105%', transform: [{ rotate: '-9deg' }] },
  roadThree: { top: '54%', left: -20, width: '100%', transform: [{ rotate: '-22deg' }] },
  roadFour: { top: '70%', left: -20, width: '80%', transform: [{ rotate: '5deg' }] },
  roadFive: { top: '44%', left: '20%', width: '75%', transform: [{ rotate: '74deg' }] },
  routeLine: { position: 'absolute', left: '7%', top: '50%', width: '66%', height: 3, backgroundColor: COLORS.orange, transform: [{ rotate: '-3deg' }], borderRadius: 2 },
  routeDash: { position: 'absolute', left: '48%', top: '31%', width: '27%', height: 3, backgroundColor: COLORS.orange, transform: [{ rotate: '-11deg' }], borderRadius: 2 },
  pickupMarker: { position: 'absolute', left: '5%', top: '45%', width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.orange, borderWidth: 2, borderColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  destinationMarker: { position: 'absolute', right: '21%', top: '24%', width: 27, height: 27, borderRadius: 14, backgroundColor: COLORS.text, borderWidth: 2, borderColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  mapBack: { position: 'absolute', top: 15, left: 13, width: 38, height: 38, borderRadius: 13, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  layersButton: { position: 'absolute', top: 15, right: 13, width: 38, height: 38, borderRadius: 13, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  layersTip: { position: 'absolute', top: 60, right: 13, maxWidth: 180, backgroundColor: COLORS.white, borderRadius: 10, padding: 10 },
  layersTipText: { color: COLORS.text, fontSize: 10, lineHeight: 14 },
  trafficPill: { position: 'absolute', left: 13, bottom: 17, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1D2A34', borderRadius: 15, paddingHorizontal: 11, paddingVertical: 8 },
  trafficText: { color: COLORS.white, fontSize: 10, fontWeight: '600' },
  sheet: { height: '59%', minHeight: 360, maxHeight: '72%', backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -19, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 14 },
  handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: '#E4E9ED', alignSelf: 'center', marginBottom: 11 },
  navigationBanner: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: COLORS.text, borderRadius: 12, padding: 10, marginBottom: 10 },
  navigationBannerCopy: { flex: 1 },
  navigationTitle: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  navigationSubtitle: { color: '#CBD4DC', fontSize: 9, marginTop: 2 },
  endText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  eyebrow: { color: '#A0ADBB', fontSize: 9, fontWeight: '600', marginBottom: 2 },
  duration: { color: COLORS.text, fontSize: 24, lineHeight: 29, fontWeight: '800' },
  distance: { color: COLORS.muted, fontSize: 9, marginBottom: 5 },
  modeRow: { flexDirection: 'row', gap: 6, marginBottom: 11 },
  modeButton: { flex: 1, height: 32, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 },
  modeButtonActive: { backgroundColor: COLORS.paleOrange, borderColor: COLORS.orange },
  modeText: { color: COLORS.text, fontSize: 10, fontWeight: '600' },
  modeTextActive: { color: COLORS.orange },
  placesCard: { minHeight: 54, flexDirection: 'row', backgroundColor: '#F2F4F6', borderRadius: 12, paddingHorizontal: 11, paddingVertical: 9, marginBottom: 12 },
  placeRail: { width: 15, alignItems: 'center', paddingTop: 4, paddingBottom: 3 },
  startDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.orange },
  placeLine: { flex: 1, width: 1, backgroundColor: '#C9D1D9', marginVertical: 2 },
  endDot: { width: 7, height: 7, borderRadius: 1, backgroundColor: COLORS.text },
  placeLabels: { flex: 1, justifyContent: 'space-between', gap: 8 },
  placeText: { color: COLORS.text, fontSize: 10, fontWeight: '600' },
  sectionLabel: { color: '#A0ADBB', fontSize: 9, fontWeight: '700', marginBottom: 7 },
  steps: { flex: 1, minHeight: 60 },
  stepsContent: { paddingBottom: 8 },
  stepRow: { minHeight: 48, flexDirection: 'row', alignItems: 'flex-start', gap: 9, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  turnIcon: { width: 23, height: 23, borderRadius: 12, backgroundColor: '#F2F4F6', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  stepCopy: { flex: 1, gap: 4 },
  stepTitle: { color: COLORS.text, fontSize: 10, fontWeight: '600' },
  stepHint: { color: COLORS.muted, fontSize: 9, lineHeight: 13 },
  stepDistance: { color: COLORS.muted, fontSize: 9, paddingTop: 3 },
  startButton: { minHeight: 40, borderRadius: 11, backgroundColor: COLORS.orange, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 9 },
  startText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  pressed: { opacity: 0.84 },
});
