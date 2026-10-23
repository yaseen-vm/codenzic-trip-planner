import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, LocateFixed, Map as MapIcon } from 'lucide-react-native';
import MapPicker from '../../components/map/MapPicker';
import NoticeBanner from '../../components/NoticeBanner';
import PrimaryButton from '../../components/PrimaryButton';
import SectionLabel from '../../components/SectionLabel';
import { DEFAULT_MAP_CENTER, PLACES_API_KEY } from '../../constants/config';
import { SAVED_PLACES, type SavedPlace } from '../../constants/savedPlaces';
import { LOCATION_STRINGS } from '../../constants/strings';
import { COLORS, FONTS, RADIUS, SIZES, SPACING } from '../../constants/theme';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { usePlaceSuggestions } from '../../hooks/usePlaceSuggestions';
import { describeCoordinate } from '../../services/geocoding';
import { fetchPlaceDetails } from '../../services/placesApi';
import type { Coordinate } from '../../types/geo';
import type { PlaceSuggestion, SelectedPlace } from '../../types/places';
import { buildRows, filterSavedPlaces, type ListRow } from './locationRows';
import SuggestionList from './SuggestionList';
import TripFields from './TripFields';
import { initialTripForm, tripFormReducer, validateTrip, type FieldKey } from './tripForm';

const ROUTE_PATHNAME = '/route';

const toRouteParams = (pickup: SelectedPlace, dropoff: SelectedPlace) => ({
  pickup: pickup.label,
  dropoff: dropoff.label,
  pickupLat: String(pickup.latitude),
  pickupLng: String(pickup.longitude),
  dropoffLat: String(dropoff.latitude),
  dropoffLng: String(dropoff.longitude),
});

const savedPlaceToSelection = (place: SavedPlace): SelectedPlace => ({
  label: `${place.name} · ${place.short}`,
  latitude: place.latitude,
  longitude: place.longitude,
});

