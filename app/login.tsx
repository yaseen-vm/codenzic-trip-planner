import { Eye, EyeOff } from 'lucide-react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useState } from 'react';
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

const COLORS = {
  background: '#F2F4F6',
  white: '#FFFFFF',
  text: '#172533',
  muted: '#8090A2',
  border: '#E3E8ED',
  orange: '#FA4B1B',
};

export default function LoginScreen() {
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
    Alert.alert('Demo login', 'Your form is valid. Authentication will be connected in a later step.');
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.flex}>
          <ScrollView
            contentContainerStyle={[
              styles.content,
              { paddingTop: Math.max(insets.top ? 12 : 26, 26) },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.brandMark}>
              <Svg width={32} height={32} viewBox="0 0 40 40" accessibilityLabel="Codenzic logo">
                <Path
                  d="M29 8 H12 A4.5 4.5 0 0 0 12 17 H27.5 A4.5 4.5 0 0 1 27.5 26 H12"
                  fill="none"
                  stroke={COLORS.white}
                  strokeWidth={3.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Circle cx={29} cy={8} r={5} fill={COLORS.orange} stroke={COLORS.white} strokeWidth={3.4} />
                <Circle cx={8} cy={29} r={5} fill={COLORS.orange} stroke={COLORS.white} strokeWidth={3.4} />
              </Svg>
            </View>

            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Log in to plan a trip and follow your route turn by turn.
            </Text>

            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  accessibilityLabel="Email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="#98A4B3"
                  returnKeyType="next"
                  style={[styles.input, emailError && styles.inputError]}
                  textContentType="emailAddress"
                  value={email}
                />
                {emailError ? (
                  <Text style={styles.errorText}>Enter a valid email address.</Text>
                ) : null}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.passwordWrap, passwordError && styles.inputError]}>
                  <TextInput
                    accessibilityLabel="Password"
                    autoCapitalize="none"
                    autoComplete="password"
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#98A4B3"
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
                      <EyeOff size={20} color="#7D8B9A" />
                    ) : (
                      <Eye size={20} color="#7D8B9A" />
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

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 22) }]}>
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
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  brandMark: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 19,
  },
  heading: {
    color: COLORS.text,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.65,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
    marginBottom: 26,
  },
  form: { gap: 16 },
  fieldGroup: { gap: 8 },
  label: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  input: {
    height: 44,
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 35,
    color: COLORS.text,
    fontSize: 12,
  },
  passwordWrap: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingLeft: 35,
    paddingRight: 8,
    color: COLORS.text,
    fontSize: 12,
  },
  eyeButton: {
    width: 44,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputError: { borderColor: COLORS.orange },
  errorText: { color: COLORS.orange, fontSize: 11, marginTop: 1 },
  forgotButton: { alignSelf: 'flex-start', marginTop: 1, paddingVertical: 1 },
  forgotText: { color: COLORS.orange, fontSize: 12, fontWeight: '500' },
  footer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#E9EDF1',
    paddingHorizontal: 20,
    paddingTop: 13,
  },
  loginButton: {
    minHeight: 45,
    backgroundColor: COLORS.orange,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonPressed: { opacity: 0.88 },
  loginButtonText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    minHeight: 16,
  },
  signupMuted: { color: COLORS.muted, fontSize: 11 },
  signupLink: { color: COLORS.text, fontSize: 11, fontWeight: '700' },
});
