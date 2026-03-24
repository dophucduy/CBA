import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { OsmMapEmbed } from '@/components/web/osm-map-embed';
import { AppTheme } from '@/constants/app-theme';
import { placeOptions, sampleDriverRequest } from '@/constants/dummy-data';
import { useUserLocation } from '@/hooks/use-user-location';
import { AppRoutes } from '@/navigation/routes';

export default function DriverScanningScreen() {
  const router = useRouter();
  const { coords } = useUserLocation();
  const pulse = useSharedValue(1);
  const pickupCoords = placeOptions.find((item) => item.label === sampleDriverRequest.pickup)?.coords;

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.2, { duration: 840, easing: Easing.inOut(Easing.ease) }),
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
      <View style={styles.mapWrap}>
        <OsmMapEmbed
          latitude={coords.latitude}
          longitude={coords.longitude}
          destination={pickupCoords}
          zoom={14}
        />
      </View>

      <View style={styles.topBar}>
        <View style={styles.onlineChip}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>Driver online</Text>
        </View>
        <Text style={styles.queueText}>Queue: 12 requests</Text>
      </View>

      <View style={styles.pulseWrap}>
        <Animated.View style={[styles.pulseOuter, animatedStyle]} />
        <View style={styles.pulseInner} />
      </View>

      <Text style={styles.title}>Dang quet tim khach hang</Text>
      <Text style={styles.subtitle}>He thong dang tim cac chuyen phu hop xung quanh ban</Text>

      <AppCard style={styles.scanCard}>
        <View style={styles.scanRow}>
          <Text style={styles.scanLabel}>Khu vuc uu tien</Text>
          <Text style={styles.scanValue}>Quan 1, Quan 3</Text>
        </View>
        <View style={styles.scanRow}>
          <Text style={styles.scanLabel}>Thoi gian quet</Text>
          <Text style={styles.scanValue}>00:18</Text>
        </View>
        <View style={styles.scanRow}>
          <Text style={styles.scanLabel}>Do phu song</Text>
          <Text style={styles.scanValue}>Rong</Text>
        </View>
      </AppCard>

      <View style={styles.footer}>
        <AppButton label="Gia lap tim thanh cong" onPress={() => router.replace(AppRoutes.driverFound)} />
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
    padding: 16,
    gap: 9,
  },
  mapWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  onlineChip: {
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#CDEBD8',
    backgroundColor: '#F8FFFB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppTheme.colors.success,
  },
  onlineText: {
    color: AppTheme.colors.text,
    fontWeight: '700',
    fontSize: 12,
  },
  queueText: {
    color: AppTheme.colors.textMuted,
    fontWeight: '700',
    fontSize: 12,
  },
  pulseWrap: {
    backgroundColor: '#FFFFFFE6',
    borderRadius: 90,
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pulseOuter: {
    position: 'absolute',
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: '#DDF4FF',
  },
  pulseInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: AppTheme.colors.secondary,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: AppTheme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    color: AppTheme.colors.textMuted,
    textAlign: 'center',
    maxWidth: 290,
  },
  scanCard: {
    width: '100%',
    gap: 7,
    backgroundColor: '#FFFFFFEE',
  },
  scanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  scanLabel: {
    color: AppTheme.colors.textMuted,
  },
  scanValue: {
    color: AppTheme.colors.text,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
  },
});
