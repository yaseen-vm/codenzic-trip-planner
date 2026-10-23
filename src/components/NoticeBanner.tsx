import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

interface NoticeBannerProps {
  text: string;
  // Announces the message to screen readers when it appears.
  alert?: boolean;
}

const NOTICE_FONT_SIZE = 13;
const NOTICE_LINE_HEIGHT = 18;

export default function NoticeBanner({ text, alert }: NoticeBannerProps) {
  return (
    <View style={styles.banner} accessible={alert} accessibilityRole={alert ? 'alert' : undefined}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.noticeBackground,
    borderRadius: RADIUS.notice,
    padding: SPACING.md,
  },
  text: {
    color: COLORS.noticeText,
    fontFamily: FONTS.regular,
    fontSize: NOTICE_FONT_SIZE,
    lineHeight: NOTICE_LINE_HEIGHT,
  },
});
