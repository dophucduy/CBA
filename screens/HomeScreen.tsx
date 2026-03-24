import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { LocationComboBox } from '@/components/common/LocationComboBox';
import { OsmMapEmbed } from '@/components/web/osm-map-embed';
import { AppTheme } from '@/constants/app-theme';
import { PlaceOption, homeRideOptions, placeOptions } from '@/constants/dummy-data';
import { useUserLocation } from '@/hooks/use-user-location';
import { AppRoutes } from '@/navigation/routes';

export default function HomeScreen() {
  const router = useRouter();
  const { coords, loading, refreshLocation } = useUserLocation();
  const [whereTo, setWhereTo] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<PlaceOption | null>(null);
  const [selectedRide, setSelectedRide] = useState<string>(homeRideOptions[0].id);

  const selectedRideOption = homeRideOptions.find((item) => item.id === selectedRide) ?? homeRideOptions[0];

  return (
    <View style={styles.container}>
      <View style={styles.mapWrap}>
        <OsmMapEmbed
          latitude={coords.latitude}
          longitude={coords.longitude}
          destination={selectedDestination?.coords}
          zoom={15}
        />
      </View>

      <View style={styles.overlay}>
        <View style={styles.searchWrap}>
          <LocationComboBox
            icon="search"
            placeholder="Where to?"
            value={whereTo}
            onChangeText={(text) => {
              setWhereTo(text);
              setSelectedDestination(null);
            }}
            options={placeOptions}
            origin={coords}
            onSelect={(option) => {
              setWhereTo(option.label);
              setSelectedDestination(option);
            }}
          />
        </View>

        <Pressable style={styles.locationBtn} onPress={refreshLocation}>
          <Ionicons name="locate" size={20} color={AppTheme.colors.text} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.locationHint}>
          <Text style={styles.locationHintText}>Getting your current location...</Text>
        </View>
      ) : null}

      <Animated.View entering={FadeInUp.delay(120).duration(600)} style={styles.bottomArea}>
        <AppCard style={styles.bottomCard}>
          <Text style={styles.sectionTitle}>Choose ride type</Text>
          <View style={styles.rideOptionsRow}>
            {homeRideOptions.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setSelectedRide(item.id)}
                style={[
                  styles.rideOption,
                  selectedRide === item.id && styles.rideOptionActive,
                ]}>
                <View style={styles.rideIconWrap}>
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={20}
                    color={selectedRide === item.id ? '#FFFFFF' : AppTheme.colors.primary}
                  />
                </View>
                <Text style={styles.rideLabel}>{item.label}</Text>
                <Text style={styles.rideEstimate}>{item.estimate}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceHint}>Estimated fare</Text>
            <Text style={styles.priceValue}>{selectedRideOption.estimate}</Text>
          </View>

          <AppButton
            label="Book a ride"
            onPress={() =>
              router.push({
                pathname: AppRoutes.selectRide,
                params: {
                  destinationName: whereTo,
                  destinationLat: selectedDestination?.coords.latitude,
                  destinationLng: selectedDestination?.coords.longitude,
                },
              })
            }
          />
        </AppCard>
      </Animated.View>

      <Pressable style={styles.fab} onPress={() => router.push(AppRoutes.booking)}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </Pressable>
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
  locationHint: {
    position: 'absolute',
    top: 122,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  locationHintText: {
    color: AppTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  searchWrap: {
    flex: 1,
  },
  locationBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    ...AppTheme.shadow.card,
  },
  bottomArea: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  bottomCard: {
    borderRadius: AppTheme.radius.xl,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppTheme.colors.text,
  },
  rideOptionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rideOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    gap: 4,
  },
  rideOptionActive: {
    borderColor: AppTheme.colors.primary,
    backgroundColor: '#EAFBF4',
  },
  rideIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAFBF4',
  },
  rideLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: AppTheme.colors.text,
  },
  rideEstimate: {
    fontSize: 12,
    color: AppTheme.colors.textMuted,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceHint: {
    color: AppTheme.colors.textMuted,
  },
  priceValue: {
    color: AppTheme.colors.text,
    fontWeight: '800',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 240,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...AppTheme.shadow.card,
  },
});
