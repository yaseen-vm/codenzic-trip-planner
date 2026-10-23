import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SIZES, SPACING } from '../constants/theme';

interface FloatingIconButtonProps {
  label: string;
  onPress: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

// Round-cornered white button that floats over a map; position it through `style`.
export default function FloatingIconButton({
  label,
  onPress,
  children,
  style,
}: FloatingIconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.button, style]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.lg,
    width: SIZES.floatingButton,
    height: SIZES.floatingButton,
    borderRadius: RADIUS.control,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...SHADOWS.floating,
  },
});
