import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppTheme } from '@/constants/app-theme';
import { getRoleLabel } from '@/constants/auth';
import { useManagedAccounts } from '@/hooks/use-managed-accounts';
import { AppRoutes } from '@/navigation/routes';

export default function RegisterScreen() {
  const router = useRouter();
  const { accounts } = useManagedAccounts();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
        <View style={styles.logo}>
          <Ionicons name="shield-checkmark-outline" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Admin-managed access</Text>
        <Text style={styles.subtitle}>This MVP assigns accounts by role instead of open self-registration.</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(600)}>
        <AppCard style={styles.card}>
          <View style={styles.copyWrap}>
            <Text style={styles.copyText}>
              Use one of the assigned accounts below to sign in. Admin can promote a user to driver from the admin center.
            </Text>
            {accounts.map((account) => (
              <View key={account.id} style={styles.accountRow}>
                <Text style={styles.accountRole}>{getRoleLabel(account.role)}</Text>
                <Text style={styles.accountValue}>{account.email}</Text>
                <Text style={styles.accountValue}>{account.password}</Text>
              </View>
            ))}
          </View>

          <AppButton label="Back to login" onPress={() => router.replace(AppRoutes.login)} />

          <Link href={AppRoutes.login} style={styles.link}>
            Return to login
          </Link>
        </AppCard>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
    justifyContent: 'center',
    padding: AppTheme.spacing.lg,
    gap: 18,
  },
  header: {
    gap: 8,
  },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.colors.secondary,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: AppTheme.colors.text,
  },
  subtitle: {
    color: AppTheme.colors.textMuted,
  },
  card: {
    gap: 18,
  },
  copyWrap: {
    gap: 12,
  },
  copyText: {
    color: AppTheme.colors.textMuted,
  },
  accountRow: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    backgroundColor: '#F8FAFC',
    padding: 12,
    gap: 4,
  },
  accountRole: {
    color: AppTheme.colors.primary,
    fontWeight: '800',
  },
  accountValue: {
    color: AppTheme.colors.text,
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    color: AppTheme.colors.primary,
    fontWeight: '700',
  },
});
