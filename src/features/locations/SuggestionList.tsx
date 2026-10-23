import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, RADIUS, SIZES, SPACING } from '../../constants/theme';
import type { ListRow } from './locationRows';

interface SuggestionListProps {
  rows: ListRow[];
  onSelect: (row: ListRow) => void;
}

const ROW_MIN_HEIGHT = 72;
const ROW_ICON_SIZE = 40;

export default function SuggestionList({ rows, onSelect }: SuggestionListProps) {
  return (
    <View style={styles.list}>
      {rows.map((row, index) => {
        const Icon = row.icon;
        return (
          <Pressable
            key={row.key}
            accessibilityRole="button"
            onPress={() => onSelect(row)}
            style={[styles.row, index > 0 && styles.divider]}
          >
            <View style={styles.icon}>
              <Icon size={SIZES.iconMd} color={COLORS.text} />
            </View>
            <View style={styles.text}>
              <Text numberOfLines={1} style={styles.title}>
                {row.title}
              </Text>
              {row.subtitle ? (
                <Text numberOfLines={1} style={styles.subtitle}>
                  {row.subtitle}
                </Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  row: {
    minHeight: ROW_MIN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  divider: { borderTopWidth: 1, borderTopColor: COLORS.border },
  icon: {
    width: ROW_ICON_SIZE,
    height: ROW_ICON_SIZE,
    borderRadius: ROW_ICON_SIZE / 2,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  text: { flex: 1, minWidth: 0 },
  title: { color: COLORS.text, fontFamily: FONTS.bold, fontSize: 15, lineHeight: 22.5 },
  subtitle: {
    color: COLORS.muted,
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19.5,
    marginTop: 2,
  },
});
