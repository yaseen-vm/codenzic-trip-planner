import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADIUS } from '../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
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
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrap}>
                  <Mail size={18} color={COLORS.muted} style={styles.leadingIcon} />
                  <TextInput
                    accessibilityLabel="Email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={COLORS.placeholder}
                    returnKeyType="next"
                    style={[styles.input, emailError && styles.inputError]}
                    textContentType="emailAddress"
                    value={email}
                  />
                </View>
                {emailError ? (
                  <Text style={styles.errorText}>Enter a valid email address.</Text>
                ) : null}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.passwordWrap, passwordError && styles.inputError]}>
                  <Lock size={18} color={COLORS.muted} style={styles.leadingIcon} />
                  <TextInput
                    accessibilityLabel="Password"
                    autoCapitalize="none"
                    autoComplete="password"
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={COLORS.placeholder}
                    returnKeyType="done"
                    secureTextEntry={!showPassword}
                    style={styles.passwordInput}
                    textContentType="password"
                    value={password}
                    onSubmitEditing={handleLogin}
                  />
                  <Pressable
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    accessibilityRole="button"
                    hitSlop={10}
                    onPress={() => setShowPassword((visible) => !visible)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color={COLORS.muted} />
                    ) : (
                      <Eye size={18} color={COLORS.muted} />
                    )}
                  </Pressable>
                </View>
                {passwordError ? (
                  <Text style={styles.errorText}>Password must be at least 6 characters.</Text>
                ) : null}
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  Alert.alert(
                    'Forgot password?',
                    'Password recovery will be available when authentication is connected.',
                  )
                }
                style={styles.forgotButton}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>
            </View>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <Pressable
              accessibilityRole="button"
              onPress={handleLogin}
              style={({ pressed }) => [styles.loginButton, pressed && styles.loginButtonPressed]}
            >
              <Text style={styles.loginButtonText}>Log in</Text>
            </Pressable>
            <View style={styles.signupRow}>
              <Text style={styles.signupMuted}>New to Wayfare? </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  Alert.alert(
                    'Create an account',
                    'Account creation will be implemented with authentication.',
                  )
                }
                hitSlop={8}
              >
                <Text style={styles.signupLink}>Create an account</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  fieldGroup: { gap: 8 },
  label: { color: COLORS.text, fontFamily: FONTS.bold, fontSize: 15 },
  inputWrap: { justifyContent: 'center' },
  leadingIcon: { position: 'absolute', left: 16, zIndex: 1 },
  input: {
    height: 54,
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.control,
    paddingLeft: 45,
    paddingRight: 17,
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  passwordWrap: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.control,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingLeft: 44,
    paddingRight: 8,
    color: COLORS.text,
    fontFamily: FONTS.semiBold,
    fontSize: 15,
  },
  eyeButton: {
    width: 40,
    height: 40,
    marginRight: 7,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputError: { borderColor: COLORS.orange },
  errorText: { color: COLORS.orange, fontFamily: FONTS.regular, fontSize: 13 },
  forgotButton: { alignSelf: 'flex-start', marginTop: 4, paddingVertical: 1 },
  forgotText: { color: COLORS.orange, fontFamily: FONTS.bold, fontSize: 14, lineHeight: 21 },
  footer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  loginButton: {
    height: 56,
    backgroundColor: COLORS.orange,
    borderRadius: RADIUS.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonPressed: { opacity: 0.88 },
  loginButtonText: { color: COLORS.white, fontFamily: FONTS.extraBold, fontSize: 17 },
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