export default function LocationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [form, dispatch] = useReducer(tripFormReducer, initialTripForm);
  const [resolving, setResolving] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const current = useCurrentLocation();
  const detailsRequest = useRef<AbortController | null>(null);

  const activeField = form.active;
  const activeText = form[activeField].text;
  const activePlace = form[activeField].place;
  const search = usePlaceSuggestions({ query: activeText, enabled: !activePlace });
  const { endSession, sessionToken } = search;

  useEffect(() => () => detailsRequest.current?.abort(), []);

  const savedMatches = useMemo(
    () => filterSavedPlaces(SAVED_PLACES, activePlace ? '' : activeText.trim().toLowerCase()),
    [activePlace, activeText],
  );
  const rows = useMemo(
    () => buildRows(search.suggestions, savedMatches),
    [search.suggestions, savedMatches],
  );
  const loading = search.loading || resolving;
  const ready = Boolean(form.pickup.place && form.dropoff.place);

  const choosePlace = (place: SelectedPlace) => {
    dispatch({ type: 'choose', place });
    endSession();
  };

  const selectSuggestion = async (suggestion: PlaceSuggestion) => {
    if (!PLACES_API_KEY) return;
    Keyboard.dismiss();
    detailsRequest.current?.abort();
    const controller = new AbortController();
    detailsRequest.current = controller;
    setResolving(true);
    try {
      const place = await fetchPlaceDetails({
        place: suggestion,
        apiKey: PLACES_API_KEY,
        sessionToken: sessionToken(),
        signal: controller.signal,
      });
      if (!controller.signal.aborted) choosePlace(place);
    } catch {
      if (!controller.signal.aborted) {
        Alert.alert(
          LOCATION_STRINGS.placeDetailsFailedTitle,
          LOCATION_STRINGS.placeDetailsFailedMessage,
        );
      }
    } finally {
      if (!controller.signal.aborted) setResolving(false);
    }
  };

  const selectRow = (row: ListRow) => {
    if (row.item.kind === 'suggestion') {
      void selectSuggestion(row.item.suggestion);
    } else {
      Keyboard.dismiss();
      choosePlace(savedPlaceToSelection(row.item.place));
    }
  };

  const useCurrentLocationForField = async () => {
    Keyboard.dismiss();
    const place = await current.locate();
    if (place) choosePlace(place);
  };

  const openMap = () => {
    Keyboard.dismiss();
    setMapOpen(true);
  };

  const confirmMapPick = async (coordinate: Coordinate) => {
    setMapOpen(false);
    current.clearNotice();
    setResolving(true);
    try {
      choosePlace({
        label: await describeCoordinate(coordinate.latitude, coordinate.longitude),
        ...coordinate,
      });
    } finally {
      setResolving(false);
    }
  };

  const continueToNextStep = () => {
    const validation = validateTrip(form);
    if (validation === 'incomplete') {
      Alert.alert(LOCATION_STRINGS.incompleteTitle, LOCATION_STRINGS.incompleteMessage);
    } else if (validation === 'same-location') {
      Alert.alert(LOCATION_STRINGS.sameLocationTitle, LOCATION_STRINGS.sameLocationMessage);
    } else if (form.pickup.place && form.dropoff.place) {
      router.push({
        pathname: ROUTE_PATHNAME,
        params: toRouteParams(form.pickup.place, form.dropoff.place),
      });
    }
  };

  const focusField = (field: FieldKey) => dispatch({ type: 'focus', field });
  const isPickupActive = activeField === 'pickup';
  const mapCenter =
    activePlace ?? (isPickupActive ? null : form.pickup.place) ?? DEFAULT_MAP_CENTER;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={LOCATION_STRINGS.back}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={SIZES.iconLg} color={COLORS.text} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.heading}>{LOCATION_STRINGS.heading}</Text>
            <Text style={styles.subtitle}>{LOCATION_STRINGS.subtitle}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TripFields
            form={form}
            onChangeText={(field, text) => dispatch({ type: 'type', field, text })}
            onFocus={focusField}
            onClear={(field) => dispatch({ type: 'clear', field })}
            onSwap={() => dispatch({ type: 'swap' })}
          />

          <View style={styles.notices}>
            {!PLACES_API_KEY ? <NoticeBanner text={LOCATION_STRINGS.missingPlacesKey} /> : null}
            {search.failed ? (
              <NoticeBanner text={LOCATION_STRINGS.suggestionsFailed} alert />
            ) : null}
            {current.notice ? <NoticeBanner text={current.notice} /> : null}
          </View>

          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              disabled={current.locating}
              onPress={useCurrentLocationForField}
              style={styles.actionButton}
            >
              {current.locating ? (
                <ActivityIndicator size="small" color={COLORS.orange} />
              ) : (
                <LocateFixed size={SIZES.iconMd} color={COLORS.text} />
              )}
              <Text style={styles.actionText}>
                {current.locating ? LOCATION_STRINGS.locating : LOCATION_STRINGS.useCurrent}
              </Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={openMap} style={styles.actionButton}>
              <MapIcon size={SIZES.iconMd} color={COLORS.text} />
              <Text style={styles.actionText}>{LOCATION_STRINGS.pickOnMap}</Text>
            </Pressable>
          </View>

          <SectionLabel style={styles.sectionLabel}>
            {isPickupActive ? LOCATION_STRINGS.setAsPickup : LOCATION_STRINGS.setAsDropoff}
          </SectionLabel>
          {loading ? (
            <ActivityIndicator
              accessibilityLabel={LOCATION_STRINGS.loadingSuggestions}
              style={styles.loader}
              color={COLORS.orange}
            />
          ) : null}
          {rows.length ? (
            <SuggestionList rows={rows} onSelect={selectRow} />
          ) : !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {PLACES_API_KEY
                  ? LOCATION_STRINGS.emptyWithSearch
                  : LOCATION_STRINGS.emptyWithoutSearch}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: SPACING.lg + insets.bottom }]}>
          <PrimaryButton
            label={LOCATION_STRINGS.next}
            onPress={continueToNextStep}
            dimmed={!ready}
          />
        </View>
      </View>

      <MapPicker
        visible={mapOpen}
        title={isPickupActive ? LOCATION_STRINGS.mapTitlePickup : LOCATION_STRINGS.mapTitleDropoff}
        initialCenter={mapCenter}
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
    paddingHorizontal: SPACING.md,
    paddingTop: 10,
    paddingBottom: 21,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.notice,
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
    marginTop: SPACING.xs,
  },
  content: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl, paddingBottom: SPACING.xxl },
  notices: { gap: SPACING.md, marginTop: SPACING.md },
  actionRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg },
  actionButton: {
    flex: 1,
    height: 51,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.control,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionText: { color: COLORS.text, fontFamily: FONTS.bold, fontSize: 14 },
  sectionLabel: { marginTop: 28, marginBottom: SPACING.md },
  loader: { marginVertical: SPACING.md },
  emptyState: {
    minHeight: 90,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    color: COLORS.muted,
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
