import {
  ArrowUp,
  CornerUpLeft,
  CornerUpRight,
  Merge,
  RotateCw,
  Ship,
  type LucideIcon,
} from 'lucide-react-native';

/** Picks the glyph for a Routes API maneuver code; unknown or missing codes mean "straight on". */
export function maneuverIcon(maneuver?: string): LucideIcon {
  if (!maneuver) return ArrowUp;
  if (maneuver.startsWith('ROUNDABOUT') || maneuver.startsWith('UTURN')) return RotateCw;
  if (maneuver.includes('LEFT')) return CornerUpLeft;
  if (maneuver.includes('RIGHT')) return CornerUpRight;
  if (maneuver === 'MERGE') return Merge;
  if (maneuver === 'FERRY' || maneuver === 'FERRY_TRAIN') return Ship;
  return ArrowUp;
}
