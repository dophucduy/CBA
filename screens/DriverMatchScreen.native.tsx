import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppTheme } from '@/constants/app-theme';
import { placeOptions, sampleDriverRequest } from '@/constants/dummy-data';
import { AppRoutes } from '@/navigation/routes';

export default function DriverMatchScreen() {
  const router = useRouter();
  const pickupCoords = placeOptions.find((item) => item.label === sampleDriverRequest.pickup)?.coords;
  const destinationCoords = placeOptions.find((item) => item.label === sampleDriverRequest.destination)?.coords;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Match voi khach hang</Text>
        <Text style={styles.subtitle}>Kiem tra chi tiet chuyen truoc khi xac nhan nhan chuyen</Text>

        {pickupCoords && destinationCoords ? (
          <View style={styles.mapCard}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: pickupCoords.latitude,
                longitude: pickupCoords.longitude,
                latitudeDelta: 0.06,
                longitudeDelta: 0.06,
              }}>
              <Marker coordinate={pickupCoords} title="Pickup" description={sampleDriverRequest.pickup} />
              <Marker coordinate={destinationCoords} title="Destination" description={sampleDriverRequest.destination} />
              <Polyline
                coordinates={[pickupCoords, destinationCoords]}
                strokeWidth={5}
                strokeColor={AppTheme.colors.primary}
              />
            </MapView>
          </View>
        ) : null}

        <AppCard style={styles.card}>
          <View style={styles.headRow}>
            <View style={styles.avatarWrap}>
              <Ionicons name="person" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.headTextWrap}>
              <Text style={styles.passengerName}>{sampleDriverRequest.passengerName}</Text>
              <Text style={styles.meta}>Danh gia {sampleDriverRequest.passengerRating.toFixed(1)} / 5.0</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>VIP</Text>
            </View>
          </View>

          <View style={styles.timelineBlock}>
            <View style={styles.timelineRow}>
              <View style={[styles.timelineDot, { backgroundColor: AppTheme.colors.primary }]} />
              <View style={styles.timelineTextWrap}>
                <Text style={styles.timelineLabel}>Diem don</Text>
                <Text style={styles.timelineValue}>{sampleDriverRequest.pickup}</Text>
              </View>
            </View>

            <View style={styles.timelineLine} />

            <View style={styles.timelineRow}>
              <View style={[styles.timelineDot, { backgroundColor: AppTheme.colors.secondary }]} />
              <View style={styles.timelineTextWrap}>
                <Text style={styles.timelineLabel}>Diem den</Text>
                <Text style={styles.timelineValue}>{sampleDriverRequest.destination}</Text>
              </View>
            </View>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Quang duong</Text>
            <Text style={styles.value}>{sampleDriverRequest.distanceKm.toFixed(1)} km</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>ETA den diem don</Text>
            <Text style={styles.value}>{Math.ceil(sampleDriverRequest.etaMin)} min</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Cuoc du kien</Text>
            <Text style={styles.value}>${sampleDriverRequest.estimatedFare.toFixed(2)}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Phi nen tang</Text>
            <Text style={styles.value}>$0.70</Text>
          </View>

          <View style={styles.noteRow}>
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={AppTheme.colors.textMuted} />
            <Text style={styles.noteText}>{sampleDriverRequest.note}</Text>
          </View>
        </AppCard>
      </ScrollView>

      <View style={styles.footerRow}>
        <AppButton
          label="Tu choi"
          variant="ghost"
          onPress={() => router.replace(AppRoutes.driverHome)}
          style={styles.footerBtn}
        />
        <AppButton
          label="Nhan chuyen"
          variant="secondary"
          onPress={() => router.replace(AppRoutes.driverHome)}
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
  map: {
    flex: 1,
  },
  card: {
    gap: 10,
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
