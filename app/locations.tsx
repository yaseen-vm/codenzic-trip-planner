import { useState } from 'react';
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
  ArrowLeftRight,
  Clock3,
  House,
  LocateFixed,
  Map,
  MapPin,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const COLORS = {
  background: '#F2F4F6',
  white: '#FFFFFF',
  text: '#172533',
  muted: '#8090A2',
  border: '#E5EAF0',
  orange: '#F1521F',
  iconBg: '#F1F4F7',
  disabled: '#E5EAEE',
};

const SAVED_PLACES = [
  { id: 'home', title: 'Home', address: 'Villa 12, Street 840, Zone 61 · West Bay', type: 'home' },
  { id: 'office', title: 'Marina Office Tower', address: 'Level 14, Al Fardan Rd · Lusail Marina', type: 'home' },
  { id: 'corniche', title: 'Corniche Ferry Terminal', address: 'Gate 3, Corniche Promenade', type: 'recent' },
  { id: 'metro', title: 'Msheireb Metro Station', address: 'Al Kinana St · Msheireb Downtown', type: 'recent' },
  { id: 'airport', title: 'Hamad International Airport', address: 'Hamad International Airport · Doha', type: 'recent' },
];

export default function SetLocationsScreen() {
  const router = useRouter();
  const [pickup, setPickup] = useState<string | null>(null);
  const [dropoff, setDropoff] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<'pickup' | 'dropoff'>('pickup');

  const selectPlace = (id: string) => {
    if (activeField === 'pickup') {
      setPickup(id);
      setActiveField('dropoff');
    } else {
      setDropoff(id);
    }
  };

  const placeName = (id: string | null) => {
    if (!id) return null;
    return SAVED_PLACES.find((place) => place.id === id)?.title ?? id;
  };

  const swapLocations = () => {
    setPickup(dropoff);
    setDropoff(pickup);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={10} onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={22} color={COLORS.text} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.heading}>Where are you going?</Text>
            <Text style={styles.subtitle}>Step 1 of 2 · Set pickup and drop-off</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.routeCard}>
            <View style={styles.routeRail}>
              <View style={styles.pickupDot} />
              <View style={styles.routeLine} />
              <View style={styles.dropoffDot} />
            </View>
            <View style={styles.routeFields}>
              <Pressable onPress={() => setActiveField('pickup')} style={styles.routeField}>
                <Text style={[styles.fieldLabel, styles.pickupLabel]}>Pickup</Text>
                <Text numberOfLines={1} style={[styles.fieldValue, !pickup && styles.placeholder]}>
                  {placeName(pickup) ?? 'Choose a starting point'}
                </Text>
              </Pressable>
              <View style={styles.routeDivider} />
              <Pressable onPress={() => setActiveField('dropoff')} style={styles.routeField}>
                <Text style={styles.fieldLabel}>Drop-off</Text>
                <Text numberOfLines={1} style={[styles.fieldValue, !dropoff && styles.placeholder]}>
                  {placeName(dropoff) ?? 'Choose a destination'}
                </Text>
              </Pressable>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Swap pickup and drop-off" onPress={swapLocations} style={styles.swapButton}>
              <ArrowLeftRight size={19} color={COLORS.text} />
            </Pressable>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                const current = 'Current location';
                if (activeField === 'pickup') {
                  setPickup(current);
                  setActiveField('dropoff');
                } else {
                  setDropoff(current);
                }
              }}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <LocateFixed size={17} color={COLORS.text} />
              <Text style={styles.actionText}>Use current</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => Alert.alert('Pick on map', 'Map selection will be available when map integration is added.')}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <Map size={17} color={COLORS.text} />
              <Text style={styles.actionText}>Pick on map</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>Set as {activeField}</Text>
          <View style={styles.savedPlaces}>
            {SAVED_PLACES.map((place) => {
              const selected = (activeField === 'pickup' ? pickup : dropoff) === place.id;
              const PlaceIcon = place.type === 'home' ? House : Clock3;
              return (
                <Pressable
                  key={place.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => selectPlace(place.id)}
                  style={({ pressed }) => [styles.placeRow, selected && styles.placeSelected, pressed && styles.pressed]}
                >
                  <View style={styles.placeIcon}>
                    <PlaceIcon size={17} color={COLORS.text} />
                  </View>
                  <View style={styles.placeCopy}>
                    <Text style={styles.placeTitle}>{place.title}</Text>
                    <Text numberOfLines={1} style={styles.placeAddress}>{place.address}</Text>
                  </View>
                  {selected ? <MapPin size={17} color={COLORS.orange} /> : null}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            disabled={!pickup || !dropoff || pickup === dropoff}
            onPress={() => Alert.alert('Locations set', `Pickup: ${placeName(pickup)}\nDrop-off: ${placeName(dropoff)}\n\nThe next trip-planning step will be connected here.`)}
            style={({ pressed }) => [
              styles.nextButton,
              (!pickup || !dropoff || pickup === dropoff) && styles.nextButtonDisabled,
              pressed && pickup && dropoff && pickup !== dropoff ? styles.pressed : null,
            ]}
          >
            <Text style={[styles.nextText, (!pickup || !dropoff || pickup === dropoff) && styles.nextTextDisabled]}>Next</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  screen: { flex: 1, backgroundColor: COLORS.background },
  header: {
    minHeight: 83,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 9,
    paddingBottom: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { width: 22, height: 30, justifyContent: 'center', marginRight: 10 },
  headerCopy: { flex: 1 },
  heading: { color: COLORS.text, fontSize: 21, lineHeight: 27, fontWeight: '800', letterSpacing: -0.45 },
  subtitle: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginTop: 3 },
  content: { paddingHorizontal: 20, paddingTop: 17, paddingBottom: 22 },
  routeCard: {
    minHeight: 152,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 15,
    paddingLeft: 13,
    paddingRight: 54,
  },
  routeRail: { width: 17, alignItems: 'center', paddingTop: 16, paddingBottom: 3 },
  pickupDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.orange },
  routeLine: { flex: 1, width: 1, backgroundColor: '#DDE4EA', marginVertical: 5 },
  dropoffDot: { width: 8, height: 8, borderRadius: 2, backgroundColor: COLORS.text },
  routeFields: { flex: 1, minWidth: 0 },
  routeField: { minHeight: 59, justifyContent: 'center' },
  fieldLabel: { color: '#A6B2BF', fontSize: 10, fontWeight: '700', marginBottom: 4 },
  pickupLabel: { color: COLORS.orange },
  fieldValue: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  placeholder: { color: '#8D9AAD', fontWeight: '500' },
  routeDivider: { height: 1, backgroundColor: COLORS.border, marginRight: 1 },
  swapButton: {
    position: 'absolute',
    right: 13,
    top: 31,
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: COLORS.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 13 },
  actionButton: {
    flex: 1,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionText: { color: COLORS.text, fontSize: 11, fontWeight: '700' },
  sectionLabel: { color: '#A0ADBB', fontSize: 11, fontWeight: '600', marginTop: 25, marginBottom: 11 },
  savedPlaces: {
    backgroundColor: COLORS.white,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  placeRow: {
    minHeight: 59,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 11,
  },
  placeSelected: { backgroundColor: '#FFF8F5' },
  placeIcon: {
    width: 33,
    height: 33,
    borderRadius: 17,
    backgroundColor: COLORS.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeCopy: { flex: 1, minWidth: 0, gap: 4 },
  placeTitle: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  placeAddress: { color: COLORS.muted, fontSize: 10, lineHeight: 14 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 13,
    paddingBottom: 18,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  nextButton: { height: 46, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.orange, borderRadius: 13 },
  nextButtonDisabled: { backgroundColor: COLORS.disabled },
  nextText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  nextTextDisabled: { color: '#AAB6C2' },
  pressed: { opacity: 0.82 },
});
