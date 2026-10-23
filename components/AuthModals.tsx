import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CircleCheck, Lock, Mail, User } from 'lucide-react-native';
import AppModal from './AppModal';
import PrimaryButton from './PrimaryButton';
import TextField from './TextField';
import { COLORS, FONTS } from '../constants/theme';

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

interface ModalProps {
  visible: boolean;
  onClose: () => void;
}

function SuccessMessage({ text }: { text: string }) {
  return (
    <View style={styles.success}>
      <CircleCheck size={48} color={COLORS.orange} />
      <Text style={styles.successText}>{text}</Text>
    </View>
  );
}

// Demo only: no request is sent; the flow shows what a real reset would look like.
export function ForgotPasswordModal({ visible, onClose }: ModalProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);

  const close = () => {
    onClose();
    setEmail('');
    setSubmitted(false);
    setSent(false);
  };

  const submit = () => {
    setSubmitted(true);
    if (isValidEmail(email)) setSent(true);
  };

  return (
    <AppModal
      visible={visible}
      onClose={close}
      title="Forgot password?"
      subtitle={
        sent ? undefined : 'Demo only — no reset email is sent. Enter an email to preview the flow.'
      }
    >
      {sent ? (
        <>
          <SuccessMessage
            text={'Demo complete for ' + email.trim() + '. No reset email was sent.'}
          />
          <PrimaryButton label="Back to log in" onPress={close} />
        </>
      ) : (
        <View style={styles.form}>
          <TextField
            label="Email"
            icon={Mail}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyType="done"
            onSubmitEditing={submit}
            error={submitted && !isValidEmail(email) ? 'Enter a valid email address.' : undefined}
          />
          <PrimaryButton label="Send reset link" onPress={submit} />
        </View>
      )}
    </AppModal>
  );
}

interface CreateAccountModalProps extends ModalProps {
  onCreated: () => void;
}

// Demo only: validates the form and reports success without creating a real account.
export function CreateAccountModal({ visible, onClose, onCreated }: CreateAccountModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [created, setCreated] = useState(false);

  const errors = {
    name: name.trim() ? undefined : 'Enter your name.',
    email: isValidEmail(email) ? undefined : 'Enter a valid email address.',
    password: password.length >= 6 ? undefined : 'Password must be at least 6 characters.',
    confirm: confirm === password ? undefined : 'Passwords do not match.',
  };
  const show = (key: keyof typeof errors) => (submitted ? errors[key] : undefined);

  const reset = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirm('');
    setSubmitted(false);
    setCreated(false);
  };

  const close = () => {
    onClose();
    reset();
  };

  const submit = () => {
    setSubmitted(true);
    if (Object.values(errors).every((error) => !error)) setCreated(true);
  };

  const finish = () => {
    reset();
    onCreated();
  };

  return (
    <AppModal
      visible={visible}
      onClose={close}
      title={created ? 'Account created' : 'Create an account'}
      subtitle={created ? undefined : 'Demo only — this form does not create a real account.'}
    >
      {created ? (
        <>
          <SuccessMessage text={'Demo complete, ' + name.trim() + '. No account was created.'} />
          <PrimaryButton label="Start planning" onPress={finish} />
        </>
      ) : (
        <View style={styles.form}>
          <TextField
            label="Full name"
            icon={User}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            autoCapitalize="words"
            returnKeyType="next"
            error={show('name')}
          />
          <TextField
            label="Email"
            icon={Mail}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyType="next"
            error={show('email')}
          />
          <TextField
            label="Password"
            icon={Lock}
            password
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            autoCapitalize="none"
            returnKeyType="next"
            error={show('password')}
          />
          <TextField
            label="Confirm password"
            icon={Lock}
            password
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Re-enter your password"
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={submit}
            error={show('confirm')}
          />
          <PrimaryButton label="Create account" onPress={submit} />
        </View>
      )}
    </AppModal>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  success: { alignItems: 'center', gap: 12, paddingVertical: 12, marginBottom: 12 },
  successText: {
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});
