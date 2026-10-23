import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { X } from 'lucide-react-native';
import { COLORS, FONTS, RADIUS } from '../constants/theme';

interface AppModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}

// In-app replacement for the system Alert: a dimmed backdrop with a rounded card.
export default function AppModal({ visible, title, subtitle, onClose, children }: AppModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          accessibilityLabel="Close dialog"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.backdrop}
        >
          {/* The inner Pressable keeps taps on the card from reaching the backdrop. */}
          <Pressable style={styles.card} onPress={() => {}}>
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.title}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
              </View>
              <Pressable
                accessibilityLabel="Close"
                accessibilityRole="button"
                hitSlop={8}
                onPress={onClose}
                style={styles.closeButton}
              >
                <X size={18} color={COLORS.text} />
              </Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17,31,44,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    maxHeight: '90%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sheet,
    padding: 24,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  headerText: { flex: 1, marginRight: 12 },
  title: {
    color: COLORS.text,
    fontFamily: FONTS.extraBold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.muted,
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
