import { COLORS } from './theme';

// Muted beige/blue basemap from the design; satellite mode ignores it.
const MAP_COLORS = {
  land: '#ECE7DD',
  labelFill: COLORS.muted,
  labelStroke: COLORS.background,
  road: COLORS.white,
  water: '#9FC4D8',
  park: '#DDE5D3',
} as const;

export const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: MAP_COLORS.land }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: MAP_COLORS.labelFill }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: MAP_COLORS.labelStroke }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: MAP_COLORS.road }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: MAP_COLORS.water }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: MAP_COLORS.park }, { visibility: 'on' }],
  },
];
