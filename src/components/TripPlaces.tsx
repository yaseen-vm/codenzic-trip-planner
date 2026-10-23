import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';
import RouteRail from './RouteRail';

interface TripPlacesProps {
  pickup: string;
  dropoff: string;
  // Grey fill for use inside a white sheet; white with a border otherwise.
  tinted?: boolean;
}

const RAIL_VERTICAL_INSET = 6;
const LABEL_GAP = 10;

// Pickup/drop-off pair joined by a rail, used in the Route screen sheet.
export default function TripPlaces({ pickup, dropoff, tinted }: TripPlacesProps) {
  return (
    <View style={[styles.card, tinted ? styles.tinted : styles.outlined]}>
      <RouteRail style={styles.rail} />
      <View style={styles.labels}>
        <Text numberOfLines={1} style={styles.text}>
          {pickup}
        </Text>
        <Text numberOfLines={1} style={styles.text}>
          {dropoff}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', padding: SPACING.lg },
  tinted: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.control,
    marginBottom: SPACING.xl,
  },
  outlined: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rail: { paddingVertical: RAIL_VERTICAL_INSET },
  labels: {
    flex: 1,
    minWidth: 0,
    marginLeft: SPACING.md,
    justifyContent: 'space-between',
    gap: LABEL_GAP,
  },
  text: { color: COLORS.text, fontFamily: FONTS.bold, fontSize: 15, lineHeight: 22.5 },
});
