import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

import { AppButton } from '@/components/common/AppButton';
import { AppTheme } from '@/constants/app-theme';
import { AppRoutes } from '@/navigation/routes';

export default function DriverSearchingScreen() {
  const router = useRouter();
  const { total } = useLocalSearchParams<{ total?: string }>();
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.2, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 2 - pulse.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.centered}>
        <Animated.View style={[styles.pulseOuter, animatedStyle]} />
        <View style={styles.pulseInner} />
      </View>

      <Text style={styles.title}>Finding your driver...</Text>
      <Text style={styles.subtitle}>Matching with nearest drivers around your pickup point</Text>

      <View style={styles.footer}>
        <AppButton
          label="Simulate driver found"
          onPress={() => router.replace({ pathname: AppRoutes.tripLive, params: { total } })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 10,
  },
  centered: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pulseOuter: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#D1FAE5',
  },
  pulseInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: AppTheme.colors.primary,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: AppTheme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    color: AppTheme.colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
  footer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
  },
});
