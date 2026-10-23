import { useCallback, useState } from 'react';
import * as Location from 'expo-location';
import { LOCATION_STRINGS } from '../constants/strings';
import { describeCoordinate } from '../services/geocoding';
import type { SelectedPlace } from '../types/places';

/** Requests permission and resolves the device position as a labelled place. */
export function useCurrentLocation() {
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState('');

  const locate = useCallback(async (): Promise<SelectedPlace | null> => {
    setNotice('');
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        setNotice(LOCATION_STRINGS.permissionDenied);
        return null;
      }
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        label: await describeCoordinate(coords.latitude, coords.longitude),
        latitude: coords.latitude,
        longitude: coords.longitude,
      };
    } catch {
      setNotice(LOCATION_STRINGS.locationUnavailable);
      return null;
    } finally {
      setLocating(false);
    }
  }, []);

  return { locate, locating, notice, clearNotice: () => setNotice('') };
}
