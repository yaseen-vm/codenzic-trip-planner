import { StyleSheet, Text, View } from 'react-native';
import { TriangleAlert } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../../components/PrimaryButton';
import { ROUTE_STRINGS } from '../../constants/strings';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

interface InvalidRouteStateProps {
  onChooseLocations: () => void;
}

const ALERT_ICON_SIZE = 40;

// Shown when the route params are missing or malformed, instead of guessing a route.
export default function InvalidRouteState({ onChooseLocations }: InvalidRouteStateProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <TriangleAlert size={ALERT_ICON_SIZE} color={COLORS.orange} />
        <Text style={styles.title}>{ROUTE_STRINGS.invalidTitle}</Text>
        <Text style={styles.message}>{ROUTE_STRINGS.invalidMessage}</Text>
        <View style={styles.action}>
          <PrimaryButton label={ROUTE_STRINGS.chooseLocations} onPress={onChooseLocations} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
    gap: SPACING.md,
  },
  title: { color: COLORS.text, fontFamily: FONTS.extraBold, fontSize: 22 },
  message: { color: COLORS.muted, fontFamily: FONTS.regular, fontSize: 14, lineHeight: 20 },
  action: { alignSelf: 'stretch' },
});
