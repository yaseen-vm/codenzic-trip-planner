import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Alert,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ArrowLeftRight,
  LocateFixed,
  Map,
  X,
} from 'lucide-react-native';

const COLORS = {
  background: '#F2F4F6',
  white: '#FFFFFF',
  text: '#172533',
  muted: '#8090A2',
  border: '#E5EAF0',
  orange: '#F1521F',
  iconBg: '#F1F4F7',
};

export default function SetLocationsScreen() {
  const router = useRouter();
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [activeField, setActiveField] = useState<'pickup' | 'dropoff'>('pickup');

  const setCurrentLocation = () => {
    if (activeField === 'pickup') {
      setPickup('Current location');
      setActiveField('dropoff');
    } else {
      setDropoff('Current location');
    }
  };

  const swapLocations = () => {
    setPickup(dropoff);
    setDropoff(pickup);
  };

  const continueToNextStep = () => {
    if (!pickup.trim() || !dropoff.trim()) {
      Alert.alert('Add both locations', 'Enter a pickup and a drop-off to continue.');
      return;
    }
    if (pickup.trim().toLowerCase() === dropoff.trim().toLowerCase()) {
      Alert.alert('Choose different locations', 'Pickup and drop-off must be different.');
      return;
    }
    Alert.alert('Locations set', `Pickup: ${pickup.trim()}\nDrop-off: ${dropoff.trim()}\n\nThe next trip-planning step will be connected here.`);
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

        <View style={styles.content}>
          <View style={styles.routeCard}>
            <View style={styles.routeRail}>
              <View style={styles.pickupDot} />
              <View style={styles.routeLine} />
              <View style={styles.dropoffDot} />
            </View>

            <View style={styles.routeFields}>
              <Pressable onPress={() => setActiveField('pickup')} style={styles.routeField}>
                <Text style={[styles.fieldLabel, activeField === 'pickup' && styles.pickupLabel]}>Pickup</Text>
                <TextInput
                  accessibilityLabel="Pickup location"
                  value={pickup}
                  onChangeText={setPickup}
                  onFocus={() => setActiveField('pickup')}
                  placeholder="Choose a starting point"
                  placeholderTextColor="#8D9AAD"
                  returnKeyType="next"
                  onSubmitEditing={() => setActiveField('dropoff')}
                  style={styles.locationInput}
                />
              </Pressable>
              <View style={styles.routeDivider} />
              <Pressable onPress={() => setActiveField('dropoff')} style={styles.routeField}>
                <Text style={[styles.fieldLabel, activeField === 'dropoff' && styles.dropoffLabel]}>Drop-off</Text>
                <TextInput
                  accessibilityLabel="Drop-off location"
                  value={dropoff}
                  onChangeText={setDropoff}
                  onFocus={() => setActiveField('dropoff')}
                  placeholder="Choose a destination"
                  placeholderTextColor="#8D9AAD"
                  returnKeyType="done"
                  style={styles.locationInput}
                />
              </Pressable>
            </View>

            <View style={styles.routeControls}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear active location"
                onPress={() => activeField === 'pickup' ? setPickup('') : setDropoff('')}
                style={styles.clearButton}
              >
                <X size={14} color={COLORS.muted} />
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Swap pickup and drop-off" onPress={swapLocations} style={styles.swapButton}>
                <ArrowLeftRight size={18} color={COLORS.text} />
              </Pressable>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear other location"
              onPress={() => activeField === 'pickup' ? setDropoff('') : setPickup('')}
              style={styles.secondClearButton}
            >
              <X size={14} color={COLORS.muted} />
            </Pressable>
          </View>

          <View style={styles.actionRow}>
            <Pressable accessibilityRole="button" onPress={setCurrentLocation} style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
              <LocateFixed size={16} color={COLORS.text} />
              <Text style={styles.actionText}>Use current</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => Alert.alert('Pick on map', 'Map selection will be available when map integration is added.')}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <Map size={16} color={COLORS.text} />
              <Text style={styles.actionText}>Pick on map</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>Set as {activeField === 'pickup' ? 'pickup' : 'drop-off'}</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No saved places match that. Keep typing to use it as a custom address.</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable accessibilityRole="button" onPress={continueToNextStep} style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}>
            <Text style={styles.nextText}>Next</Text>
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
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 19,
    paddingTop: 9,
    paddingBottom: 13,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { width: 22, height: 30, justifyContent: 'center', marginRight: 10 },
  headerCopy: { flex: 1 },
  heading: { color: COLORS.text, fontSize: 20, lineHeight: 27, fontWeight: '800', letterSpacing: -0.4 },
  subtitle: { color: COLORS.muted, fontSize: 11, lineHeight: 17, marginTop: 2 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 14 },
  routeCard: {
    minHeight: 124,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 9,
    paddingLeft: 10,
    paddingRight: 48,
  },
  routeRail: { width: 15, alignItems: 'center', paddingTop: 16, paddingBottom: 15 },
  pickupDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.orange },
  routeLine: { flex: 1, width: 1, backgroundColor: '#DDE4EA', marginVertical: 4 },
  dropoffDot: { width: 7, height: 7, borderRadius: 2, backgroundColor: COLORS.text },
  routeFields: { flex: 1, minWidth: 0 },
  routeField: { minHeight: 51, justifyContent: 'center' },
  fieldLabel: { color: '#A6B2BF', fontSize: 9, fontWeight: '600', marginBottom: 1 },
  pickupLabel: { color: COLORS.orange },
  dropoffLabel: { color: COLORS.orange },
  locationInput: { height: 21, padding: 0, margin: 0, color: COLORS.text, fontSize: 11, fontWeight: '500' },
  routeDivider: { height: 1, backgroundColor: COLORS.border, marginRight: 1 },
  routeControls: { position: 'absolute', right: 10, top: 33, flexDirection: 'row', alignItems: 'center', gap: 7 },
  clearButton: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.iconBg, alignItems: 'center', justifyContent: 'center' },
  swapButton: { width: 28, height: 30, borderRadius: 9, backgroundColor: COLORS.iconBg, alignItems: 'center', justifyContent: 'center' },
  secondClearButton: { position: 'absolute', right: 40, bottom: 18, width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.iconBg, alignItems: 'center', justifyContent: 'center' },
  actionRow: { flexDirection: 'row', gap: 9, marginTop: 11 },
  actionButton: {
    flex: 1,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionText: { color: COLORS.text, fontSize: 10, fontWeight: '700' },
  sectionLabel: { color: '#A0ADBB', fontSize: 9, fontWeight: '600', marginTop: 20, marginBottom: 9 },
  emptyState: { minHeight: 60, backgroundColor: COLORS.white, borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 13, paddingVertical: 12 },
  emptyText: { color: COLORS.muted, fontSize: 9, lineHeight: 14, textAlign: 'center' },
  footer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 18, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  nextButton: { height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.orange, borderRadius: 11 },
  nextText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  pressed: { opacity: 0.82 },
});
