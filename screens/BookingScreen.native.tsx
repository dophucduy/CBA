import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { LocationComboBox } from '@/components/common/LocationComboBox';
import { AppTheme } from '@/constants/app-theme';
import { placeOptions, rideTypes } from '@/constants/dummy-data';
import { useRouteInfo } from '@/hooks/use-route-info';
import { useUserLocation } from '@/hooks/use-user-location';
import { AppRoutes } from '@/navigation/routes';

export default function BookingScreen() {
  const router = useRouter();
  const { rideId, destinationName, destinationLat, destinationLng } = useLocalSearchParams<{
    rideId?: string;
    destinationName?: string;
    destinationLat?: string;
    destinationLng?: string;
  }>();
  const { coords } = useUserLocation();
  const selectedRide = rideTypes.find((item) => item.id === rideId) ?? rideTypes[0];
  const [pickupText, setPickupText] = useState('Current location');
  const [destinationText, setDestinationText] = useState(destinationName ?? '');
  const [selectedDestination, setSelectedDestination] = useState<(typeof placeOptions)[number] | null>(
    destinationLat && destinationLng
      ? {
          id: 'from-select-ride',
          label: destinationName ?? 'Selected destination',
          coords: {
            latitude: Number(destinationLat),
            longitude: Number(destinationLng),
          },
        }
      : null,
  );

  const pickupOptions = useMemo(
    () => [
      {
        id: 'current-location',
        label: 'Current location',
        coords: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
      },
      ...placeOptions,
    ],
    [coords.latitude, coords.longitude],
  );

  const destination = selectedDestination?.coords ?? {
    latitude: coords.latitude + 0.012,
    longitude: coords.longitude - 0.009,
  };
  const { route, loadingRoute } = useRouteInfo(coords, destination);

  const serviceFee = 0.9;
  const total = selectedRide.price + serviceFee;

  return (
    <View style={styles.container}>
      <View style={styles.inputsWrap}>
        <LocationComboBox
          icon="pin-outline"
          placeholder="Pickup location"
          value={pickupText}
          onChangeText={setPickupText}
          options={pickupOptions}
          origin={coords}
          onSelect={(option) => setPickupText(option.label)}
        />
        <LocationComboBox
          icon="flag-outline"
          placeholder="Enter destination"
          value={destinationText}
          onChangeText={(text) => {
            setDestinationText(text);
            setSelectedDestination(null);
          }}
          options={placeOptions}
          origin={coords}
          onSelect={(option) => {
            setDestinationText(option.label);
            setSelectedDestination(option);
          }}
        />
      </View>

      <MapView
        key={`${coords.latitude}-${coords.longitude}`}
        style={styles.map}
        initialRegion={{
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}>
        <Marker coordinate={{ latitude: coords.latitude, longitude: coords.longitude }} title="Pickup" />
        <Marker coordinate={destination} title="Destination" />
        <Polyline
          coordinates={route ? route.path : [coords, destination]}
          strokeWidth={5}
          strokeColor={AppTheme.colors.primary}
        />
      </MapView>

      <View style={styles.routeInfoWrap}>
        <AppCard style={styles.routeCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>Distance</Text>
            <Text style={styles.itemValue}>{route ? `${route.distanceKm.toFixed(1)} km` : '--'}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>ETA</Text>
            <Text style={styles.itemValue}>{route ? `${Math.ceil(route.durationMin)} min` : '--'}</Text>
          </View>
          {loadingRoute ? <Text style={styles.routeHint}>Calculating route...</Text> : null}
        </AppCard>
      </View>

      <View style={styles.stickyBottom}>
        <AppCard style={styles.summaryCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>Ride</Text>
            <Text style={styles.itemValue}>{selectedRide.name}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>Fare</Text>
            <Text style={styles.itemValue}>${selectedRide.price.toFixed(2)}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>Service fee</Text>
            <Text style={styles.itemValue}>${serviceFee.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>

          <View style={styles.paymentRow}>
            <Ionicons name="card-outline" size={18} color={AppTheme.colors.text} />
            <Text style={styles.paymentText}>Choose Visa or Cash in payment step</Text>
          </View>

          <AppButton
            label="Confirm booking"
            onPress={() =>
              router.push({
                pathname: AppRoutes.payment,
                params: {
                  total: total.toFixed(2),
                  rideName: selectedRide.name,
                  destinationName: destinationText || destinationName || 'Selected destination',
                  distance: route ? `${route.distanceKm.toFixed(1)} km` : '--',
                  eta: route ? `${Math.ceil(route.durationMin)} min` : '--',
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
  inputsWrap: {
    padding: 16,
    gap: 10,
  },
  map: {
    flex: 1,
  },
  routeInfoWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 262,
  },
  routeCard: {
    gap: 8,
  },
  stickyBottom: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
  },
  summaryCard: {
    borderRadius: AppTheme.radius.xl,
    gap: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemLabel: {
    color: AppTheme.colors.textMuted,
  },
  itemValue: {
    color: AppTheme.colors.text,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: AppTheme.colors.border,
    marginVertical: 3,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: AppTheme.colors.primary,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: 14,
    padding: 12,
  },
  paymentText: {
    color: AppTheme.colors.text,
    fontWeight: '600',
  },
  routeHint: {
    fontSize: 12,
    color: AppTheme.colors.textMuted,
  },
});
