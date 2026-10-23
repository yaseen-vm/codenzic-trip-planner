import Svg, { Path, Rect } from 'react-native-svg';
import { COLORS } from '../../constants/theme';

const STROKE = {
  stroke: COLORS.white,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
} as const;

const PIN_RING_WIDTH = 2;

const VEHICLE_PIN_SIZE = 36;
const VEHICLE_PIN_PATHS = [
  'M24.3401 31.99V23.9929C24.3401 23.2567 23.7431 22.66 23.0068 22.66H17.6734C16.937 22.66 16.3401 23.2567 16.3401 23.9929V31.3236C16.3401 31.6916 16.6386 31.99 17.0068 31.99H18.3401',
  'M25 32H21',
  'M27.6713 32H29.0038C29.3718 32 29.6701 31.7014 29.6701 31.333V28.8985C29.6698 28.7471 29.6181 28.6003 29.5235 28.4822L27.205 25.5808C27.0787 25.4226 26.8876 25.3303 26.6853 25.33H24.3401',
  'M25 31.995C25 31.2577 25.5977 30.66 26.335 30.66C27.0723 30.66 27.67 31.2577 27.67 31.995C27.67 32.7323 27.0723 33.33 26.335 33.33C25.5977 33.33 25 32.7323 25 31.995Z',
  'M18.3401 31.995C18.3401 31.2577 18.9378 30.66 19.6751 30.66C20.4124 30.66 21.0101 31.2577 21.0101 31.995C21.0101 32.7323 20.4124 33.33 19.6751 33.33C18.9378 33.33 18.3401 32.7323 18.3401 31.995Z',
];

const DROP_PIN_SIZE = 32;
const DROP_PIN_PATHS = [
  'M39.3399 24.7261C39.3399 28.0877 35.6461 31.5887 34.4057 32.67C34.1683 32.8502 33.8415 32.8502 33.6041 32.67C32.3637 31.5887 28.6699 28.0877 28.6699 24.7261C28.6699 21.7514 31.0585 19.34 34.0049 19.34C36.9514 19.34 39.3399 21.7514 39.3399 24.7261Z',
  'M32 24.67C32 23.5654 32.8954 22.67 34 22.67C35.1046 22.67 36 23.5654 36 24.67C36 25.7746 35.1046 26.67 34 26.67C32.8954 26.67 32 25.7746 32 24.67Z',
];

// Orange pickup marker with a vehicle glyph.
export function VehiclePin() {
  const size = VEHICLE_PIN_SIZE;
  return (
    <Svg width={size} height={size} viewBox={`5 10 ${size} ${size}`}>
      <Rect x={5} y={10} width={size} height={size} rx={size / 2} fill={COLORS.orange} />
      <Rect
        x={6}
        y={11}
        width={size - 2}
        height={size - 2}
        rx={size / 2 - 1}
        stroke={COLORS.white}
        strokeWidth={PIN_RING_WIDTH}
        fill="none"
      />
      {VEHICLE_PIN_PATHS.map((d) => (
        <Path key={d} d={d} {...STROKE} />
      ))}
    </Svg>
  );
}

// Dark destination marker with a map-pin glyph.
export function DropPin() {
  const size = DROP_PIN_SIZE;
  return (
    <Svg width={size} height={size} viewBox={`18 10 ${size} ${size}`}>
      <Rect x={18} y={10} width={size} height={size} rx={size / 2} fill={COLORS.dark} />
      <Rect
        x={19}
        y={11}
        width={size - 2}
        height={size - 2}
        rx={size / 2 - 1}
        stroke={COLORS.white}
        strokeWidth={PIN_RING_WIDTH}
        fill="none"
      />
      {DROP_PIN_PATHS.map((d) => (
        <Path key={d} d={d} {...STROKE} />
      ))}
    </Svg>
  );
}
