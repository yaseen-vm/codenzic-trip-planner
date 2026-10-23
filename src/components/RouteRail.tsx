import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS } from '../constants/theme';

interface RouteRailProps {
  style?: StyleProp<ViewStyle>;
}

const DOT_SIZE = 10;
const LINE_WIDTH = 2;
const LINE_MARGIN = 4;
const SQUARE_MARKER_RADIUS = 2;

// Pickup dot, connecting line and square drop-off marker, shown beside a pickup/drop-off pair.
export default function RouteRail({ style }: RouteRailProps) {
  return (
    <View style={[styles.rail, style]}>
      <View style={styles.startDot} />
      <View style={styles.line} />
      <View style={styles.endDot} />
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { width: DOT_SIZE, alignItems: 'center' },
  startDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: COLORS.orange,
  },
  line: { flex: 1, width: LINE_WIDTH, backgroundColor: COLORS.border, marginVertical: LINE_MARGIN },
  endDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: SQUARE_MARKER_RADIUS,
    backgroundColor: COLORS.text,
  },
});
