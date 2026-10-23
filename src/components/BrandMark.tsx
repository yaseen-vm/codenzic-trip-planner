import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AUTH_STRINGS } from '../constants/strings';
import { COLORS } from '../constants/theme';

const LOGO_SIZE = 56;
const LOGO_RADIUS = 18;
const STROKE_WIDTH = 2.5;

// Route glyph: start node, winding road, end node.
const LOGO_PATHS = [
  'M17.5 36.17C17.5 34.237 19.067 32.67 21 32.67C22.933 32.67 24.5 34.237 24.5 36.17C24.5 38.103 22.933 39.67 21 39.67C19.067 39.67 17.5 38.103 17.5 36.17Z',
  'M24.5 36.16H34.4167C36.6718 36.16 38.5 34.3322 38.5 32.0775C38.5 29.8228 36.6718 27.995 34.4167 27.995H21.5833C19.3282 27.995 17.5 26.1672 17.5 23.9125C17.5 21.6578 19.3282 19.83 21.5833 19.83H31.5',
  'M31.5 19.83C31.5 17.897 33.067 16.33 35 16.33C36.933 16.33 38.5 17.897 38.5 19.83C38.5 21.763 36.933 23.33 35 23.33C33.067 23.33 31.5 21.763 31.5 19.83Z',
];

export default function BrandMark() {
  return (
    <View style={styles.mark}>
      <Svg
        width={LOGO_SIZE}
        height={LOGO_SIZE}
        viewBox={`0 0 ${LOGO_SIZE} ${LOGO_SIZE}`}
        accessibilityLabel={AUTH_STRINGS.logoLabel}
      >
        {LOGO_PATHS.map((d) => (
          <Path
            key={d}
            d={d}
            fill="none"
            stroke={COLORS.white}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_RADIUS,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
