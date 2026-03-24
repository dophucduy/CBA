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

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await setAuthSession('demo-user');
    setLoading(false);
    router.replace(AppRoutes.home);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
        <View style={styles.logo}>
          <Ionicons name="person-add" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Start booking in under a minute</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(600)}>
        <AppCard style={styles.card}>
          <View style={styles.form}>
            <AppInput icon="person-outline" placeholder="Full name" />
            <AppInput icon="mail-outline" placeholder="Email" />
            <AppInput icon="call-outline" placeholder="Phone" />
            <AppInput icon="lock-closed-outline" placeholder="Password" secureTextEntry />
            <AppButton label="Register" onPress={handleRegister} loading={loading} />
          </View>

          <Link href={AppRoutes.login} style={styles.link}>
            Already have an account? Login
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
  form: {
    gap: 12,
  },
  link: {
    textAlign: 'center',
    color: AppTheme.colors.primary,
    fontWeight: '700',
  },
});
