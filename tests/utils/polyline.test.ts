import { decodePolyline } from '../../src/utils/polyline';

describe('decodePolyline', () => {
  test('decodes the standard encoded polyline example', () => {
    expect(decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@')).toEqual([
      { latitude: 38.5, longitude: -120.2 },
      { latitude: 40.7, longitude: -120.95 },
      { latitude: 43.252, longitude: -126.453 },
    ]);
  });

  test('returns an empty list for an empty route', () => {
    expect(decodePolyline('')).toEqual([]);
  });

  test('rejects a polyline truncated mid-component', () => {
    expect(() => decodePolyline('_')).toThrow('Invalid encoded polyline');
  });

  test('rejects characters outside the encoding alphabet', () => {
    expect(() => decodePolyline('~~~~~~~~~~')).toThrow('Invalid encoded polyline');
    expect(() => decodePolyline(' ')).toThrow('Invalid encoded polyline');
  });

  test('rejects a latitude with no matching longitude', () => {
    expect(() => decodePolyline('_p~iF')).toThrow('Invalid encoded polyline');
  });

  test('rejects non-string input', () => {
    expect(() => decodePolyline(null as unknown as string)).toThrow('must be a string');
  });
});
