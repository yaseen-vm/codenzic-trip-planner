import type { Coordinate } from '../../types/geo';

export interface MapPickerProps {
  visible: boolean;
  title: string;
  initialCenter: Coordinate;
  onCancel: () => void;
  onConfirm: (coordinate: Coordinate) => void;
}
