import {
  hasErrors,
  isValidEmail,
  MIN_PASSWORD_LENGTH,
  validateLogin,
  validateSignup,
} from '../../src/utils/auth';

describe('isValidEmail', () => {
  test.each(['a@b.co', ' a@b.co ', 'first.last+tag@sub.domain.org'])('accepts %p', (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  test.each(['', '   ', 'abc', 'a@b', '@b.co', 'a b@c.de', 'a@@b.co'])('rejects %p', (email) => {
    expect(isValidEmail(email)).toBe(false);
  });
});

describe('validateLogin', () => {
  const valid = { email: 'a@b.co', password: '1'.repeat(MIN_PASSWORD_LENGTH) };

  test('has no errors for a valid email and a password of the minimum length', () => {
    expect(hasErrors(validateLogin(valid))).toBe(false);
  });

  test('flags only the email when it is malformed', () => {
    const errors = validateLogin({ ...valid, email: 'nope' });
    expect(errors.email).toBe('Enter a valid email address.');
    expect(errors.password).toBeUndefined();
  });

  test('flags a password one character too short', () => {
    const errors = validateLogin({ ...valid, password: '1'.repeat(MIN_PASSWORD_LENGTH - 1) });
    expect(errors.password).toBe(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    expect(errors.email).toBeUndefined();
  });
});

describe('validateSignup', () => {
  const valid = { name: 'Ann', email: 'a@b.co', password: '123456', confirm: '123456' };

  test('has no errors for a complete form', () => {
    expect(hasErrors(validateSignup(valid))).toBe(false);
  });

  test('rejects a blank or whitespace-only name', () => {
    expect(validateSignup({ ...valid, name: '' }).name).toBe('Enter your name.');
    expect(validateSignup({ ...valid, name: '  ' }).name).toBe('Enter your name.');
  });

  test('rejects an invalid email and a short password', () => {
    const errors = validateSignup({ ...valid, email: 'x', password: '123', confirm: '123' });
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
    expect(errors.confirm).toBeUndefined();
  });

  test('rejects mismatched confirmation', () => {
    expect(validateSignup({ ...valid, confirm: 'other1' }).confirm).toBe('Passwords do not match.');
  });
});

describe('hasErrors', () => {
  test('is false when every value is undefined or empty', () => {
    expect(hasErrors({})).toBe(false);
    expect(hasErrors({ a: undefined, b: '' })).toBe(false);
  });

  test('is true when any message is present', () => {
    expect(hasErrors({ a: undefined, b: 'bad' })).toBe(true);
  });
});
