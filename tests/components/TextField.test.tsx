import { fireEvent, render, screen } from '@testing-library/react-native';
import { Mail } from 'lucide-react-native';
import TextField from '../../src/components/TextField';

test('renders the label and forwards input props', async () => {
  const onChangeText = jest.fn();
  await render(
    <TextField label="Email" placeholder="you@example.com" value="" onChangeText={onChangeText} />,
  );

  expect(screen.getByText('Email')).toBeTruthy();
  await fireEvent.changeText(screen.getByLabelText('Email'), 'a@b.co');
  expect(onChangeText).toHaveBeenCalledWith('a@b.co');
});

test('shows the error message only when one is given', async () => {
  await render(<TextField label="Email" value="" onChangeText={jest.fn()} />);
  expect(screen.queryByText('Required')).toBeNull();

  await screen.rerender(
    <TextField label="Email" value="" onChangeText={jest.fn()} error="Required" />,
  );
  expect(screen.getByText('Required')).toBeTruthy();
});

test('renders without an icon and with one', async () => {
  await render(<TextField label="Email" value="" onChangeText={jest.fn()} icon={Mail} />);
  expect(screen.getByLabelText('Email')).toBeTruthy();
});

describe('password mode', () => {
  test('hides the text by default and has a toggle', async () => {
    await render(<TextField label="Password" password value="secret" onChangeText={jest.fn()} />);

    expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(true);
    expect(screen.getByLabelText('Show password')).toBeTruthy();
  });

  test('reveals and re-hides the text via the toggle', async () => {
    await render(<TextField label="Password" password value="secret" onChangeText={jest.fn()} />);

    await fireEvent.press(screen.getByLabelText('Show password'));
    expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(false);

    await fireEvent.press(screen.getByLabelText('Hide password'));
    expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(true);
  });

  test('a plain field has no toggle and is not secure', async () => {
    await render(<TextField label="Email" value="" onChangeText={jest.fn()} />);
    expect(screen.queryByLabelText('Show password')).toBeNull();
    expect(screen.getByLabelText('Email').props.secureTextEntry).toBeFalsy();
  });
});
