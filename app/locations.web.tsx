import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { APIProvider, Map, useMapsLibrary } from '@vis.gl/react-google-maps';

const KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

function Picker() {
  const router = useRouter();
  const places = useMapsLibrary('places');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [from, setFrom] = useState<any>(null);
  const [to, setTo] = useState<any>(null);
  const [active, setActive] = useState<'from' | 'to'>('from');
  const [items, setItems] = useState<any[]>([]);
  const query = active === 'from' ? pickup : dropoff;

  const search = async (value: string, field: 'from' | 'to') => {
    setActive(field);
    if (field === 'from') { setPickup(value); setFrom(null); } else { setDropoff(value); setTo(null); }
    if (!places || value.length < 3) { setItems([]); return; }
    const service = new places.AutocompleteService();
    const result = await service.getPlacePredictions({ input: value });
    setItems((result.predictions || []).map((p) => ({ id: p.place_id, label: p.description })));
  };
  const choose = async (item: any) => {
    if (!places) return;
    const result = await new google.maps.Geocoder().geocode({ placeId: item.id });
    const place = result.results[0];
    if (!place) return;
    const selected = { label: place.formatted_address, lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
    if (active === 'from') { setFrom(selected); setPickup(selected.label); setActive('to'); }
    else { setTo(selected); setDropoff(selected.label); }
    setItems([]);
  };
  return <View style={s.page}>
    <Text style={s.heading}>Where are you going?</Text>
    <TextInput placeholder="Pickup location" value={pickup} onFocus={() => setActive('from')} onChangeText={(v) => search(v, 'from')} style={s.input} />
    <TextInput placeholder="Destination" value={dropoff} onFocus={() => setActive('to')} onChangeText={(v) => search(v, 'to')} style={s.input} />
    {items.map((item) => <Pressable key={item.id} onPress={() => choose(item)} style={s.item}><Text>{item.label}</Text></Pressable>)}
    <Pressable disabled={!from || !to} style={s.button} onPress={() => router.push({ pathname: '/route', params: { pickup: from.label, dropoff: to.label, pickupLat: String(from.lat), pickupLng: String(from.lng), dropoffLat: String(to.lat), dropoffLng: String(to.lng) } })}><Text style={s.buttonText}>Show route</Text></Pressable>
  </View>;
}
export default function LocationsWebScreen() {
  if (!KEY) return <View style={s.page}><Text>Add EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY to .env.</Text></View>;
  return <APIProvider apiKey={KEY} libraries={['places']}><Picker /></APIProvider>;
}
const s = StyleSheet.create({ page: { flex: 1, minHeight: '100vh' as any, maxWidth: 760, width: '100%', alignSelf: 'center', padding: 24, gap: 12, backgroundColor: '#F2F4F6' }, heading: { fontSize: 22, fontWeight: '800', color: '#172533' }, input: { backgroundColor: '#fff', padding: 14, borderRadius: 10, fontSize: 14 }, item: { backgroundColor: '#fff', padding: 12 }, button: { padding: 15, alignItems: 'center', backgroundColor: '#F1521F', borderRadius: 10 }, buttonText: { color: '#fff', fontWeight: '700' } });
