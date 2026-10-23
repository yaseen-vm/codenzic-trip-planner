import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CircleCheck, Lock, Mail, User } from 'lucide-react-native';
import AppModal from '../../components/AppModal';
import PrimaryButton from '../../components/PrimaryButton';
import TextField from '../../components/TextField';
import { AUTH_STRINGS } from '../../constants/strings';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { hasErrors, isValidEmail, validateSignup } from '../../utils/auth';

const SUCCESS_ICON_SIZE = 48;

interface ModalProps {
  visible: boolean;
  onClose: () => void;
}

function SuccessMessage({ text }: { text: string }) {
  return (
    <View style={styles.success}>
      <CircleCheck size={SUCCESS_ICON_SIZE} color={COLORS.orange} />
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
      title={AUTH_STRINGS.forgotTitle}
      subtitle={sent ? undefined : AUTH_STRINGS.forgotSubtitle}
    >
      {sent ? (
        <>
          <SuccessMessage text={AUTH_STRINGS.forgotSuccess(email.trim())} />
          <PrimaryButton label={AUTH_STRINGS.backToLogin} onPress={close} />
        </>
      ) : (
        <View style={styles.form}>
          <TextField
            label={AUTH_STRINGS.emailLabel}
            icon={Mail}
            value={email}
            onChangeText={setEmail}
            placeholder={AUTH_STRINGS.emailPlaceholder}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyType="done"
            onSubmitEditing={submit}
            error={submitted && !isValidEmail(email) ? AUTH_STRINGS.invalidEmail : undefined}
          />
          <PrimaryButton label={AUTH_STRINGS.sendResetLink} onPress={submit} />
        </View>
      )}
    </AppModal>
  );
}

interface CreateAccountModalProps extends ModalProps {
  onCreated: () => void;
}

const EMPTY_SIGNUP = { name: '', email: '', password: '', confirm: '' };

// Demo only: validates the form and reports success without creating a real account.
export function CreateAccountModal({ visible, onClose, onCreated }: CreateAccountModalProps) {
  const [values, setValues] = useState(EMPTY_SIGNUP);
  const [submitted, setSubmitted] = useState(false);
  const [created, setCreated] = useState(false);

  const errors = validateSignup(values);
  const show = (key: keyof typeof errors) => (submitted ? errors[key] : undefined);
  const setField = (key: keyof typeof values) => (text: string) =>
    setValues((current) => ({ ...current, [key]: text }));

  const reset = () => {
    setValues(EMPTY_SIGNUP);
    setSubmitted(false);
    setCreated(false);
  };

  const close = () => {
    onClose();
    reset();
  };

  const submit = () => {
    setSubmitted(true);
    if (!hasErrors(errors)) setCreated(true);
  };

  const finish = () => {
    reset();
    onCreated();
  };

  return (
    <AppModal
      visible={visible}
      onClose={close}
      title={created ? AUTH_STRINGS.signupDoneTitle : AUTH_STRINGS.signupTitle}
      subtitle={created ? undefined : AUTH_STRINGS.signupSubtitle}
    >
      {created ? (
        <>
          <SuccessMessage text={AUTH_STRINGS.signupSuccess(values.name.trim())} />
          <PrimaryButton label={AUTH_STRINGS.continueInDemo} onPress={finish} />
        </>
      ) : (
        <View style={styles.form}>
          <TextField
            label={AUTH_STRINGS.fullNameLabel}
            icon={User}
            value={values.name}
            onChangeText={setField('name')}
            placeholder={AUTH_STRINGS.fullNamePlaceholder}
            autoCapitalize="words"
            returnKeyType="next"
            error={show('name')}
          />
          <TextField
            label={AUTH_STRINGS.emailLabel}
            icon={Mail}
            value={values.email}
            onChangeText={setField('email')}
            placeholder={AUTH_STRINGS.emailPlaceholder}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyType="next"
            error={show('email')}
          />
          <TextField
            label={AUTH_STRINGS.passwordLabel}
            icon={Lock}
            password
            value={values.password}
            onChangeText={setField('password')}
            placeholder={AUTH_STRINGS.signupPasswordPlaceholder}
            autoCapitalize="none"
            returnKeyType="next"
            error={show('password')}
          />
          <TextField
            label={AUTH_STRINGS.confirmPasswordLabel}
            icon={Lock}
            password
            value={values.confirm}
            onChangeText={setField('confirm')}
            placeholder={AUTH_STRINGS.confirmPasswordPlaceholder}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={submit}
            error={show('confirm')}
          />
          <PrimaryButton label={AUTH_STRINGS.createAccount} onPress={submit} />
        </View>
      )}
    </AppModal>
  );
}

const styles = StyleSheet.create({
  form: { gap: SPACING.lg },
  success: {
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  successText: {
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});
