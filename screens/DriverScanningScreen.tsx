import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { AppCard } from '@/components/common/AppCard';
import { OsmMapEmbed } from '@/components/web/osm-map-embed';
import { AppTheme } from '@/constants/app-theme';
import { claimNextWaitingRideRequest, getWaitingRideRequests } from '@/constants/storage';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useUserLocation } from '@/hooks/use-user-location';
import { AppRoutes } from '@/navigation/routes';

function formatElapsed(seconds: number) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const remainSeconds = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${remainSeconds}`;
}

export default function DriverScanningScreen() {
  const router = useRouter();
  const { session, loading: sessionLoading } = useAuthSession();
  const { coords } = useUserLocation();
  const pulse = useSharedValue(1);
  const [queueCount, setQueueCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [previewPickup, setPreviewPickup] = useState('No waiting customers yet');
  const [statusNote, setStatusNote] = useState(
    'Live queue monitoring is active. The next available waiting customer will open automatically.'
  );
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.2, { duration: 840, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [pulse]);

  useEffect(() => {
    if (sessionLoading || !session || session.role !== 'driver') {
      return;
    }

    let active = true;
    setElapsedSeconds(0);

    const timerId = setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    const pollQueue = async () => {
      try {
        const waitingRequests = await getWaitingRideRequests();

        if (!active) {
          return;
        }

        setQueueCount(waitingRequests.length);
        setPreviewPickup(waitingRequests[0]?.pickup ?? 'No waiting customers yet');
        setStatusNote('Live queue monitoring is active. The next available waiting customer will open automatically.');
        setServerError(null);

        const claimedRequest = await claimNextWaitingRideRequest({
          accountId: session.accountId,
          name: session.name,
        });

        if (!active || !claimedRequest) {
          return;
        }

        router.replace({
          pathname: AppRoutes.driverFound,
          params: { requestId: claimedRequest.id },
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setQueueCount(0);
        setPreviewPickup('Live server unavailable');
        setStatusNote('Unable to reach the live matching server. Start the backend and keep scanning.');
        setServerError(error instanceof Error ? error.message : 'Live matching is unavailable right now.');
      }
    };

    pollQueue();
    const intervalId = setInterval(pollQueue, 1500);

    return () => {
      active = false;
      clearInterval(intervalId);
      clearInterval(timerId);
    };
  }, [router, session, sessionLoading]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 2 - pulse.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.mapWrap}>
        <OsmMapEmbed latitude={coords.latitude} longitude={coords.longitude} zoom={14} />
      </View>

      <View style={styles.topBar}>
        <View style={styles.onlineChip}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>Driver online</Text>
        </View>
        <Text style={styles.queueText}>Queue: {queueCount} live requests</Text>
      </View>

      <View style={styles.pulseWrap}>
        <Animated.View style={[styles.pulseOuter, animatedStyle]} />
        <View style={styles.pulseInner} />
      </View>

      <Text style={styles.title}>Scanning for waiting customers</Text>
      <Text style={styles.subtitle}>{statusNote}</Text>
      {serverError ? <Text style={styles.errorText}>{serverError}</Text> : null}

      <AppCard style={styles.scanCard}>
        <View style={styles.scanRow}>
          <Text style={styles.scanLabel}>Available customers</Text>
          <Text style={styles.scanValue}>{queueCount}</Text>
        </View>
        <View style={styles.scanRow}>
          <Text style={styles.scanLabel}>Scan time</Text>
          <Text style={styles.scanValue}>{formatElapsed(elapsedSeconds)}</Text>
        </View>
        <View style={styles.scanRow}>
          <Text style={styles.scanLabel}>Latest waiting pickup</Text>
          <Text style={styles.scanValue}>{previewPickup}</Text>
        </View>
      </AppCard>
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
    maxWidth: 300,
  },
  errorText: {
    color: '#B42318',
    textAlign: 'center',
    maxWidth: 320,
    fontWeight: '600',
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
    flexShrink: 1,
    textAlign: 'right',
  },
});
