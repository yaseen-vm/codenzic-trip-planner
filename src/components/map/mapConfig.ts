import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { PROVIDER_GOOGLE } from 'react-native-maps';

// Native-only: imports react-native-maps, so web builds must use the .web.tsx components instead.

// Expo Go on iOS has no Google Maps SDK; forcing it leaves the map blank and onMapReady never fires.
export const MAP_PROVIDER =
  Platform.OS === 'ios' && Constants.executionEnvironment === ExecutionEnvironment.StoreClient
    ? undefined
    : PROVIDER_GOOGLE;
