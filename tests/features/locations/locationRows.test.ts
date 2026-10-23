import { MapPin } from 'lucide-react-native';
import { SAVED_PLACES } from '../../../src/constants/savedPlaces';
import { buildRows, filterSavedPlaces } from '../../../src/features/locations/locationRows';

describe('filterSavedPlaces', () => {
  test('returns every place for an empty query', () => {
    expect(filterSavedPlaces(SAVED_PLACES, '')).toEqual(SAVED_PLACES);
  });

  test('matches on the place name', () => {
    expect(filterSavedPlaces(SAVED_PLACES, 'airport').map((p) => p.id)).toEqual(['hamad-airport']);
  });

  test('matches on the address', () => {
    expect(filterSavedPlaces(SAVED_PLACES, 'corniche').map((p) => p.id)).toEqual([
      'corniche-ferry',
    ]);
  });

  test('returns nothing when nothing matches', () => {
    expect(filterSavedPlaces(SAVED_PLACES, 'zzz')).toEqual([]);
  });

  test('does not return the input array itself', () => {
    expect(filterSavedPlaces(SAVED_PLACES, '')).not.toBe(SAVED_PLACES);
  });
});

describe('buildRows', () => {
  const suggestion = { placeId: 'p1', description: 'Kochi, Kerala, India' };

  test('prefers live suggestions over saved places', () => {
    const rows = buildRows([suggestion], SAVED_PLACES);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      key: 'p1',
      title: 'Kochi',
      subtitle: 'Kerala, India',
      icon: MapPin,
      item: { kind: 'suggestion', suggestion },
    });
  });

  test('leaves the subtitle undefined when the description has one part', () => {
    const [row] = buildRows([{ placeId: 'p2', description: 'Kochi' }], []);
    expect(row?.title).toBe('Kochi');
    expect(row?.subtitle).toBeUndefined();
  });

  test('falls back to saved places, each with its own icon', () => {
    const rows = buildRows([], SAVED_PLACES);
    expect(rows.map((r) => r.key)).toEqual(SAVED_PLACES.map((p) => p.id));
    expect(rows[0]).toMatchObject({ title: 'Home', item: { kind: 'saved' } });
    expect(new Set(rows.map((r) => r.icon)).size).toBe(SAVED_PLACES.length);
  });

  test('returns no rows when there is nothing to show', () => {
    expect(buildRows([], [])).toEqual([]);
  });
});
