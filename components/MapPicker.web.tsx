import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from './PrimaryButton';
import { COLORS, FONTS, RADIUS } from '../constants/theme';
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
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>
            Map selection is available in the mobile app. Use search or a saved place on the web.
          </Text>
          <View style={styles.actions}>
            <PrimaryButton label="Use map centre" onPress={() => onConfirm(initialCenter)} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17,31,44,0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.sheet, padding: 24 },
  title: { color: COLORS.text, fontFamily: FONTS.extraBold, fontSize: 22 },
  body: {
    color: COLORS.muted,
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  actions: { marginTop: 20 },
});
