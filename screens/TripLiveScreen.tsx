import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { OsmMapEmbed } from '@/components/web/osm-map-embed';
import { AppTheme } from '@/constants/app-theme';
import { sampleDriver } from '@/constants/dummy-data';
import { useUserLocation } from '@/hooks/use-user-location';
import { AppRoutes } from '@/navigation/routes';

export default function TripLiveScreen() {
  const router = useRouter();
  const { requestId, bookingId, total, pickupName, rideName, destinationName, distance, eta, driverName } =
    useLocalSearchParams<{
      requestId?: string;
      bookingId?: string;
      total?: string;
      pickupName?: string;
      rideName?: string;
      destinationName?: string;
      distance?: string;
      eta?: string;
      driverName?: string;
    }>();
  const { coords } = useUserLocation();

  return (
    <View style={styles.container}>
      <View style={styles.mapWrap}>
        <OsmMapEmbed latitude={coords.latitude} longitude={coords.longitude} zoom={15} />
      </View>

      <View style={styles.statusChip}>
        <Text style={styles.statusText}>Driver arriving in 2 mins</Text>
      </View>

      <View style={styles.driverCardWrap}>
        <AppCard style={styles.driverCard}>
          <View style={styles.driverRow}>
            <Image source={{ uri: sampleDriver.avatar }} style={styles.avatar} />
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{driverName ?? sampleDriver.name}</Text>
              <Text style={styles.vehicleText}>{sampleDriver.vehicle}</Text>
              <Text style={styles.vehicleText}>{sampleDriver.plate}</Text>
            </View>
            <View style={styles.ratingWrap}>
              <Ionicons name="star" size={14} color={AppTheme.colors.warning} />
              <Text style={styles.ratingText}>{sampleDriver.rating}</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <Pressable style={styles.actionBtn}>
              <Ionicons name="call-outline" size={20} color={AppTheme.colors.primary} />
              <Text style={styles.actionLabel}>Call</Text>
            </Pressable>
            <Pressable style={styles.actionBtn}>
              <Ionicons name="chatbubble-outline" size={20} color={AppTheme.colors.secondary} />
              <Text style={styles.actionLabel}>Chat</Text>
            </Pressable>
          </View>

          <AppButton
            label="End trip"
            onPress={() =>
              router.replace({
                pathname: AppRoutes.tripSummary,
                params: {
                  requestId,
                  bookingId,
                  total: total ?? '7.40',
                  pickupName,
                  rideName,
                  destinationName,
                  distance,
                  eta,
                },
              })
            }
          />
        </AppCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  mapWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  statusChip: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    backgroundColor: '#052E23',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  driverCardWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
  },
  driverCard: {
    gap: 14,
    borderRadius: AppTheme.radius.xl,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  driverInfo: {
    flex: 1,
    gap: 2,
  },
  driverName: {
    fontSize: 17,
    fontWeight: '700',
    color: AppTheme.colors.text,
  },
  vehicleText: {
    color: AppTheme.colors.textMuted,
    fontSize: 13,
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FEF3C7',
  },
  ratingText: {
    fontWeight: '700',
    color: '#78350F',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flexDirection: 'row',
  },
  actionLabel: {
    fontWeight: '700',
    color: AppTheme.colors.text,
  },
});
