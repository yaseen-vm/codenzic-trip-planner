export const MIN_PASSWORD_LENGTH = 6;

export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export function validateLogin({ email, password }) {
  return {
    email: isValidEmail(email) ? undefined : 'Enter a valid email address.',
    password:
      password.length >= MIN_PASSWORD_LENGTH
        ? undefined
        : 'Password must be at least ' + MIN_PASSWORD_LENGTH + ' characters.',
  };
}

export function validateSignup({ name, email, password, confirm }) {
  return {
    name: name.trim() ? undefined : 'Enter your name.',
    email: isValidEmail(email) ? undefined : 'Enter a valid email address.',
    password:
      password.length >= MIN_PASSWORD_LENGTH
        ? undefined
        : 'Password must be at least ' + MIN_PASSWORD_LENGTH + ' characters.',
    confirm: confirm === password ? undefined : 'Passwords do not match.',
  };
}

export const hasErrors = (errors) => Object.values(errors).some(Boolean);
