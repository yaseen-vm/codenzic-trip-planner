import { ReactNode, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowUpDown,
  Building2,
  ChevronLeft,
  House,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  Plane,
  Ship,
  TrainFront,
  X,
} from 'lucide-react-native';
import MapPicker from '../components/MapPicker';
import { COLORS, FONTS, RADIUS } from '../constants/theme';
import { SAVED_PLACES, SavedPlace } from '../constants/savedPlaces';

const PLACES_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
const newSessionToken = () => String(Date.now()) + '-' + Math.random().toString(36).slice(2);
// Used to centre the map picker when nothing has been chosen yet.
const DEFAULT_CENTER = { latitude: 25.2866, longitude: 51.5265 };
type Place = { description: string; placeId: string };
type SelectedPlace = { label: string; latitude: number; longitude: number };
type ListRow = {
  key: string;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  onPress: () => void;
};

const SAVED_ICONS = {
  home: House,
  building: Building2,
  ferry: Ship,
  train: TrainFront,
  plane: Plane,
} as const;

export default function SetLocationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupPlace, setPickupPlace] = useState<SelectedPlace | null>(null);
  const [dropoffPlace, setDropoffPlace] = useState<SelectedPlace | null>(null);
  const [activeField, setActiveField] = useState<'pickup' | 'dropoff'>('pickup');
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionToken = useRef(newSessionToken());
  const autocompleteRequestId = useRef(0);

  useEffect(() => {
    const requestId = ++autocompleteRequestId.current;
    const query = activeField === 'pickup' ? pickup : dropoff;
    const selected = activeField === 'pickup' ? pickupPlace : dropoffPlace;
    if (timer.current) clearTimeout(timer.current);
    if (query.trim().length < 3 || selected?.label === query || !PLACES_KEY) {
      timer.current = setTimeout(() => {
        if (requestId === autocompleteRequestId.current) {
          setSuggestions([]);
          setLoading(false);
        }
      }, 0);
      return;
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': PLACES_KEY,
            'X-Goog-FieldMask':
              'suggestions.placePrediction.placeId,suggestions.placePrediction.text.text',
          },
          body: JSON.stringify({ input: query, sessionToken: sessionToken.current }),
        });
        if (!response.ok) throw new Error('Places autocomplete request failed');
        const data = await response.json();
        if (requestId !== autocompleteRequestId.current) return;
        setSuggestions(
          (data.suggestions ?? []).flatMap((item: any) => {
            const prediction = item.placePrediction;
            return prediction
              ? [{ placeId: prediction.placeId, description: prediction.text.text }]
              : [];
          }),
        );
      } catch {
        if (requestId === autocompleteRequestId.current) setSuggestions([]);
      } finally {
        if (requestId === autocompleteRequestId.current) setLoading(false);
      }
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [pickup, dropoff, activeField, pickupPlace, dropoffPlace]);

  const applyChosen = (chosen: SelectedPlace) => {
    if (activeField === 'pickup') {
      setPickup(chosen.label);
      setPickupPlace(chosen);
      setActiveField('dropoff');
    } else {
      setDropoff(chosen.label);
      setDropoffPlace(chosen);
    }
    setSuggestions([]);
    sessionToken.current = newSessionToken();
  };

  // Turns coordinates into a readable address, falling back to the raw coordinates.
  const labelForCoordinate = async (latitude: number, longitude: number) => {
    try {
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const parts = [address?.name, address?.street, address?.city].filter(
        (part, index, all): part is string => Boolean(part) && all.indexOf(part) === index,
      );
      if (parts.length) return parts.join(', ');
    } catch {
      // Geocoding is best effort; fall through to coordinates.
    }
    return latitude.toFixed(5) + ', ' + longitude.toFixed(5);
  };

  const useCurrentLocation = async () => {
    Keyboard.dismiss();
    setNotice('');
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setNotice('Location permission was denied. Allow it in Settings or search for an address.');
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      applyChosen({
        label: await labelForCoordinate(coords.latitude, coords.longitude),
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch {
      setNotice('Could not get your location. Check that location services are on.');
    } finally {
      setLocating(false);
    }
  };

  const confirmMapPick = async (coordinate: { latitude: number; longitude: number }) => {
    setMapOpen(false);
    setNotice('');
    setLoading(true);
    try {
      applyChosen({
        label: await labelForCoordinate(coordinate.latitude, coordinate.longitude),
        ...coordinate,
      });
    } finally {
      setLoading(false);
    }
  };

  const selectSavedPlace = (place: SavedPlace) => {
    Keyboard.dismiss();
    applyChosen({
      label: place.name + ' · ' + place.short,
      latitude: place.latitude,
      longitude: place.longitude,
    });
  };

  const selectPlace = async (place: Place) => {
    if (!PLACES_KEY) return;
    Keyboard.dismiss();
    setLoading(true);
    try {
      const response = await fetch(
        'https://places.googleapis.com/v1/places/' +
          place.placeId +
          '?fields=formattedAddress,location,displayName',
        {
          headers: {
            'X-Goog-Api-Key': PLACES_KEY,
            'X-Goog-FieldMask': 'formattedAddress,location,displayName',
          },
        },
      );
      const data = await response.json();
      if (!data.location) throw new Error('Coordinates were not returned');
      applyChosen({
        label: data.formattedAddress ?? data.displayName?.text ?? place.description,
        latitude: data.location.latitude,
        longitude: data.location.longitude,
      });
    } catch {
      Alert.alert(
        'Could not select place',
        'Check that Places API (New) is enabled and your key has permission.',
      );
    } finally {
      setLoading(false);
    }
  };

  const swapLocations = () => {
    setPickup(dropoff);
    setDropoff(pickup);
    setPickupPlace(dropoffPlace);
    setDropoffPlace(pickupPlace);
  };
  const clearField = (field: 'pickup' | 'dropoff') => {
    if (field === 'pickup') {
      setPickup('');
      setPickupPlace(null);
    } else {
      setDropoff('');
      setDropoffPlace(null);
    }
    setActiveField(field);
  };
  const continueToNextStep = () => {
    if (!pickupPlace || !dropoffPlace) {
      Alert.alert(
        'Choose locations from suggestions',
        'Select both pickup and drop-off from the saved places or Google Places results so the route can use real coordinates.',
      );
      return;
    }
    if (
      pickupPlace.latitude === dropoffPlace.latitude &&
      pickupPlace.longitude === dropoffPlace.longitude
    ) {
      Alert.alert('Choose different locations', 'Pickup and drop-off must be different.');
      return;
    }
    router.push({
      pathname: '/route',
      params: {
        pickup: pickupPlace.label,
        dropoff: dropoffPlace.label,
        pickupLat: String(pickupPlace.latitude),
        pickupLng: String(pickupPlace.longitude),
        dropoffLat: String(dropoffPlace.latitude),
        dropoffLng: String(dropoffPlace.longitude),
      },
    });
  };

  const activeText = activeField === 'pickup' ? pickup : dropoff;
  const activePlace = activeField === 'pickup' ? pickupPlace : dropoffPlace;
  const query = activePlace ? '' : activeText.trim().toLowerCase();
  const matchingSaved = SAVED_PLACES.filter(
    (place) =>
      !query ||
      place.name.toLowerCase().includes(query) ||
      place.address.toLowerCase().includes(query),
  );
  const ready = Boolean(pickupPlace && dropoffPlace);

  const renderField = (field: 'pickup' | 'dropoff') => {
    const isPickup = field === 'pickup';
    const value = isPickup ? pickup : dropoff;
    const active = activeField === field;
    return (
      <View style={styles.routeField}>
        <Text style={[styles.fieldLabel, active && styles.fieldLabelActive]}>
          {isPickup ? 'Pickup' : 'Drop-off'}
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            accessibilityLabel={isPickup ? 'Pickup location' : 'Drop-off location'}
            value={value}
            onChangeText={(v) => {
              if (isPickup) {
                setPickup(v);
                setPickupPlace(null);
              } else {
                setDropoff(v);
                setDropoffPlace(null);
              }
              setActiveField(field);
            }}
            onFocus={() => setActiveField(field)}
            placeholder={isPickup ? 'Choose a starting point' : 'Choose a destination'}
            placeholderTextColor={COLORS.placeholder}
            returnKeyType={isPickup ? 'next' : 'search'}
            style={styles.locationInput}
          />
          {value ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isPickup ? 'Clear pickup' : 'Clear drop-off'}
              onPress={() => clearField(field)}
              style={styles.clearButton}
            >
              <X size={14} color={COLORS.muted} />
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  };

  const rows: ListRow[] = suggestions.length
    ? suggestions.map((item) => {
        const [first, ...rest] = item.description.split(', ');
        const title = first ?? item.description;
        return {
          key: item.placeId,
          title,
          subtitle: rest.join(', ') || undefined,
          icon: <MapPin size={18} color={COLORS.text} />,
          onPress: () => selectPlace(item),
        };
      })
    : matchingSaved.map((place) => {
        const Icon = SAVED_ICONS[place.icon];
        return {
          key: place.id,
          title: place.name,
          subtitle: place.address,
          icon: <Icon size={18} color={COLORS.text} />,
          onPress: () => selectSavedPlace(place),
        };
      });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={COLORS.text} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.heading}>Where are you going?</Text>
            <Text style={styles.subtitle}>Step 1 of 2 · Set pickup and drop-off</Text>
          </View>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.routeCard}>
            <View style={styles.routeRail}>
              <View style={styles.pickupDot} />
              <View style={styles.routeLine} />
              <View style={styles.dropoffDot} />
            </View>
            <View style={styles.routeFields}>
              {renderField('pickup')}
              <View style={styles.routeDivider} />
              {renderField('dropoff')}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Swap pickup and drop-off"
              onPress={swapLocations}
              style={styles.swapButton}
            >
              <ArrowUpDown size={18} color={COLORS.text} />
            </Pressable>
          </View>

          {!PLACES_KEY ? (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>
                Add EXPO_PUBLIC_GOOGLE_PLACES_API_KEY to your local .env to enable live Google
                Places suggestions.
              </Text>
            </View>
          ) : null}

          {notice ? (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          ) : null}

          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              disabled={locating}
              onPress={useCurrentLocation}
              style={styles.actionButton}
            >
              {locating ? (
                <ActivityIndicator size="small" color={COLORS.orange} />
              ) : (
                <LocateFixed size={18} color={COLORS.text} />
              )}
              <Text style={styles.actionText}>{locating ? 'Locating…' : 'Use current'}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                Keyboard.dismiss();
                setMapOpen(true);
              }}
              style={styles.actionButton}
            >
              <MapIcon size={18} color={COLORS.text} />
              <Text style={styles.actionText}>Pick on map</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>
            {activeField === 'pickup' ? 'Set as pickup' : 'Set as drop-off'}
          </Text>
          {loading ? <ActivityIndicator style={styles.loader} color={COLORS.orange} /> : null}
          {rows.length ? (
            <View style={styles.list}>
              {rows.map((row, index) => (
                <Pressable
                  key={row.key}
                  accessibilityRole="button"
                  onPress={row.onPress}
                  style={[styles.row, index > 0 && styles.rowDivider]}
                >
                  <View style={styles.rowIcon}>{row.icon}</View>
                  <View style={styles.rowText}>
                    <Text numberOfLines={1} style={styles.rowTitle}>
                      {row.title}
                    </Text>
                    {row.subtitle ? (
                      <Text numberOfLines={1} style={styles.rowSubtitle}>
                        {row.subtitle}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              ))}
            </View>
          ) : !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {PLACES_KEY
                  ? 'No saved places match that. Keep typing and pick a suggestion to set the address.'
                  : 'No saved places match that. Google Places search is not configured.'}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
          <Pressable
            accessibilityRole="button"
            onPress={continueToNextStep}
            style={[styles.nextButton, !ready && styles.nextButtonDisabled]}
          >
            <Text style={[styles.nextText, !ready && styles.nextTextDisabled]}>Next</Text>
          </Pressable>
        </View>
      </View>

      <MapPicker
        visible={mapOpen}
        title={activeField === 'pickup' ? 'Set pickup on map' : 'Set drop-off on map'}
        initialCenter={
          activePlace ?? (activeField === 'dropoff' ? pickupPlace : null) ?? DEFAULT_CENTER
        }
        onCancel={() => setMapOpen(false)}
        onConfirm={confirmMapPick}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  screen: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  header: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 21,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  heading: {
    color: COLORS.text,
    fontFamily: FONTS.extraBold,
    fontSize: 26,
    lineHeight: 32.5,
    letterSpacing: -0.65,
  },
  subtitle: {
    color: COLORS.muted,
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22.5,
    marginTop: 4,
  },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },
  routeCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
  },
  routeRail: { width: 10, alignItems: 'center', paddingTop: 22 },
  pickupDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.orange },
  routeLine: { flex: 1, width: 2, backgroundColor: COLORS.border, marginVertical: 4 },
  dropoffDot: { width: 10, height: 10, borderRadius: 2, backgroundColor: COLORS.text },
  routeFields: { flex: 1, minWidth: 0, marginLeft: 12, marginRight: 52 },
  routeField: { height: 72, paddingTop: 11 },
  fieldLabel: {
    color: COLORS.faint,
    fontFamily: FONTS.extraBold,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.96,
    marginBottom: 1,
  },
  fieldLabelActive: { color: COLORS.orange },
  inputRow: { height: 36, flexDirection: 'row', alignItems: 'center' },
  locationInput: {
    flex: 1,
    height: 36,
    padding: 0,
    margin: 0,
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  clearButton: {
    width: 28,
    height: 28,
    marginLeft: 8,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  swapButton: {
    position: 'absolute',
    right: 17,
    top: 38,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notice: { backgroundColor: '#FFF5E9', borderRadius: 12, padding: 12, marginTop: 12 },
  noticeText: { color: '#8B4B17', fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  actionButton: {
    flex: 1,
    height: 51,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.control,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionText: { color: COLORS.text, fontFamily: FONTS.bold, fontSize: 14 },
  sectionLabel: {
    color: COLORS.faint,
    fontFamily: FONTS.extraBold,
    fontSize: 13,
    lineHeight: 19.5,
    letterSpacing: 1.04,
    marginTop: 28,
    marginBottom: 12,
  },
  loader: { marginVertical: 12 },
  list: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  row: { minHeight: 72, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  rowDivider: { borderTopWidth: 1, borderTopColor: COLORS.border },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowText: { flex: 1, minWidth: 0 },
  rowTitle: { color: COLORS.text, fontFamily: FONTS.bold, fontSize: 15, lineHeight: 22.5 },
  rowSubtitle: {
    color: COLORS.muted,
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19.5,
    marginTop: 2,
  },
  emptyState: {
    minHeight: 90,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 20,
  },
  emptyText: {
    color: COLORS.muted,
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  nextButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.orange,
    borderRadius: RADIUS.control,
  },
  nextButtonDisabled: { backgroundColor: COLORS.border },
  nextText: { color: COLORS.white, fontFamily: FONTS.extraBold, fontSize: 17 },
  nextTextDisabled: { color: COLORS.faint },
});
