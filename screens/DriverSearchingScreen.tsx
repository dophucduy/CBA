import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { AppTheme } from '@/constants/app-theme';
import { getRideRequestByBookingId, upsertCustomerRideRequest } from '@/constants/storage';
import { useAuthSession } from '@/hooks/use-auth-session';
import { AppRoutes } from '@/navigation/routes';

export default function DriverSearchingScreen() {
  const router = useRouter();
  const { session, loading: sessionLoading } = useAuthSession();
  const { bookingId, total, pickupName, rideName, destinationName, distance, eta } = useLocalSearchParams<{
    bookingId?: string;
    total?: string;
    pickupName?: string;
    rideName?: string;
    destinationName?: string;
    distance?: string;
    eta?: string;
  }>();
  const pulse = useSharedValue(1);
  const [matchStatus, setMatchStatus] = useState<'waiting' | 'claimed' | 'accepted'>('waiting');
  const [driverName, setDriverName] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState('Broadcasting your request to nearby drivers.');
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.2, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [pulse]);

  useEffect(() => {
    if (sessionLoading || !bookingId || !session) {
      return;
    }

    let active = true;

    const syncRideRequest = async () => {
      try {
        await upsertCustomerRideRequest({
          bookingId,
          customerAccountId: session.accountId,
          passengerName: session.name,
          pickup: pickupName ?? 'Current location',
          destination: destinationName ?? 'Selected destination',
          rideName: rideName ?? 'Standard ride',
          distanceText: distance ?? '--',
          etaText: eta ?? '--',
          estimatedFare: Number(total ?? 0),
        });

        const request = await getRideRequestByBookingId(bookingId);

        if (!active || !request) {
          return;
        }

        setServerError(null);

        if (request.status === 'accepted') {
          router.replace({
            pathname: AppRoutes.tripLive,
            params: {
              requestId: request.id,
              bookingId: request.bookingId,
              total: request.estimatedFare.toFixed(2),
              pickupName: request.pickup,
              rideName: request.rideName,
              destinationName: request.destination,
              distance: request.distanceText,
              eta: request.etaText,
              driverName: request.driverName ?? undefined,
            },
          });
          return;
        }

        setMatchStatus(request.status === 'claimed' ? 'claimed' : 'waiting');
        setDriverName(request.driverName);
        setStatusNote(
          request.status === 'claimed'
            ? `${request.driverName ?? 'A nearby driver'} is reviewing your trip details.`
            : 'Broadcasting your request to nearby drivers.'
        );
      } catch (error) {
        if (!active) {
          return;
        }

        setMatchStatus('waiting');
        setDriverName(null);
        setStatusNote('Unable to reach the live matching server. Retrying your request...');
        setServerError(error instanceof Error ? error.message : 'Live matching is unavailable right now.');
      }
    };

    syncRideRequest();
    const intervalId = setInterval(syncRideRequest, 1500);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [
    bookingId,
    destinationName,
    distance,
    eta,
    pickupName,
    rideName,
    router,
    session,
    sessionLoading,
    total,
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 2 - pulse.value,
  }));

  const title =
    matchStatus === 'claimed' ? 'Driver reviewing your request...' : 'Finding your driver...';

  return (
    <View style={styles.container}>
      <View style={styles.centered}>
        <Animated.View style={[styles.pulseOuter, animatedStyle]} />
        <View style={styles.pulseInner} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{statusNote}</Text>
      {serverError ? <Text style={styles.errorText}>{serverError}</Text> : null}

      <AppCard style={styles.statusCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Pickup</Text>
          <Text style={styles.value}>{pickupName ?? 'Current location'}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Destination</Text>
          <Text style={styles.value}>{destinationName ?? 'Selected destination'}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Ride</Text>
          <Text style={styles.value}>{rideName ?? 'Standard ride'}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.value}>${Number(total ?? 0).toFixed(2)}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>
            {matchStatus === 'claimed'
              ? `Driver found${driverName ? `: ${driverName}` : ''}`
              : 'Waiting for driver'}
          </Text>
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
    maxWidth: 300,
  },
  errorText: {
    color: '#B42318',
    textAlign: 'center',
    maxWidth: 320,
    fontWeight: '600',
  },
  statusCard: {
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  label: {
    color: AppTheme.colors.textMuted,
  },
  value: {
    color: AppTheme.colors.text,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
});
