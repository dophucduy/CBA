import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppInput } from '@/components/common/AppInput';
import { AppTheme } from '@/constants/app-theme';
import {
  demoAccounts,
  findDemoAccountByCredentials,
  getDefaultRouteForRole,
  getRoleLabel,
  type DemoAccount,
} from '@/constants/auth';
import { setAuthSession } from '@/constants/storage';
import { AppRoutes } from '@/navigation/routes';

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const applyDemoAccount = (account: DemoAccount) => {
    setEmail(account.email);
    setPassword(account.password);
    setErrorMessage('');
  };

  const handleLogin = async () => {
    const account = findDemoAccountByCredentials(email, password);

    if (!account) {
      setErrorMessage('Use one of the assigned demo email and password pairs below.');
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    await setAuthSession({
      accountId: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      loggedInAt: new Date().toISOString(),
    });
    setLoading(false);
    router.replace(getDefaultRouteForRole(account.role));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
        <View style={styles.logo}>
          <Ionicons name="car-sport" size={30} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Role-based login</Text>
        <Text style={styles.subtitle}>Sign in with the account assigned by admin.</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(600)}>
        <AppCard style={styles.card}>
          <View style={styles.form}>
            <AppInput
              autoCapitalize="none"
              autoCorrect={false}
              icon="mail-outline"
              keyboardType="email-address"
              onChangeText={(value) => {
                setEmail(value);
                setErrorMessage('');
              }}
              placeholder="Email"
              value={email}
            />
            <AppInput
              autoCapitalize="none"
              autoCorrect={false}
              icon="lock-closed-outline"
              onChangeText={(value) => {
                setPassword(value);
                setErrorMessage('');
              }}
              placeholder="Password"
              secureTextEntry
              value={password}
            />
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            <AppButton label="Login" onPress={handleLogin} loading={loading} />
          </View>

          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>Assigned example accounts</Text>
            {demoAccounts.map((account) => (
              <Pressable
                key={account.id}
                onPress={() => applyDemoAccount(account)}
                style={({ pressed }) => [
                  styles.demoAccountCard,
                  pressed && styles.demoAccountCardPressed,
                ]}>
                <View style={styles.demoAccountTopRow}>
                  <Text style={styles.demoAccountName}>{account.name}</Text>
                  <Text style={styles.demoRoleBadge}>{getRoleLabel(account.role)}</Text>
                </View>
                <Text style={styles.demoCredential}>Email: {account.email}</Text>
                <Text style={styles.demoCredential}>Password: {account.password}</Text>
              </Pressable>
            ))}
          </View>

          <Link href={AppRoutes.register} style={styles.link}>
            Need access? Review admin-managed demo accounts
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
    backgroundColor: AppTheme.colors.primary,
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
  form: {
    gap: 12,
  },
  errorText: {
    color: '#C2410C',
    fontWeight: '600',
  },
  demoSection: {
    gap: 10,
  },
  demoTitle: {
    color: AppTheme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  demoAccountCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 12,
    gap: 4,
    backgroundColor: '#F8FAFC',
  },
  demoAccountCardPressed: {
    opacity: 0.82,
  },
  demoAccountTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  demoAccountName: {
    color: AppTheme.colors.text,
    fontWeight: '800',
    flex: 1,
  },
  demoRoleBadge: {
    color: AppTheme.colors.primary,
    fontWeight: '800',
    fontSize: 12,
  },
  demoCredential: {
    color: AppTheme.colors.textMuted,
    fontSize: 13,
  },
  link: {
    textAlign: 'center',
    color: AppTheme.colors.primary,
    fontWeight: '700',
  },
});
