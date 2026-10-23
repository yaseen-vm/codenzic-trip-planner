import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../../constants/theme';
import type { TravelMode } from '../../types/route';
import { TRAVEL_MODES } from './travelModes';

interface ModeSelectorProps {
  mode: TravelMode;
  onChange: (mode: TravelMode) => void;
}

const MODE_BUTTON_HEIGHT = 43;

export default function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <View style={styles.row}>
      {TRAVEL_MODES.map((item) => {
        const active = mode === item.key;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(item.key)}
            style={[styles.button, active && styles.buttonActive]}
          >
            <Text style={[styles.text, active && styles.textActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  button: {
    flex: 1,
    height: MODE_BUTTON_HEIGHT,
    borderRadius: RADIUS.control,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: { backgroundColor: COLORS.paleOrange, borderColor: COLORS.orange },
  text: { color: COLORS.text, fontFamily: FONTS.bold, fontSize: 14 },
  textActive: { color: COLORS.orangeDark },
});
