import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandMark from '../../components/BrandMark';
import NoticeBanner from '../../components/NoticeBanner';
import PrimaryButton from '../../components/PrimaryButton';
import TextField from '../../components/TextField';
import { AUTH_STRINGS } from '../../constants/strings';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { hasErrors, validateLogin } from '../../utils/auth';
import { CreateAccountModal, ForgotPasswordModal } from './AuthModals';

const LOCATIONS_ROUTE = '/locations';
const MIN_FOOTER_INSET = SPACING.lg;
const CONTENT_TOP_PADDING = 40;

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const errors = validateLogin({ email, password });

  function handleLogin() {
    setSubmitted(true);
    if (hasErrors(errors)) return;
    router.push(LOCATIONS_ROUTE);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.brand}>
              <BrandMark />
            </View>

            <Text style={styles.heading}>{AUTH_STRINGS.loginHeading}</Text>
            <Text style={styles.subtitle}>{AUTH_STRINGS.loginSubtitle}</Text>

            <View style={styles.demoBanner}>
              <NoticeBanner text={AUTH_STRINGS.demoBanner} alert />
            </View>

            <View style={styles.form}>
              <TextField
                label={AUTH_STRINGS.emailLabel}
                icon={Mail}
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder={AUTH_STRINGS.emailPlaceholder}
                returnKeyType="next"
                textContentType="emailAddress"
                value={email}
                error={submitted ? errors.email : undefined}
              />
              <TextField
                label={AUTH_STRINGS.passwordLabel}
                icon={Lock}
                password
                autoCapitalize="none"
                autoComplete="password"
                onChangeText={setPassword}
                placeholder={AUTH_STRINGS.passwordPlaceholder}
                returnKeyType="done"
                textContentType="password"
                value={password}
                onSubmitEditing={handleLogin}
                error={submitted ? errors.password : undefined}
              />

              <Pressable
                accessibilityRole="button"
                onPress={() => setForgotOpen(true)}
                style={styles.forgotButton}
              >
                <Text style={styles.forgotText}>{AUTH_STRINGS.forgotPassword}</Text>
              </Pressable>
            </View>
          </ScrollView>

          <View
            style={[styles.footer, { paddingBottom: Math.max(insets.bottom, MIN_FOOTER_INSET) }]}
          >
            <PrimaryButton label={AUTH_STRINGS.logIn} onPress={handleLogin} />
            <View style={styles.signupRow}>
              <Text style={styles.signupMuted}>{AUTH_STRINGS.newToApp}</Text>
              <Pressable accessibilityRole="button" onPress={() => setSignupOpen(true)} hitSlop={8}>
                <Text style={styles.signupLink}>{AUTH_STRINGS.createAccountLink}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      <ForgotPasswordModal visible={forgotOpen} onClose={() => setForgotOpen(false)} />
      <CreateAccountModal
        visible={signupOpen}
        onClose={() => setSignupOpen(false)}
        onCreated={() => {
          setSignupOpen(false);
          router.push(LOCATIONS_ROUTE);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xxl,
    paddingTop: CONTENT_TOP_PADDING,
    paddingBottom: 28,
  },
  brand: { marginBottom: 28 },
  heading: {
    color: COLORS.text,
    fontFamily: FONTS.extraBold,
    fontSize: 32,
    lineHeight: 37,
    letterSpacing: -0.8,
  },
  subtitle: {
    color: COLORS.muted,
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 24,
    marginTop: SPACING.sm,
    marginBottom: 28,
  },
  demoBanner: { marginBottom: SPACING.xl },
  form: { gap: SPACING.lg },
  forgotButton: { alignSelf: 'flex-start', marginTop: SPACING.xs, paddingVertical: 1 },
  forgotText: { color: COLORS.orange, fontFamily: FONTS.bold, fontSize: 14, lineHeight: 21 },
  footer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.lg,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
    minHeight: 21,
  },
  signupMuted: { color: COLORS.muted, fontFamily: FONTS.regular, fontSize: 14 },
  signupLink: { color: COLORS.text, fontFamily: FONTS.bold, fontSize: 14 },
});
