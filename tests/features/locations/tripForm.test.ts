import {
  initialTripForm,
  tripFormReducer,
  validateTrip,
  type TripFormState,
} from '../../../src/features/locations/tripForm';

const home = { label: 'Home', latitude: 1, longitude: 2 };
const work = { label: 'Work', latitude: 3, longitude: 4 };

const withPlaces = (pickup = home, dropoff = work): TripFormState => ({
  pickup: { text: pickup.label, place: pickup },
  dropoff: { text: dropoff.label, place: dropoff },
  active: 'dropoff',
});

describe('tripFormReducer', () => {
  test('starts empty with the pickup field active', () => {
    expect(initialTripForm.active).toBe('pickup');
    expect(initialTripForm.pickup).toEqual({ text: '', place: null });
    expect(initialTripForm.dropoff).toEqual({ text: '', place: null });
  });

  test('focus changes only the active field', () => {
    const next = tripFormReducer(initialTripForm, { type: 'focus', field: 'dropoff' });
    expect(next.active).toBe('dropoff');
    expect(next.pickup).toBe(initialTripForm.pickup);
  });

  test('typing updates the text, activates the field and discards its committed place', () => {
    const next = tripFormReducer(withPlaces(), { type: 'type', field: 'pickup', text: 'Ho' });
    expect(next.pickup).toEqual({ text: 'Ho', place: null });
    expect(next.active).toBe('pickup');
    expect(next.dropoff.place).toEqual(work);
  });

  test('clearing empties the field and makes it active', () => {
    const next = tripFormReducer(withPlaces(), { type: 'clear', field: 'pickup' });
    expect(next.pickup).toEqual({ text: '', place: null });
    expect(next.active).toBe('pickup');
    expect(next.dropoff.place).toEqual(work);
  });

  test('choosing a place fills the active pickup and moves on to the drop-off', () => {
    const next = tripFormReducer(initialTripForm, { type: 'choose', place: home });
    expect(next.pickup).toEqual({ text: 'Home', place: home });
    expect(next.active).toBe('dropoff');
  });

  test('choosing a place fills the active drop-off and stays there', () => {
    const start = tripFormReducer(initialTripForm, { type: 'focus', field: 'dropoff' });
    const next = tripFormReducer(start, { type: 'choose', place: work });
    expect(next.dropoff).toEqual({ text: 'Work', place: work });
    expect(next.active).toBe('dropoff');
    expect(next.pickup.place).toBeNull();
  });

  test('swap exchanges text and places but leaves the active field alone', () => {
    const next = tripFormReducer(withPlaces(), { type: 'swap' });
    expect(next.pickup.place).toEqual(work);
    expect(next.dropoff.place).toEqual(home);
    expect(next.pickup.text).toBe('Work');
    expect(next.active).toBe('dropoff');
  });

  test('swapping twice restores the original form', () => {
    const form = withPlaces();
    const twice = tripFormReducer(tripFormReducer(form, { type: 'swap' }), { type: 'swap' });
    expect(twice).toEqual(form);
  });

  test('does not mutate the previous state', () => {
    const form = withPlaces();
    const snapshot = JSON.parse(JSON.stringify(form));
    tripFormReducer(form, { type: 'swap' });
    tripFormReducer(form, { type: 'clear', field: 'pickup' });
    expect(form).toEqual(snapshot);
  });
});

describe('validateTrip', () => {
  test('is incomplete until both places are committed', () => {
    expect(validateTrip(initialTripForm)).toBe('incomplete');
    const pickupOnly = tripFormReducer(initialTripForm, { type: 'choose', place: home });
    expect(validateTrip(pickupOnly)).toBe('incomplete');
  });

  test('typed text without a committed place is still incomplete', () => {
    const typed = tripFormReducer(withPlaces(), { type: 'type', field: 'dropoff', text: 'Wor' });
    expect(validateTrip(typed)).toBe('incomplete');
  });

  test('rejects identical coordinates even when the labels differ', () => {
    const twin = { ...home, label: 'Home (copy)' };
    expect(validateTrip(withPlaces(home, twin))).toBe('same-location');
  });

  test('accepts two distinct places', () => {
    expect(validateTrip(withPlaces())).toBe('ok');
  });

  test('accepts places that differ in only one coordinate', () => {
    expect(validateTrip(withPlaces(home, { ...home, longitude: 9 }))).toBe('ok');
  });
});
