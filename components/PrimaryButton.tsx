import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../constants/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export default function PrimaryButton({ label, onPress, disabled }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    backgroundColor: COLORS.orange,
    borderRadius: RADIUS.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.88 },
  disabled: { backgroundColor: COLORS.border },
  text: { color: COLORS.white, fontFamily: FONTS.extraBold, fontSize: 17 },
  textDisabled: { color: COLORS.faint },
});
