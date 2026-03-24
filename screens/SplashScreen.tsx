import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppTheme } from '@/constants/app-theme';
import { getDefaultRouteForRole } from '@/constants/auth';
import { resolveAuthSession } from '@/constants/storage';
import { AppRoutes } from '@/navigation/routes';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(async () => {
      const session = await resolveAuthSession();
      if (session) {
        router.replace(getDefaultRouteForRole(session.role));
      } else {
        router.replace(AppRoutes.login);
      }
    }, 1600);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(700)} style={styles.logoWrap}>
        <Ionicons name="car-sport" size={48} color="#FFFFFF" />
      </Animated.View>
      <Animated.Text entering={FadeInDown.delay(120).duration(700)} style={styles.title}>
        Car Booking App
      </Animated.Text>
      <Text style={styles.subtitle}>Fast rides, premium experience</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.background,
    gap: 14,
  },
  logoWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...AppTheme.shadow.card,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: AppTheme.colors.text,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    color: AppTheme.colors.textMuted,
  },
});
