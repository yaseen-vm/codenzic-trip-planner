import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../constants/theme';

interface TripPlacesProps {
  pickup: string;
  dropoff: string;
  // Grey fill for use inside a white sheet; white with a border otherwise.
  tinted?: boolean;
}

// Pickup/drop-off pair joined by a rail, used in the Route screen sheet.
export default function TripPlaces({ pickup, dropoff, tinted }: TripPlacesProps) {
  return (
    <View style={[styles.card, tinted ? styles.tinted : styles.outlined]}>
      <View style={styles.rail}>
        <View style={styles.startDot} />
        <View style={styles.line} />
        <View style={styles.endDot} />
      </View>
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
  card: { flexDirection: 'row', padding: 16 },
  tinted: { backgroundColor: COLORS.background, borderRadius: RADIUS.control, marginBottom: 20 },
  outlined: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rail: { width: 10, alignItems: 'center', paddingVertical: 6 },
  startDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.orange },
  line: { flex: 1, width: 2, backgroundColor: COLORS.border, marginVertical: 4 },
  endDot: { width: 10, height: 10, borderRadius: 2, backgroundColor: COLORS.text },
  labels: { flex: 1, minWidth: 0, marginLeft: 12, justifyContent: 'space-between', gap: 10 },
  text: { color: COLORS.text, fontFamily: FONTS.bold, fontSize: 15, lineHeight: 22.5 },
});
