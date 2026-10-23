import { Lock, Mail } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useState } from 'react';
import { useRouter } from 'expo-router';
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
import { CreateAccountModal, ForgotPasswordModal, isValidEmail } from '../components/AuthModals';
import PrimaryButton from '../components/PrimaryButton';
import TextField from '../components/TextField';
import { COLORS, FONTS } from '../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const emailIsValid = isValidEmail(email);
  const emailError = submitted && !emailIsValid;
  const passwordError = submitted && password.length < 6;

  function handleLogin() {
    setSubmitted(true);
    if (!emailIsValid || password.length < 6) return;
    router.push('/locations');
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.flex}>
          <ScrollView
            contentContainerStyle={[styles.content, { paddingTop: 40 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.brandMark}>
              <Svg width={56} height={56} viewBox="0 0 56 56" accessibilityLabel="Codenzic logo">
                <Path
                  fill="none"
                  d="M17.5 36.17C17.5 34.237 19.067 32.67 21 32.67C22.933 32.67 24.5 34.237 24.5 36.17C24.5 38.103 22.933 39.67 21 39.67C19.067 39.67 17.5 38.103 17.5 36.17Z"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  stroke="white"
                />
                <Path
                  fill="none"
                  d="M24.5 36.16H34.4167C36.6718 36.16 38.5 34.3322 38.5 32.0775C38.5 29.8228 36.6718 27.995 34.4167 27.995H21.5833C19.3282 27.995 17.5 26.1672 17.5 23.9125C17.5 21.6578 19.3282 19.83 21.5833 19.83H31.5"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  stroke="white"
                />
                <Path
                  fill="none"
                  d="M31.5 19.83C31.5 17.897 33.067 16.33 35 16.33C36.933 16.33 38.5 17.897 38.5 19.83C38.5 21.763 36.933 23.33 35 23.33C33.067 23.33 31.5 21.763 31.5 19.83Z"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  stroke="white"
                />
              </Svg>
            </View>

            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Log in to plan a trip and follow your route turn by turn.
            </Text>

            <View style={styles.form}>
              <TextField
                label="Email"
                icon={Mail}
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="you@example.com"
                returnKeyType="next"
                textContentType="emailAddress"
                value={email}
                error={emailError ? 'Enter a valid email address.' : undefined}
              />
              <TextField
                label="Password"
                icon={Lock}
                password
                autoCapitalize="none"
                autoComplete="password"
                onChangeText={setPassword}
                placeholder="Enter your password"
                returnKeyType="done"
                textContentType="password"
                value={password}
                onSubmitEditing={handleLogin}
                error={passwordError ? 'Password must be at least 6 characters.' : undefined}
              />

              <Pressable
                accessibilityRole="button"
                onPress={() => setForgotOpen(true)}
                style={styles.forgotButton}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>
            </View>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <PrimaryButton label="Log in" onPress={handleLogin} />
            <View style={styles.signupRow}>
              <Text style={styles.signupMuted}>New to Wayfare? </Text>
              <Pressable accessibilityRole="button" onPress={() => setSignupOpen(true)} hitSlop={8}>
                <Text style={styles.signupLink}>Create an account</Text>
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
          router.push('/locations');
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
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  brandMark: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
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
    marginTop: 8,
    marginBottom: 28,
  },
  form: { gap: 16 },
  forgotButton: { alignSelf: 'flex-start', marginTop: 4, paddingVertical: 1 },
  forgotText: { color: COLORS.orange, fontFamily: FONTS.bold, fontSize: 14, lineHeight: 21 },
  footer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    minHeight: 21,
  },
  signupMuted: { color: COLORS.muted, fontFamily: FONTS.regular, fontSize: 14 },
  signupLink: { color: COLORS.text, fontFamily: FONTS.bold, fontSize: 14 },
});
