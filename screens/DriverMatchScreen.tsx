import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { OsmMapEmbed } from '@/components/web/osm-map-embed';
import { AppTheme } from '@/constants/app-theme';
import { placeOptions } from '@/constants/dummy-data';
import {
  acceptRideRequest,
  getRideRequestById,
  releaseRideRequest,
  type LiveRideRequest,
} from '@/constants/storage';
import { useAuthSession } from '@/hooks/use-auth-session';
import { AppRoutes } from '@/navigation/routes';

export default function DriverMatchScreen() {
  const router = useRouter();
  const { session } = useAuthSession();
  const { requestId } = useLocalSearchParams<{ requestId?: string }>();
  const [request, setRequest] = useState<LiveRideRequest | null>(null);
  const [loading, setLoading] = useState(Boolean(requestId));
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    () => placeOptions.find((item) => item.label === request?.pickup)?.coords,
    [request?.pickup]
  );
  const destinationCoords = useMemo(
    () => placeOptions.find((item) => item.label === request?.destination)?.coords,
    [request?.destination]
  );

  const handleDecline = async () => {
    if (!requestId) {
      router.replace(AppRoutes.driverScanning);
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      await releaseRideRequest(requestId);
      router.replace(AppRoutes.driverScanning);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to release this live request.');
    } finally {
      setSaving(false);
    }
  };

  const handleAccept = async () => {
    if (!requestId || !session) {
      router.replace(AppRoutes.driverHome);
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      const acceptedRequest = await acceptRideRequest(requestId, {
        accountId: session.accountId,
        name: session.name,
      });

      if (!acceptedRequest) {
        setErrorMessage('This live request is no longer available.');
        return;
      }

      router.replace(AppRoutes.driverHome);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to accept this live request.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Review live customer match</Text>
        <Text style={styles.subtitle}>Confirm the trip details before accepting this waiting rider.</Text>

        {request && pickupCoords && destinationCoords ? (
          <View style={styles.mapCard}>
            <OsmMapEmbed
              latitude={pickupCoords.latitude}
              longitude={pickupCoords.longitude}
              destination={destinationCoords}
              zoom={13}
            />
          </View>
        ) : null}

          {request ? (
            <AppCard style={styles.card}>
              <View style={styles.headRow}>
                <View style={styles.avatarWrap}>
                  <Ionicons name="person" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.headTextWrap}>
                  <Text style={styles.passengerName}>{request.passengerName}</Text>
                  <Text style={styles.meta}>Rating {request.passengerRating.toFixed(1)} / 5.0</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>LIVE</Text>
                </View>
              </View>

              <View style={styles.timelineBlock}>
                <View style={styles.timelineRow}>
                  <View style={[styles.timelineDot, { backgroundColor: AppTheme.colors.primary }]} />
                  <View style={styles.timelineTextWrap}>
                    <Text style={styles.timelineLabel}>Pickup</Text>
                    <Text style={styles.timelineValue}>{request.pickup}</Text>
                  </View>
                </View>

                <View style={styles.timelineLine} />

                <View style={styles.timelineRow}>
                  <View style={[styles.timelineDot, { backgroundColor: AppTheme.colors.secondary }]} />
                  <View style={styles.timelineTextWrap}>
                    <Text style={styles.timelineLabel}>Destination</Text>
                    <Text style={styles.timelineValue}>{request.destination}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>Distance</Text>
                <Text style={styles.value}>{request.distanceKm.toFixed(1)} km</Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>ETA to pickup</Text>
                <Text style={styles.value}>{Math.ceil(request.etaMin)} min</Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Estimated fare</Text>
                <Text style={styles.value}>${request.estimatedFare.toFixed(2)}</Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Platform fee</Text>
                <Text style={styles.value}>$0.70</Text>
              </View>

              <View style={styles.noteRow}>
                <Ionicons name="chatbubble-ellipses-outline" size={16} color={AppTheme.colors.textMuted} />
                <Text style={styles.noteText}>{request.note}</Text>
              </View>
            </AppCard>
          ) : (
            <AppCard style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>{loading ? 'Loading live request...' : 'Live request unavailable'}</Text>
              <Text style={styles.emptyText}>
                {errorMessage ?? 'This live request is no longer available. Please go back to the queue.'}
              </Text>
            </AppCard>
          )}
      </ScrollView>

      {request && errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <View style={styles.footerRow}>
        {request ? (
          <>
            <AppButton label="Decline" variant="ghost" onPress={handleDecline} loading={saving} style={styles.footerBtn} />
            <AppButton
              label="Accept trip"
              variant="secondary"
              onPress={handleAccept}
              loading={saving}
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
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 120,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: AppTheme.colors.text,
  },
  subtitle: {
    color: AppTheme.colors.textMuted,
  },
  mapCard: {
    width: '100%',
    height: 190,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    backgroundColor: '#EAF2F8',
  },
  card: {
    gap: 10,
  },
  emptyCard: {
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
    marginHorizontal: 16,
    marginBottom: 8,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.colors.secondary,
  },
  headTextWrap: {
    gap: 2,
    flex: 1,
  },
  passengerName: {
    color: AppTheme.colors.text,
    fontWeight: '800',
    fontSize: 16,
  },
  meta: {
    color: AppTheme.colors.textMuted,
    fontSize: 12,
  },
  badge: {
    minHeight: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#DCEBFD',
    backgroundColor: '#EEF5FF',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  badgeText: {
    color: AppTheme.colors.secondary,
    fontWeight: '700',
    fontSize: 12,
  },
  timelineBlock: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 10,
    gap: 8,
    backgroundColor: '#F8FAFC',
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  timelineTextWrap: {
    flex: 1,
    gap: 2,
  },
  timelineLabel: {
    color: AppTheme.colors.textMuted,
    fontSize: 12,
  },
  timelineValue: {
    color: AppTheme.colors.text,
    fontWeight: '700',
  },
  timelineLine: {
    height: 12,
    width: 1,
    backgroundColor: AppTheme.colors.border,
    marginLeft: 4,
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
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  noteText: {
    color: AppTheme.colors.textMuted,
    flex: 1,
  },
  footerRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    gap: 10,
  },
  footerBtn: {
    flex: 1,
  },
});
