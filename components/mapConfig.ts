import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { PROVIDER_GOOGLE } from 'react-native-maps';

// Native-only: imports react-native-maps, so web builds must use the .web.tsx components instead.

// Expo Go on iOS has no Google Maps SDK; forcing it leaves the map blank and onMapReady never fires.
export const MAP_PROVIDER =
  Platform.OS === 'ios' && Constants.executionEnvironment === ExecutionEnvironment.StoreClient
    ? undefined
    : PROVIDER_GOOGLE;

// Muted beige/blue basemap from the design; satellite mode ignores it.
export const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#ECE7DD' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#7C8B99' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#F5F6F7' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#9FC4D8' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#DDE5D3' }, { visibility: 'on' }],
  },
];
