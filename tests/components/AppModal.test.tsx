import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import AppModal from '../../src/components/AppModal';

const renderModal = (props: Partial<React.ComponentProps<typeof AppModal>> = {}) =>
  render(
    <AppModal visible title="Title" onClose={jest.fn()} {...props}>
      <Text>Body</Text>
    </AppModal>,
  );

test('renders nothing while hidden', async () => {
  await renderModal({ visible: false });
  expect(screen.queryByText('Title')).toBeNull();
});

test('shows the title, children and optional subtitle', async () => {
  await renderModal({ subtitle: 'Sub' });
  expect(screen.getByText('Title')).toBeTruthy();
  expect(screen.getByText('Sub')).toBeTruthy();
  expect(screen.getByText('Body')).toBeTruthy();
});

test('omits the subtitle when none is given', async () => {
  await renderModal();
  expect(screen.queryByText('Sub')).toBeNull();
});

test('the close button and the backdrop both close the dialog', async () => {
  const onClose = jest.fn();
  await renderModal({ onClose });

  await fireEvent.press(screen.getByLabelText('Close'));
  await fireEvent.press(screen.getByLabelText('Close dialog'));
  expect(onClose).toHaveBeenCalledTimes(2);
});

test('tapping the card content does not close the dialog', async () => {
  const onClose = jest.fn();
  await renderModal({ onClose });

  await fireEvent.press(screen.getByText('Body'));
  expect(onClose).not.toHaveBeenCalled();
});
