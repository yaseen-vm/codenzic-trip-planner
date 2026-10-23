import { useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Region } from 'react-native-maps';
import { ChevronLeft, MapPin } from 'lucide-react-native';
import { PICKER_REGION_DELTA } from '../../constants/config';
import { MAP_STYLE } from '../../constants/mapStyle';
import { MAP_STRINGS } from '../../constants/strings';
import { COLORS, FONTS, RADIUS, SIZES, SPACING } from '../../constants/theme';
import FloatingIconButton from '../FloatingIconButton';
import PrimaryButton from '../PrimaryButton';
import { MAP_PROVIDER } from './mapConfig';
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
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: PICKER_REGION_DELTA,
              longitudeDelta: PICKER_REGION_DELTA,
            }}
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

          <FloatingIconButton label={MAP_STRINGS.closeMap} onPress={onCancel}>
            <ChevronLeft size={SIZES.iconLg} color={COLORS.text} />
          </FloatingIconButton>

          <View style={[styles.sheet, { paddingBottom: SPACING.lg + insets.bottom }]}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Text style={styles.sheetHint}>
              {ready ? MAP_STRINGS.moveHint : MAP_STRINGS.loadingMap}
            </Text>
            <PrimaryButton
              label={MAP_STRINGS.confirmLocation}
              onPress={() => onConfirm(center.current)}
            />
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
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.sheet,
    borderTopRightRadius: RADIUS.sheet,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  sheetTitle: { color: COLORS.text, fontFamily: FONTS.extraBold, fontSize: 20 },
  sheetHint: {
    color: COLORS.muted,
    fontFamily: FONTS.regular,
    fontSize: 14,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
});
