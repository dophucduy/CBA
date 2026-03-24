import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { AppTheme } from '@/constants/app-theme';
import { setLastBookingStatus } from '@/constants/storage';
import { AppRoutes } from '@/navigation/routes';

export default function PaymentProcessingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    total?: string;
    paymentMethod?: 'visa' | 'cash';
    rideName?: string;
    destinationName?: string;
    distance?: string;
    eta?: string;
  }>();

  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.22, { duration: 850, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const randomSeed = Math.random();
      const isSuccess = params.paymentMethod === 'cash' ? randomSeed > 0.08 : randomSeed > 0.28;
      const status = isSuccess ? 'success' : 'failed';

      await setLastBookingStatus({
        id: `booking-${Date.now()}`,
        amount: Number(params.total ?? 0),
        paymentMethod: (params.paymentMethod ?? 'visa') as 'visa' | 'cash',
        paymentStatus: status,
        updatedAt: new Date().toISOString(),
      });

      router.replace({
        pathname: AppRoutes.paymentResult,
        params: {
          status,
          total: params.total,
          paymentMethod: params.paymentMethod,
          rideName: params.rideName,
          destinationName: params.destinationName,
          distance: params.distance,
          eta: params.eta,
        },
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [params.destinationName, params.distance, params.eta, params.paymentMethod, params.rideName, params.total, router]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 2 - pulse.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.loaderWrap}>
        <Animated.View style={[styles.pulseOuter, animatedStyle]} />
        <View style={styles.pulseInner} />
      </View>
      <Text style={styles.title}>Confirming payment...</Text>
      <Text style={styles.subtitle}>Please wait while we securely process your transaction</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.colors.background,
    padding: 20,
    gap: 8,
  },
  loaderWrap: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  pulseOuter: {
    position: 'absolute',
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: '#D1FAE5',
  },
  pulseInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: AppTheme.colors.primary,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: AppTheme.colors.text,
  },
  subtitle: {
    color: AppTheme.colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
});
