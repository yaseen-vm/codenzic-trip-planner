import { areSameCoordinate, parseCoordinate } from '../../src/utils/coordinates';

describe('parseCoordinate', () => {
  test('parses ordinary coordinates', () => {
    expect(parseCoordinate('9.9312', '76.2673')).toEqual({ latitude: 9.9312, longitude: 76.2673 });
  });

  test('preserves valid zero coordinates', () => {
    expect(parseCoordinate('0', '0')).toEqual({ latitude: 0, longitude: 0 });
  });

  test('accepts the inclusive latitude and longitude boundaries', () => {
    expect(parseCoordinate('-90', '-180')).toEqual({ latitude: -90, longitude: -180 });
    expect(parseCoordinate('90', '180')).toEqual({ latitude: 90, longitude: 180 });
  });

  test('trims whitespace and accepts explicit signs and leading-dot decimals', () => {
    expect(parseCoordinate(' -9.5 ', '+.5')).toEqual({ latitude: -9.5, longitude: 0.5 });
  });

  test.each([
    [undefined, '76'],
    ['9', undefined],
    ['', '76'],
    ['9', '  '],
    [null, '76'],
    [['9'], '76'],
  ])('rejects missing, blank or non-string input (%p, %p)', (lat, lng) => {
    expect(parseCoordinate(lat, lng)).toBeNull();
  });

  test.each([
    ['NaN', '76'],
    ['Infinity', '76'],
    ['90.01', '76'],
    ['-90.01', '76'],
    ['9', '180.01'],
    ['9', '-180.01'],
  ])('rejects non-finite or out-of-range values (%p, %p)', (lat, lng) => {
    expect(parseCoordinate(lat, lng)).toBeNull();
  });

  test.each([
    ['0x10', '76'],
    ['1e1', '76'],
    ['9', '7 6'],
    ['9', '.'],
  ])('rejects forms Number() would accept or mis-parse (%p, %p)', (lat, lng) => {
    expect(parseCoordinate(lat, lng)).toBeNull();
  });
});

describe('areSameCoordinate', () => {
  test('is true only when both components match exactly', () => {
    const a = { latitude: 1, longitude: 2 };
    expect(areSameCoordinate(a, { ...a })).toBe(true);
    expect(areSameCoordinate(a, { latitude: 1, longitude: 3 })).toBe(false);
    expect(areSameCoordinate(a, { latitude: 2, longitude: 2 })).toBe(false);
  });
});
