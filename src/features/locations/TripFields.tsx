import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowUpDown, X } from 'lucide-react-native';
import RouteRail from '../../components/RouteRail';
import { LOCATION_STRINGS } from '../../constants/strings';
import { COLORS, FONTS, RADIUS, SHADOWS, SIZES, SPACING } from '../../constants/theme';
import type { FieldKey, TripFormState } from './tripForm';

interface TripFieldsProps {
  form: TripFormState;
  onChangeText: (field: FieldKey, text: string) => void;
  onFocus: (field: FieldKey) => void;
  onClear: (field: FieldKey) => void;
  onSwap: () => void;
}

const FIELD_COPY: Record<
  FieldKey,
  {
    label: string;
    accessibility: string;
    placeholder: string;
    clear: string;
    returnKey: 'next' | 'search';
  }
> = {
  pickup: {
    label: LOCATION_STRINGS.pickupLabel,
    accessibility: LOCATION_STRINGS.pickupAccessibility,
    placeholder: LOCATION_STRINGS.pickupPlaceholder,
    clear: LOCATION_STRINGS.clearPickup,
    returnKey: 'next',
  },
  dropoff: {
    label: LOCATION_STRINGS.dropoffLabel,
    accessibility: LOCATION_STRINGS.dropoffAccessibility,
    placeholder: LOCATION_STRINGS.dropoffPlaceholder,
    clear: LOCATION_STRINGS.clearDropoff,
    returnKey: 'search',
  },
};

const FIELDS: FieldKey[] = ['pickup', 'dropoff'];
const CLEAR_BUTTON_SIZE = 28;
const SWAP_BUTTON_SIZE = 40;

// The pickup/drop-off card: a rail on the left, two inputs, and a swap button.
export default function TripFields({
  form,
  onChangeText,
  onFocus,
  onClear,
  onSwap,
}: TripFieldsProps) {
  return (
    <View style={styles.card}>
      <RouteRail style={styles.rail} />
      <View style={styles.fields}>
        {FIELDS.map((field, index) => {
          const copy = FIELD_COPY[field];
          const { text } = form[field];
          return (
            <View key={field}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <View style={styles.field}>
                <Text style={[styles.label, form.active === field && styles.labelActive]}>
                  {copy.label}
                </Text>
                <View style={styles.inputRow}>
                  <TextInput
                    accessibilityLabel={copy.accessibility}
                    value={text}
                    onChangeText={(value) => onChangeText(field, value)}
                    onFocus={() => onFocus(field)}
                    placeholder={copy.placeholder}
                    placeholderTextColor={COLORS.placeholder}
                    returnKeyType={copy.returnKey}
                    style={styles.input}
                  />
                  {text ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={copy.clear}
                      onPress={() => onClear(field)}
                      style={styles.clearButton}
                    >
                      <X size={14} color={COLORS.muted} />
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </View>
          );
        })}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={LOCATION_STRINGS.swap}
        onPress={onSwap}
        style={styles.swapButton}
      >
        <ArrowUpDown size={SIZES.iconMd} color={COLORS.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    ...SHADOWS.subtle,
  },
  rail: { paddingTop: 22 },
  fields: { flex: 1, minWidth: 0, marginLeft: SPACING.md, marginRight: 52 },
  field: { height: 72, paddingTop: 11 },
  label: {
    color: COLORS.faint,
    fontFamily: FONTS.extraBold,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.96,
    marginBottom: 1,
  },
  labelActive: { color: COLORS.orange },
  inputRow: { height: 36, flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    height: 36,
    padding: 0,
    margin: 0,
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  clearButton: {
    width: CLEAR_BUTTON_SIZE,
    height: CLEAR_BUTTON_SIZE,
    marginLeft: SPACING.sm,
    borderRadius: CLEAR_BUTTON_SIZE / 2,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.xs },
  swapButton: {
    position: 'absolute',
    right: 17,
    top: 38,
    width: SWAP_BUTTON_SIZE,
    height: SWAP_BUTTON_SIZE,
    borderRadius: RADIUS.notice,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
