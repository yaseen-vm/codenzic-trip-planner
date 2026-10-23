import { AUTH_STRINGS } from '../constants/strings';

export const MIN_PASSWORD_LENGTH = 6;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ErrorMap<K extends string> = Record<K, string | undefined>;

export const isValidEmail = (value: string): boolean => EMAIL_PATTERN.test(value.trim());

const emailError = (email: string) => (isValidEmail(email) ? undefined : AUTH_STRINGS.invalidEmail);
const passwordError = (password: string) =>
  password.length >= MIN_PASSWORD_LENGTH
    ? undefined
    : AUTH_STRINGS.passwordTooShort(MIN_PASSWORD_LENGTH);

export function validateLogin(input: {
  email: string;
  password: string;
}): ErrorMap<'email' | 'password'> {
  return { email: emailError(input.email), password: passwordError(input.password) };
}

export function validateSignup(input: {
  name: string;
  email: string;
  password: string;
  confirm: string;
}): ErrorMap<'name' | 'email' | 'password' | 'confirm'> {
  return {
    name: input.name.trim() ? undefined : AUTH_STRINGS.enterName,
    email: emailError(input.email),
    password: passwordError(input.password),
    confirm: input.confirm === input.password ? undefined : AUTH_STRINGS.passwordsMismatch,
  };
}

export const hasErrors = (errors: Record<string, string | undefined>): boolean =>
  Object.values(errors).some(Boolean);
