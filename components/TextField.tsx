import { ComponentType, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { COLORS, FONTS, RADIUS } from '../constants/theme';

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
        {Icon ? <Icon size={18} color={COLORS.muted} /> : null}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={COLORS.placeholder}
          secureTextEntry={password && !visible}
          style={[styles.input, style]}
          {...inputProps}
        />
        {password ? (
          <Pressable
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => setVisible((value) => !value)}
            style={styles.eyeButton}
          >
            {visible ? (
              <EyeOff size={18} color={COLORS.muted} />
            ) : (
              <Eye size={18} color={COLORS.muted} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  label: { color: COLORS.text, fontFamily: FONTS.bold, fontSize: 15 },
  wrap: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 16,
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.control,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  wrapError: { borderColor: COLORS.orange },
  input: {
    flex: 1,
    height: '100%',
    paddingRight: 16,
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
