import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppTheme } from '@/constants/app-theme';
import { placeOptions, sampleDriverRequest } from '@/constants/dummy-data';
import { useUserLocation } from '@/hooks/use-user-location';
import { AppRoutes } from '@/navigation/routes';

export default function DriverFoundScreen() {
  const router = useRouter();
  const { coords } = useUserLocation();
  const pickupCoords =
    placeOptions.find((item) => item.label === sampleDriverRequest.pickup)?.coords ?? {
      latitude: coords.latitude + 0.01,
      longitude: coords.longitude + 0.008,
    };

  return (
    <View style={styles.container}>
      <View style={styles.badgeWrap}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark" size={34} color={AppTheme.colors.success} />
        </View>
        <Text style={styles.badgeText}>Request incoming</Text>
      </View>

      <Text style={styles.title}>Tim khach thanh cong</Text>
      <Text style={styles.subtitle}>Ban vua duoc ghep voi mot chuyen di moi</Text>

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
          <Marker coordinate={pickupCoords} title="Pickup" description={sampleDriverRequest.pickup} />
          <Polyline coordinates={[coords, pickupCoords]} strokeWidth={5} strokeColor={AppTheme.colors.primary} />
        </MapView>
      </View>

      <AppCard style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Ma yeu cau</Text>
          <Text style={styles.value}>#{sampleDriverRequest.id}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Hanh khach</Text>
          <Text style={styles.value}>{sampleDriverRequest.passengerName}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Diem don</Text>
          <Text style={styles.value}>{sampleDriverRequest.pickup}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Diem den</Text>
          <Text style={styles.value}>{sampleDriverRequest.destination}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Cuoc du kien</Text>
          <Text style={styles.value}>${sampleDriverRequest.estimatedFare.toFixed(2)}</Text>
        </View>
      </AppCard>

      <View style={styles.footerRow}>
        <AppButton
          label="Bo qua"
          variant="ghost"
          onPress={() => router.replace(AppRoutes.driverHome)}
          style={styles.footerBtn}
        />
        <AppButton
          label="Xem man hinh match"
          onPress={() => router.replace(AppRoutes.driverMatch)}
          style={styles.footerBtn}
        />
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
