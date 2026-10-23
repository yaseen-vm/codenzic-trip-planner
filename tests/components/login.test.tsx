import { fireEvent, render, screen } from '@testing-library/react-native';
import LoginScreen from '../../app/login';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);

beforeEach(() => mockPush.mockClear());

const lastEmailField = () => screen.getAllByPlaceholderText('you@example.com').at(-1)!;

test('labels the screen as a demo up front', async () => {
  await render(<LoginScreen />);
  expect(screen.getByText(/Demo mode: no account is checked or created/)).toBeTruthy();
});

test('rejects an invalid email and short password without navigating', async () => {
  await render(<LoginScreen />);
  await fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'nope');
  await fireEvent.changeText(screen.getByPlaceholderText('Enter your password'), '123');
  await fireEvent.press(screen.getByText('Log in'));
  expect(screen.getByText('Enter a valid email address.')).toBeTruthy();
  expect(screen.getByText('Password must be at least 6 characters.')).toBeTruthy();
  expect(mockPush).not.toHaveBeenCalled();
});

test('continues to location selection for a well-formed demo login', async () => {
  await render(<LoginScreen />);
  await fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'a@b.co');
  await fireEvent.changeText(screen.getByPlaceholderText('Enter your password'), '123456');
  await fireEvent.press(screen.getByText('Log in'));
  expect(mockPush).toHaveBeenCalledWith('/locations');
});

test('forgot-password flow rejects a bad email and never claims an email was sent', async () => {
  await render(<LoginScreen />);
  await fireEvent.press(screen.getByText('Forgot password?'));
  await fireEvent.press(screen.getByText('Send reset link'));
  expect(screen.getByText('Enter a valid email address.')).toBeTruthy();
  await fireEvent.changeText(lastEmailField(), 'a@b.co');
  await fireEvent.press(screen.getByText('Send reset link'));
  expect(screen.getByText(/No reset email was sent/)).toBeTruthy();
  expect(screen.queryByText(/is on its way/)).toBeNull();
});

test('create-account flow validates, then reports demo completion rather than a real account', async () => {
  await render(<LoginScreen />);
  await fireEvent.press(screen.getByText('Create an account'));
  await fireEvent.press(screen.getByText('Create account'));
  expect(screen.getByText('Enter your name.')).toBeTruthy();

  await fireEvent.changeText(screen.getByPlaceholderText('Your name'), 'Ann');
  await fireEvent.changeText(lastEmailField(), 'a@b.co');
  await fireEvent.changeText(screen.getByPlaceholderText('At least 6 characters'), '123456');
  await fireEvent.changeText(screen.getByPlaceholderText('Re-enter your password'), '654321');
  await fireEvent.press(screen.getByText('Create account'));
  expect(screen.getByText('Passwords do not match.')).toBeTruthy();

  await fireEvent.changeText(screen.getByPlaceholderText('Re-enter your password'), '123456');
  await fireEvent.press(screen.getByText('Create account'));
  expect(screen.getByText(/No account was created/)).toBeTruthy();
  expect(screen.queryByText(/Your account is ready/)).toBeNull();
  expect(screen.queryByText('Account created')).toBeNull();
});
