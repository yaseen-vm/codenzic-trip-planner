import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, FlatList, Keyboard, Pressable, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowLeftRight, LocateFixed, MapPin, X } from 'lucide-react-native';

const COLORS = { background: '#F2F4F6', white: '#FFFFFF', text: '#172533', muted: '#8090A2', border: '#E5EAF0', orange: '#F1521F' };
const PLACES_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
type Place = { description: string; placeId: string };
type SelectedPlace = { label: string; latitude: number; longitude: number };

export default function SetLocationsScreen() {
  const router = useRouter();
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupPlace, setPickupPlace] = useState<SelectedPlace | null>(null);
  const [dropoffPlace, setDropoffPlace] = useState<SelectedPlace | null>(null);
  const [activeField, setActiveField] = useState<'pickup' | 'dropoff'>('pickup');
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionToken = useRef(String(Date.now()) + '-' + Math.random().toString(36).slice(2));

  useEffect(() => {
    const query = activeField === 'pickup' ? pickup : dropoff;
    const selected = activeField === 'pickup' ? pickupPlace : dropoffPlace;
    if (timer.current) clearTimeout(timer.current);
    if (query.trim().length < 3 || selected?.label === query || !PLACES_KEY) { setSuggestions([]); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': PLACES_KEY, 'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text.text' },
          body: JSON.stringify({ input: query, sessionToken: sessionToken.current }),
        });
        const data = await response.json();
        setSuggestions((data.suggestions ?? []).flatMap((item: any) => {
          const prediction = item.placePrediction;
          return prediction ? [{ placeId: prediction.placeId, description: prediction.text.text }] : [];
        }));
      } catch { setSuggestions([]); } finally { setLoading(false); }
    }, 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [pickup, dropoff, activeField, pickupPlace, dropoffPlace]);

  const selectPlace = async (place: Place) => {
    if (!PLACES_KEY) return;
    Keyboard.dismiss(); setLoading(true);
    try {
      const response = await fetch('https://places.googleapis.com/v1/places/' + place.placeId + '?fields=formattedAddress,location,displayName', {
        headers: { 'X-Goog-Api-Key': PLACES_KEY, 'X-Goog-FieldMask': 'formattedAddress,location,displayName' },
      });
      const data = await response.json();
      if (!data.location) throw new Error('Coordinates were not returned');
      const chosen: SelectedPlace = { label: data.formattedAddress ?? data.displayName?.text ?? place.description, latitude: data.location.latitude, longitude: data.location.longitude };
      if (activeField === 'pickup') { setPickup(chosen.label); setPickupPlace(chosen); setActiveField('dropoff'); }
      else { setDropoff(chosen.label); setDropoffPlace(chosen); }
      setSuggestions([]);
      sessionToken.current = String(Date.now()) + '-' + Math.random().toString(36).slice(2);
    } catch { Alert.alert('Could not select place', 'Check that Places API (New) is enabled and your key has permission.'); }
    finally { setLoading(false); }
  };

  const swapLocations = () => { setPickup(dropoff); setDropoff(pickup); setPickupPlace(dropoffPlace); setDropoffPlace(pickupPlace); };
  const continueToNextStep = () => {
    if (!pickupPlace || !dropoffPlace) { Alert.alert('Choose locations from suggestions', 'Select both pickup and drop-off from Google Places results so the route can use real coordinates.'); return; }
    if (pickupPlace.latitude === dropoffPlace.latitude && pickupPlace.longitude === dropoffPlace.longitude) { Alert.alert('Choose different locations', 'Pickup and drop-off must be different.'); return; }
    router.push({ pathname: '/route', params: { pickup: pickupPlace.label, dropoff: dropoffPlace.label, pickupLat: String(pickupPlace.latitude), pickupLng: String(pickupPlace.longitude), dropoffLat: String(dropoffPlace.latitude), dropoffLng: String(dropoffPlace.longitude) } });
  };
  const activeText = activeField === 'pickup' ? pickup : dropoff;
  const setActiveText = (value: string) => { if (activeField === 'pickup') { setPickup(value); setPickupPlace(null); } else { setDropoff(value); setDropoffPlace(null); } };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}><ArrowLeft size={22} color={COLORS.text} /></Pressable>
          <View style={{ flex: 1 }}><Text style={styles.heading}>Where are you going?</Text><Text style={styles.subtitle}>Search Google Maps for a place or address</Text></View>
        </View>
        <View style={styles.content}>
          <View style={styles.routeCard}>
            <View style={styles.routeRail}><View style={styles.pickupDot} /><View style={styles.routeLine} /><View style={styles.dropoffDot} /></View>
            <View style={styles.routeFields}>
              <View style={styles.routeField}><Text style={styles.fieldLabel}>PICKUP</Text><TextInput accessibilityLabel="Pickup location" value={pickup} onChangeText={(v) => { setPickup(v); setPickupPlace(null); setActiveField('pickup'); }} onFocus={() => setActiveField('pickup')} placeholder="Search starting point" placeholderTextColor="#8D9AAD" returnKeyType="next" style={styles.locationInput} /></View>
              <View style={styles.routeDivider} />
              <View style={styles.routeField}><Text style={styles.fieldLabel}>DROP-OFF</Text><TextInput accessibilityLabel="Drop-off location" value={dropoff} onChangeText={(v) => { setDropoff(v); setDropoffPlace(null); setActiveField('dropoff'); }} onFocus={() => setActiveField('dropoff')} placeholder="Search destination" placeholderTextColor="#8D9AAD" returnKeyType="search" style={styles.locationInput} /></View>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Swap pickup and drop-off" onPress={swapLocations} style={styles.swapButton}><ArrowLeftRight size={18} color={COLORS.text} /></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Clear active location" onPress={() => setActiveText('')} style={styles.clearButton}><X size={14} color={COLORS.muted} /></Pressable>
          </View>
          {!PLACES_KEY ? <View style={styles.notice}><Text style={styles.noticeText}>Add EXPO_PUBLIC_GOOGLE_PLACES_API_KEY to your local .env to enable live Google Places suggestions.</Text></View> : null}
          <View style={styles.actionRow}>
            <Pressable accessibilityRole="button" onPress={() => Alert.alert('Current location', 'GPS pickup requires location permission and device location services; choose an address from search for now.')} style={styles.actionButton}><LocateFixed size={16} color={COLORS.text} /><Text style={styles.actionText}>Use current</Text></Pressable>
            <View style={[styles.actionButton, { opacity: 0.6 }]}><MapPin size={16} color={COLORS.text} /><Text style={styles.actionText}>Choose from search</Text></View>
          </View>
          <Text style={styles.sectionLabel}>{activeField === 'pickup' ? 'PICKUP SUGGESTIONS' : 'DESTINATION SUGGESTIONS'}</Text>
          {loading ? <ActivityIndicator style={{ marginTop: 22 }} color={COLORS.orange} /> : null}
          <FlatList keyboardShouldPersistTaps="handled" data={suggestions} keyExtractor={(item) => item.placeId} renderItem={({ item }) => (
            <Pressable onPress={() => selectPlace(item)} style={styles.suggestion}><View style={styles.suggestionIcon}><MapPin size={17} color={COLORS.muted} /></View><Text style={styles.suggestionText}>{item.description}</Text></Pressable>
          )} ListEmptyComponent={!loading ? <View style={styles.emptyState}><Text style={styles.emptyText}>{activeText.length < 3 ? 'Start typing at least 3 characters to find places.' : PLACES_KEY ? 'No places found yet. Try a more specific address.' : 'Google Places search is not configured.'}</Text></View> : null} />
        </View>
        <View style={styles.footer}><Pressable accessibilityRole="button" onPress={continueToNextStep} style={styles.nextButton}><Text style={styles.nextText}>Show route</Text></Pressable></View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background }, screen: { flex: 1, backgroundColor: COLORS.background },
  header: { minHeight: 82, flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 19, paddingTop: 9, paddingBottom: 13, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backButton: { width: 30, height: 30, justifyContent: 'center', marginRight: 10 }, heading: { color: COLORS.text, fontSize: 20, lineHeight: 27, fontWeight: '800', letterSpacing: -0.4 }, subtitle: { color: COLORS.muted, fontSize: 11, lineHeight: 17, marginTop: 2 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 14 }, routeCard: { minHeight: 124, flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 17, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 9, paddingLeft: 10, paddingRight: 45 },
  routeRail: { width: 15, alignItems: 'center', paddingTop: 16, paddingBottom: 15 }, pickupDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.orange }, routeLine: { flex: 1, width: 1, backgroundColor: '#DDE4EA', marginVertical: 4 }, dropoffDot: { width: 7, height: 7, borderRadius: 2, backgroundColor: COLORS.text },
  routeFields: { flex: 1, minWidth: 0 }, routeField: { minHeight: 51, justifyContent: 'center' }, fieldLabel: { color: COLORS.muted, fontSize: 9, fontWeight: '700', marginBottom: 4 }, locationInput: { height: 24, padding: 0, margin: 0, color: COLORS.text, fontSize: 12, fontWeight: '500' }, routeDivider: { height: 1, backgroundColor: COLORS.border },
  swapButton: { position: 'absolute', right: 9, top: 46, width: 29, height: 30, borderRadius: 9, backgroundColor: '#F1F4F7', alignItems: 'center', justifyContent: 'center' }, clearButton: { position: 'absolute', right: 12, top: 12, width: 20, height: 20, borderRadius: 10, backgroundColor: '#F1F4F7', alignItems: 'center', justifyContent: 'center' },
  notice: { backgroundColor: '#FFF5E9', borderRadius: 10, padding: 10, marginTop: 10 }, noticeText: { color: '#8B4B17', fontSize: 11, lineHeight: 16 }, actionRow: { flexDirection: 'row', gap: 9, marginTop: 11 },
  actionButton: { flex: 1, height: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border }, actionText: { color: COLORS.text, fontSize: 10, fontWeight: '700' },
  sectionLabel: { color: '#A0ADBB', fontSize: 9, fontWeight: '700', marginTop: 20, marginBottom: 9 }, emptyState: { minHeight: 60, backgroundColor: COLORS.white, borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 13, paddingVertical: 12 }, emptyText: { color: COLORS.muted, fontSize: 11, lineHeight: 16, textAlign: 'center' },
  suggestion: { minHeight: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.white }, suggestionIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F2F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 10 }, suggestionText: { flex: 1, color: COLORS.text, fontSize: 12, lineHeight: 17 },
  footer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 18, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border }, nextButton: { height: 42, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.orange, borderRadius: 11 }, nextText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
});