import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MAP_STRINGS } from '../../constants/strings';
import { COLORS, FONTS, RADIUS, SPACING } from '../../constants/theme';
import PrimaryButton from '../PrimaryButton';
import type { MapPickerProps } from './mapPickerTypes';

// react-native-maps has no web support, so the web build offers the initial centre only.
export default function MapPicker({
  visible,
  title,
  initialCenter,
  onCancel,
  onConfirm,
}: MapPickerProps) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <Pressable
        accessibilityLabel={MAP_STRINGS.closeMap}
        accessibilityRole="button"
        style={styles.backdrop}
        onPress={onCancel}
      >
        {/* The inner Pressable keeps taps on the card from reaching the backdrop. */}
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{MAP_STRINGS.webUnavailable}</Text>
          <View style={styles.actions}>
            <PrimaryButton
              label={MAP_STRINGS.useMapCenter}
              onPress={() => onConfirm(initialCenter)}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.sheet, padding: SPACING.xxl },
  title: { color: COLORS.text, fontFamily: FONTS.extraBold, fontSize: 22 },
  body: {
    color: COLORS.muted,
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22,
    marginTop: SPACING.sm,
  },
  actions: { marginTop: SPACING.xl },
});
