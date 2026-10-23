import type { SelectedPlace } from '../../types/places';
import { areSameCoordinate } from '../../utils/coordinates';

export type FieldKey = 'pickup' | 'dropoff';

type FieldState = { text: string; place: SelectedPlace | null };

export type TripFormState = Record<FieldKey, FieldState> & { active: FieldKey };

export type TripFormAction =
  | { type: 'focus'; field: FieldKey }
  | { type: 'type'; field: FieldKey; text: string }
  | { type: 'clear'; field: FieldKey }
  | { type: 'choose'; place: SelectedPlace }
  | { type: 'swap' };

export type TripValidation = 'ok' | 'incomplete' | 'same-location';

const EMPTY_FIELD: FieldState = { text: '', place: null };

export const initialTripForm: TripFormState = {
  pickup: EMPTY_FIELD,
  dropoff: EMPTY_FIELD,
  active: 'pickup',
};

/** Picking the pickup moves focus on to the drop-off; picking the drop-off ends the flow. */
const nextField = (field: FieldKey): FieldKey => (field === 'pickup' ? 'dropoff' : field);

export function tripFormReducer(state: TripFormState, action: TripFormAction): TripFormState {
  switch (action.type) {
    case 'focus':
      return { ...state, active: action.field };
    case 'type':
      // Typing invalidates any previously committed place for that field.
      return { ...state, [action.field]: { text: action.text, place: null }, active: action.field };
    case 'clear':
      return { ...state, [action.field]: EMPTY_FIELD, active: action.field };
    case 'choose':
      return {
        ...state,
        [state.active]: { text: action.place.label, place: action.place },
        active: nextField(state.active),
      };
    case 'swap':
      return { ...state, pickup: state.dropoff, dropoff: state.pickup };
  }
}

export function validateTrip({ pickup, dropoff }: TripFormState): TripValidation {
  if (!pickup.place || !dropoff.place) return 'incomplete';
  return areSameCoordinate(pickup.place, dropoff.place) ? 'same-location' : 'ok';
}
