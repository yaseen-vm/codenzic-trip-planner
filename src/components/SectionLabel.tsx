import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

interface SectionLabelProps {
  children: string;
  style?: StyleProp<TextStyle>;
}

// Small tracked caps label used above lists and summaries.
export default function SectionLabel({ children, style }: SectionLabelProps) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    color: COLORS.faint,
    fontFamily: FONTS.extraBold,
    fontSize: 13,
    lineHeight: 19.5,
    letterSpacing: 1.04,
  },
});
