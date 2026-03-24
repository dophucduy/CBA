import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppInput } from '@/components/common/AppInput';
import { AppTheme } from '@/constants/app-theme';
import { setAuthSession } from '@/constants/storage';
import { AppRoutes } from '@/navigation/routes';

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    await setAuthSession('demo-user');
    setLoading(false);
    router.replace(AppRoutes.roleHome);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
        <View style={styles.logo}>
          <Ionicons name="car-sport" size={30} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Login to continue booking your ride</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(600)}>
        <AppCard style={styles.card}>
          <View style={styles.form}>
            <AppInput icon="mail-outline" placeholder="Email or phone" />
            <AppInput icon="lock-closed-outline" placeholder="Password" secureTextEntry />
            <AppButton label="Login" onPress={handleLogin} loading={loading} />
          </View>

          <View style={styles.socialRow}>
            <AppButton label="Google" onPress={handleLogin} variant="ghost" style={styles.socialBtn} />
            <AppButton
              label="Facebook"
              onPress={handleLogin}
              variant="secondary"
              style={styles.socialBtn}
            />
          </View>

          <Link href={AppRoutes.register} style={styles.link}>
            Create new account
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
  socialRow: {
    flexDirection: 'row',
    gap: 10,
  },
  socialBtn: {
    flex: 1,
  },
  link: {
    textAlign: 'center',
    color: AppTheme.colors.primary,
    fontWeight: '700',
  },
});
