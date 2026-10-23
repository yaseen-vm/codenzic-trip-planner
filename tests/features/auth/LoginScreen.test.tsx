import { fireEvent, render, screen } from '@testing-library/react-native';
import LoginScreen from '../../../src/app/login';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);

beforeEach(() => mockPush.mockClear());

const lastEmailField = () => screen.getAllByPlaceholderText('you@example.com').at(-1)!;
const fillLogin = async (email: string, password: string) => {
  await fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), email);
  await fireEvent.changeText(screen.getByPlaceholderText('Enter your password'), password);
};

test('matches the Figma sign-up prompt', async () => {
  await render(<LoginScreen />);
  expect(screen.getByText(/New to Wayfare\?/)).toBeTruthy();
});

describe('log in', () => {
  test('shows no errors before the first submit', async () => {
    await render(<LoginScreen />);
    await fillLogin('nope', '1');
    expect(screen.queryByText('Enter a valid email address.')).toBeNull();
  });

  test('rejects an invalid email and short password without navigating', async () => {
    await render(<LoginScreen />);
    await fillLogin('nope', '123');
    await fireEvent.press(screen.getByText('Log in'));

    expect(screen.getByText('Enter a valid email address.')).toBeTruthy();
    expect(screen.getByText('Password must be at least 6 characters.')).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('rejects a valid email with a short password', async () => {
    await render(<LoginScreen />);
    await fillLogin('a@b.co', '12345');
    await fireEvent.press(screen.getByText('Log in'));

    expect(screen.queryByText('Enter a valid email address.')).toBeNull();
    expect(screen.getByText('Password must be at least 6 characters.')).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('continues to location selection for a well-formed demo login', async () => {
    await render(<LoginScreen />);
    await fillLogin('a@b.co', '123456');
    await fireEvent.press(screen.getByText('Log in'));
    expect(mockPush).toHaveBeenCalledWith('/locations');
  });

  test('submitting from the keyboard behaves like pressing the button', async () => {
    await render(<LoginScreen />);
    await fillLogin('a@b.co', '123456');
    await fireEvent(screen.getByPlaceholderText('Enter your password'), 'submitEditing');
    expect(mockPush).toHaveBeenCalledWith('/locations');
  });

  test('clears the errors once the input is corrected', async () => {
    await render(<LoginScreen />);
    await fillLogin('nope', '123');
    await fireEvent.press(screen.getByText('Log in'));
    await fillLogin('a@b.co', '123456');
    expect(screen.queryByText('Enter a valid email address.')).toBeNull();
  });
});

describe('forgot password', () => {
  test('rejects a bad email and never claims an email was sent', async () => {
    await render(<LoginScreen />);
    await fireEvent.press(screen.getByText('Forgot password?'));
    await fireEvent.press(screen.getByText('Send reset link'));
    expect(screen.getByText('Enter a valid email address.')).toBeTruthy();

    await fireEvent.changeText(lastEmailField(), 'a@b.co');
    await fireEvent.press(screen.getByText('Send reset link'));
    expect(screen.getByText(/No reset email was sent/)).toBeTruthy();
    expect(screen.queryByText(/is on its way/)).toBeNull();
  });

  test('"Back to log in" closes the dialog and the form starts fresh next time', async () => {
    await render(<LoginScreen />);
    await fireEvent.press(screen.getByText('Forgot password?'));
    await fireEvent.changeText(lastEmailField(), 'a@b.co');
    await fireEvent.press(screen.getByText('Send reset link'));
    await fireEvent.press(screen.getByText('Back to log in'));
    expect(screen.queryByText('Forgot password? (demo)')).toBeNull();

    await fireEvent.press(screen.getByText('Forgot password?'));
    expect(screen.getByText('Send reset link')).toBeTruthy();
    expect(lastEmailField().props.value).toBe('');
  });

  test('closing with the X discards a partly filled form', async () => {
    await render(<LoginScreen />);
    await fireEvent.press(screen.getByText('Forgot password?'));
    await fireEvent.changeText(lastEmailField(), 'half@typed');
    await fireEvent.press(screen.getByLabelText('Close'));

    await fireEvent.press(screen.getByText('Forgot password?'));
    expect(lastEmailField().props.value).toBe('');
  });
});

describe('create account', () => {
  const fillSignup = async (confirm: string) => {
    await fireEvent.changeText(screen.getByPlaceholderText('Your name'), 'Ann');
    await fireEvent.changeText(lastEmailField(), 'a@b.co');
    await fireEvent.changeText(screen.getByPlaceholderText('At least 6 characters'), '123456');
    await fireEvent.changeText(screen.getByPlaceholderText('Re-enter your password'), confirm);
  };

  test('validates, then reports demo completion rather than a real account', async () => {
    await render(<LoginScreen />);
    await fireEvent.press(screen.getByText('Create an account'));
    await fireEvent.press(screen.getByText('Create account'));
    expect(screen.getByText('Enter your name.')).toBeTruthy();

    await fillSignup('654321');
    await fireEvent.press(screen.getByText('Create account'));
    expect(screen.getByText('Passwords do not match.')).toBeTruthy();

    await fireEvent.changeText(screen.getByPlaceholderText('Re-enter your password'), '123456');
    await fireEvent.press(screen.getByText('Create account'));
    expect(screen.getByText(/Demo complete, Ann\. No account was created\./)).toBeTruthy();
    expect(screen.queryByText(/Your account is ready/)).toBeNull();
    expect(screen.queryByText('Account created')).toBeNull();
  });

  test('continuing in demo mode closes the dialog and goes to location selection', async () => {
    await render(<LoginScreen />);
    await fireEvent.press(screen.getByText('Create an account'));
    await fillSignup('123456');
    await fireEvent.press(screen.getByText('Create account'));
    await fireEvent.press(screen.getByText('Continue in demo mode'));

    expect(mockPush).toHaveBeenCalledWith('/locations');
    expect(screen.queryByText('Demo sign-up complete')).toBeNull();
  });

  test('closing the dialog resets the form', async () => {
    await render(<LoginScreen />);
    await fireEvent.press(screen.getByText('Create an account'));
    await fireEvent.changeText(screen.getByPlaceholderText('Your name'), 'Ann');
    await fireEvent.press(screen.getByLabelText('Close'));

    await fireEvent.press(screen.getByText('Create an account'));
    expect(screen.getByPlaceholderText('Your name').props.value).toBe('');
  });

  test('submitting from the last field behaves like pressing the button', async () => {
    await render(<LoginScreen />);
    await fireEvent.press(screen.getByText('Create an account'));
    await fillSignup('123456');
    await fireEvent(screen.getByPlaceholderText('Re-enter your password'), 'submitEditing');
    expect(screen.getByText('Demo sign-up complete')).toBeTruthy();
  });
});
