import { createSessionToken } from '../../src/utils/sessionToken';

describe('createSessionToken', () => {
  test('has a timestamp-and-random shape', () => {
    expect(createSessionToken()).toMatch(/^\d+-[a-z0-9]+$/);
  });

  test('returns a different token on each call', () => {
    const tokens = new Set(Array.from({ length: 50 }, createSessionToken));
    expect(tokens.size).toBe(50);
  });
});
