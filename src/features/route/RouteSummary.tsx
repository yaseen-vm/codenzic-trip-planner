import { StyleSheet, Text, View } from 'react-native';
import SectionLabel from '../../components/SectionLabel';
import { COMMON_STRINGS, ROUTE_STRINGS } from '../../constants/strings';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import type { RouteState } from '../../hooks/useRoute';
import { formatArrival, formatDistance, formatDuration } from '../../utils/format';

interface RouteSummaryProps {
  state: RouteState;
}

type Summary = { duration: string; distance: string; arrival?: string };

function describe(state: RouteState): Summary {
  switch (state.status) {
    case 'loading':
      return { duration: ROUTE_STRINGS.calculating, distance: COMMON_STRINGS.emptyValue };
    case 'error':
      return { duration: state.headline, distance: ROUTE_STRINGS.routeUnavailable };
    case 'ready':
      return {
        duration: formatDuration(state.route.durationSeconds),
        distance: formatDistance(state.route.distanceMeters),
        arrival: formatArrival(state.route.durationSeconds, state.receivedAt),
      };
  }
}

// Headline duration with distance and arrival time beneath it.
export default function RouteSummary({ state }: RouteSummaryProps) {
  const { duration, distance, arrival } = describe(state);

  return (
    <View style={styles.header}>
      <View style={styles.main}>
        <SectionLabel>{ROUTE_STRINGS.eyebrow}</SectionLabel>
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5} style={styles.duration}>
          {duration}
        </Text>
      </View>
      <Text style={styles.distance}>
        {distance}
        {arrival ? (
          <>
            <Text style={styles.dot}> · </Text>
            {ROUTE_STRINGS.arrive}
            {arrival}
          </>
        ) : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SPACING.lg,
  },
  main: { flex: 1, marginRight: SPACING.md },
  duration: {
    color: COLORS.text,
    fontFamily: FONTS.extraBold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.85,
  },
  distance: {
    color: COLORS.muted,
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 6,
  },
  dot: { color: COLORS.faint },
});
