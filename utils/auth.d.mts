export const MIN_PASSWORD_LENGTH: number;
export function isValidEmail(value: string): boolean;
type Errors<K extends string> = Record<K, string | undefined>;
export function validateLogin(input: {
  email: string;
  password: string;
}): Errors<'email' | 'password'>;
export function validateSignup(input: {
  name: string;
  email: string;
  password: string;
  confirm: string;
}): Errors<'name' | 'email' | 'password' | 'confirm'>;
export function hasErrors(errors: Record<string, string | undefined>): boolean;
