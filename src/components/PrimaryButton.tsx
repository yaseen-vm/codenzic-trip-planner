import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, FONTS, RADIUS, SIZES, SPACING } from '../constants/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  // Blocks presses and dims the button.
  disabled?: boolean;
  // Looks inactive but stays pressable, e.g. so a tap can explain what is still missing.
  dimmed?: boolean;
  icon?: ReactNode;
}

export default function PrimaryButton({
  label,
  onPress,
  disabled,
  dimmed,
  icon,
}: PrimaryButtonProps) {
  const inactive = Boolean(disabled || dimmed);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        inactive && styles.inactive,
        pressed && !inactive && styles.pressed,
      ]}
    >
      {icon}
      <Text style={[styles.text, inactive && styles.textInactive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: SIZES.button,
    backgroundColor: COLORS.orange,
    borderRadius: RADIUS.control,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  pressed: { opacity: 0.88 },
  inactive: { backgroundColor: COLORS.border },
  text: { color: COLORS.white, fontFamily: FONTS.extraBold, fontSize: 17 },
  textInactive: { color: COLORS.faint },
});
