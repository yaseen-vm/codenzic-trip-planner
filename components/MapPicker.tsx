import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Region } from 'react-native-maps';
import { ChevronLeft, MapPin } from 'lucide-react-native';
import PrimaryButton from './PrimaryButton';
import { MAP_PROVIDER, MAP_STYLE } from './mapConfig';
import { COLORS, FONTS, RADIUS } from '../constants/theme';
import type { MapPickerProps } from './mapPickerTypes';

const PIN_SIZE = 40;

// Full-screen map with a fixed centre pin; the point under the pin is what gets confirmed.
export default function MapPicker({
  visible,
  title,
  initialCenter,
  onCancel,
  onConfirm,
}: MapPickerProps) {
  const insets = useSafeAreaInsets();
  const center = useRef(initialCenter);
  const [ready, setReady] = useState(false);

  // Reset on each open so a previous pan or an old centre never leaks into the next pick.
  const { latitude, longitude } = initialCenter;
  useEffect(() => {
    if (visible) {
      center.current = { latitude, longitude };
    }
  }, [visible, latitude, longitude]);

  const handleRegionChange = (region: Region) => {
    center.current = { latitude: region.latitude, longitude: region.longitude };
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onCancel}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.flex}>
          <MapView
            style={StyleSheet.absoluteFill}
            provider={MAP_PROVIDER}
            customMapStyle={MAP_STYLE}
            initialRegion={{ latitude, longitude, latitudeDelta: 0.03, longitudeDelta: 0.03 }}
            onMapReady={() => setReady(true)}
            onRegionChangeComplete={handleRegionChange}
            toolbarEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
            showsMyLocationButton={false}
          />

          {/* Pin tip sits on the map centre, so lift the icon by half its height. */}
          <View pointerEvents="none" style={styles.pinWrap}>
            <MapPin size={PIN_SIZE} color={COLORS.orange} fill={COLORS.white} />
          </View>

          <Pressable
            accessibilityLabel="Close map"
            accessibilityRole="button"
            onPress={onCancel}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={COLORS.text} />
          </Pressable>

          <View style={[styles.sheet, { paddingBottom: 16 + insets.bottom }]}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Text style={styles.sheetHint}>
              {ready ? 'Move the map to place the pin on your spot.' : 'Loading map…'}
            </Text>
            <PrimaryButton label="Confirm location" onPress={() => onConfirm(center.current)} />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  flex: { flex: 1 },
  pinWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: PIN_SIZE,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: RADIUS.control,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.sheet,
    borderTopRightRadius: RADIUS.sheet,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sheetTitle: { color: COLORS.text, fontFamily: FONTS.extraBold, fontSize: 20 },
  sheetHint: {
    color: COLORS.muted,
    fontFamily: FONTS.regular,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
});
