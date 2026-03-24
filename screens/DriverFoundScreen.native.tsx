import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppTheme } from '@/constants/app-theme';
import { placeOptions } from '@/constants/dummy-data';
import { getRideRequestById, releaseRideRequest, type LiveRideRequest } from '@/constants/storage';
import { useUserLocation } from '@/hooks/use-user-location';
import { AppRoutes } from '@/navigation/routes';

export default function DriverFoundScreen() {
  const router = useRouter();
  const { requestId } = useLocalSearchParams<{ requestId?: string }>();
  const { coords } = useUserLocation();
  const [request, setRequest] = useState<LiveRideRequest | null>(null);
  const [loading, setLoading] = useState(Boolean(requestId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [releasing, setReleasing] = useState(false);

  useEffect(() => {
    if (!requestId) {
      return;
    }

    let active = true;

    const loadRequest = async () => {
      setLoading(true);

      try {
        const nextRequest = await getRideRequestById(requestId);

        if (!active) {
          return;
        }

        setRequest(nextRequest);
        setErrorMessage(nextRequest ? null : 'This live request is no longer available.');
      } catch (error) {
        if (!active) {
          return;
        }

        setRequest(null);
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load the live request.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadRequest();
    return () => {
      active = false;
    };
  }, [requestId]);

  const pickupCoords = useMemo(
    () =>
      placeOptions.find((item) => item.label === request?.pickup)?.coords ?? {
        latitude: coords.latitude + 0.01,
        longitude: coords.longitude + 0.008,
      },
    [coords.latitude, coords.longitude, request?.pickup]
  );

  const handleSkip = async () => {
    if (!requestId) {
      router.replace(AppRoutes.driverScanning);
      return;
    }

    setReleasing(true);
    setErrorMessage(null);

    try {
      await releaseRideRequest(requestId);
      router.replace(AppRoutes.driverScanning);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to release this live request.');
    } finally {
      setReleasing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.badgeWrap}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark" size={34} color={AppTheme.colors.success} />
        </View>
        <Text style={styles.badgeText}>Live request found</Text>
      </View>

      <Text style={styles.title}>Customer request detected</Text>
      <Text style={styles.subtitle}>A live waiting rider has been assigned to your scan session.</Text>

      {request ? (
        <>
          <View style={styles.mapCard}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.04,
                longitudeDelta: 0.04,
              }}>
              <Marker coordinate={coords} title="Driver" description="Current location" />
              <Marker coordinate={pickupCoords} title="Pickup" description={request.pickup} />
              <Polyline coordinates={[coords, pickupCoords]} strokeWidth={5} strokeColor={AppTheme.colors.primary} />
            </MapView>
          </View>

          <AppCard style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Request ID</Text>
              <Text style={styles.value}>#{request.id}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Passenger</Text>
              <Text style={styles.value}>{request.passengerName}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Pickup</Text>
              <Text style={styles.value}>{request.pickup}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Destination</Text>
              <Text style={styles.value}>{request.destination}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Estimated fare</Text>
              <Text style={styles.value}>${request.estimatedFare.toFixed(2)}</Text>
            </View>
          </AppCard>
        </>
      ) : (
        <AppCard style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{loading ? 'Loading live request...' : 'Live request unavailable'}</Text>
          <Text style={styles.emptyText}>
            {errorMessage ?? 'This live request is no longer available. Please go back to the queue.'}
          </Text>
        </AppCard>
      )}

      {request && errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <View style={styles.footerRow}>
        {request ? (
          <>
            <AppButton
              label="Skip"
              variant="ghost"
              onPress={handleSkip}
              loading={releasing}
              style={styles.footerBtn}
            />
            <AppButton
              label="Review trip"
              onPress={() =>
                router.replace({
                  pathname: AppRoutes.driverMatch,
                  params: { requestId: request.id },
                })
              }
              style={styles.footerBtn}
            />
          </>
        ) : (
          <AppButton label="Back to queue" onPress={() => router.replace(AppRoutes.driverScanning)} style={styles.footerBtn} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  badgeWrap: {
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCFCE7',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.colors.success,
    backgroundColor: '#E8FAEE',
    borderWidth: 1,
    borderColor: '#CDEBD8',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: AppTheme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    color: AppTheme.colors.textMuted,
    textAlign: 'center',
  },
  mapCard: {
    width: '100%',
    height: 170,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    backgroundColor: '#EAF2F8',
  },
  map: {
    flex: 1,
  },
  card: {
    width: '100%',
    gap: 8,
  },
  emptyCard: {
    width: '100%',
    gap: 8,
    alignItems: 'center',
  },
  emptyTitle: {
    color: AppTheme.colors.text,
    fontWeight: '800',
    fontSize: 18,
    textAlign: 'center',
  },
  emptyText: {
    color: AppTheme.colors.textMuted,
    textAlign: 'center',
  },
  errorText: {
    color: '#B42318',
    textAlign: 'center',
    fontWeight: '600',
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
    textAlign: 'right',
    flexShrink: 1,
  },
  footerRow: {
    width: '100%',
    marginTop: 2,
    gap: 10,
    flexDirection: 'row',
  },
  footerBtn: {
    flex: 1,
  },
});
