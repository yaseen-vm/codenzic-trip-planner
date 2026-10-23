import { ComponentType, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { AUTH_STRINGS } from '../constants/strings';
import { COLORS, FONTS, RADIUS, SHADOWS, SIZES, SPACING } from '../constants/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: ComponentType<{ size?: number; color?: string }>;
  // Adds a show/hide toggle and hides the text by default.
  password?: boolean;
}

export default function TextField({
  label,
  error,
  icon: Icon,
  password,
  style,
  ...inputProps
}: TextFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.wrap, Boolean(error) && styles.wrapError]}>
        {Icon ? <Icon size={SIZES.iconMd} color={COLORS.muted} /> : null}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={COLORS.placeholder}
          secureTextEntry={password && !visible}
          style={[styles.input, style]}
          {...inputProps}
        />
        {password ? (
          <Pressable
            accessibilityLabel={visible ? AUTH_STRINGS.hidePassword : AUTH_STRINGS.showPassword}
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => setVisible((value) => !value)}
            style={styles.eyeButton}
          >
            {visible ? (
              <EyeOff size={SIZES.iconMd} color={COLORS.muted} />
            ) : (
              <Eye size={SIZES.iconMd} color={COLORS.muted} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: SPACING.sm },
  label: { color: COLORS.text, fontFamily: FONTS.bold, fontSize: 15 },
  wrap: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingLeft: SPACING.lg,
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.control,
    ...SHADOWS.subtle,
  },
  wrapError: { borderColor: COLORS.orange },
  input: {
    flex: 1,
    height: '100%',
    paddingRight: SPACING.lg,
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
    fontSize: 15,
  },
  eyeButton: {
    width: 40,
    height: 40,
    marginRight: 7,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: { color: COLORS.orange, fontFamily: FONTS.regular, fontSize: 13 },
});
