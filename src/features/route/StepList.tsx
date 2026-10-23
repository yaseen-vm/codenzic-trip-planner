import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ROUTE_STRINGS } from '../../constants/strings';
import { COLORS, FONTS, SIZES, SPACING } from '../../constants/theme';
import type { RouteStep } from '../../types/route';
import { formatDistance } from '../../utils/format';
import { maneuverIcon } from './maneuverIcon';

interface StepListProps {
  loading: boolean;
  steps: RouteStep[];
  // Shown instead of the steps when there are none, e.g. the reason a route failed.
  message?: string;
}

const STEP_ICON_SIZE = 32;

export default function StepList({ loading, steps, message }: StepListProps) {
  if (loading) {
    return <ActivityIndicator color={COLORS.orange} style={styles.loader} />;
  }
  if (!steps.length) {
    return <Text style={styles.emptyText}>{message || ROUTE_STRINGS.directionsPlaceholder}</Text>;
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {steps.map((step, index) => {
        const Icon = maneuverIcon(step.maneuver);
        return (
          // Steps have no stable id and the list is never reordered.
          <View key={index} style={[styles.row, index > 0 && styles.divider]}>
            <View style={styles.icon}>
              <Icon size={SIZES.iconSm} color={COLORS.text} />
            </View>
            <View style={styles.text}>
              <Text style={styles.title}>{step.title}</Text>
              {step.subtitle ? <Text style={styles.subtitle}>{step.subtitle}</Text> : null}
            </View>
            {step.distanceMeters ? (
              <Text style={styles.distance}>{formatDistance(step.distanceMeters)}</Text>
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: SPACING.md },
  scroll: { flex: 1 },
  content: { paddingBottom: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
    minHeight: 66,
  },
  divider: { borderTopWidth: 1, borderTopColor: COLORS.border },
  icon: {
    width: STEP_ICON_SIZE,
    height: STEP_ICON_SIZE,
    borderRadius: STEP_ICON_SIZE / 2,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  text: { flex: 1, minWidth: 0, marginLeft: SPACING.md },
  title: { color: COLORS.text, fontFamily: FONTS.bold, fontSize: 15, lineHeight: 20.6 },
  subtitle: {
    color: COLORS.muted,
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19.5,
    marginTop: 2,
  },
  distance: {
    color: COLORS.muted,
    fontFamily: FONTS.bold,
    fontSize: 13,
    lineHeight: 19.5,
    marginLeft: SPACING.md,
    marginTop: 2,
  },
  emptyText: { color: COLORS.muted, fontFamily: FONTS.regular, fontSize: 14, lineHeight: 20 },
});
