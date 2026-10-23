export type PickerCoordinate = { latitude: number; longitude: number };

export interface MapPickerProps {
  visible: boolean;
  title: string;
  initialCenter: PickerCoordinate;
  onCancel: () => void;
  onConfirm: (coordinate: PickerCoordinate) => void;
}
