import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { LocationComboBox } from '@/components/common/LocationComboBox';
import { AppTheme } from '@/constants/app-theme';
import { PlaceOption, RideType, placeOptions, rideTypes } from '@/constants/dummy-data';
import { useRouteInfo } from '@/hooks/use-route-info';
import { useUserLocation } from '@/hooks/use-user-location';
import { AppRoutes } from '@/navigation/routes';

export default function SelectRideScreen() {
  const router = useRouter();
  const [selectedRide, setSelectedRide] = useState<RideType>(rideTypes[0]);
  const [destinationText, setDestinationText] = useState('');
  const [destination, setDestination] = useState<PlaceOption | null>(null);
  const [editingDestination, setEditingDestination] = useState(false);
  const { coords } = useUserLocation();
  const { route, loadingRoute } = useRouteInfo(coords, destination?.coords ?? null);

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={rideTypes}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <Text style={styles.title}>Select your ride</Text>
            <LocationComboBox
              icon="search"
              placeholder="Where to?"
              value={destinationText}
              onChangeText={(text) => {
                setDestinationText(text);
                setDestination(null);
              }}
              options={placeOptions}
              origin={coords}
              onFocusChange={setEditingDestination}
              onSelect={(option) => {
                setDestinationText(option.label);
                setDestination(option);
              }}
            />

            <View style={styles.mapWrap}>
              <MapView
                key={`${coords.latitude}-${coords.longitude}-${destination?.id ?? 'none'}`}
                style={styles.map}
                initialRegion={{
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                  latitudeDelta: 0.06,
                  longitudeDelta: 0.06,
                }}>
                <Marker coordinate={coords} title="Pickup" />
                {destination ? <Marker coordinate={destination.coords} title={destination.label} /> : null}
                {destination ? (
                  <Polyline
                    coordinates={route ? route.path : [coords, destination.coords]}
                    strokeWidth={5}
                    strokeColor={AppTheme.colors.primary}
                  />
                ) : null}
              </MapView>
            </View>

            <AppCard style={styles.routeCard}>
              <View style={styles.routeRow}>
                <Text style={styles.routeLabel}>Distance</Text>
                <Text style={styles.routeValue}>{route ? `${route.distanceKm.toFixed(1)} km` : '--'}</Text>
              </View>
              <View style={styles.routeRow}>
                <Text style={styles.routeLabel}>ETA</Text>
                <Text style={styles.routeValue}>{route ? `${Math.ceil(route.durationMin)} min` : '--'}</Text>
              </View>
              {loadingRoute ? <Text style={styles.routeHint}>Calculating route...</Text> : null}
            </AppCard>
          </View>
        }
        renderItem={({ item }) => {
          const isSelected = item.id === selectedRide.id;
          return (
            <Pressable onPress={() => setSelectedRide(item)}>
              <AppCard
                style={[
                  styles.itemCard,
                  isSelected && {
                    borderColor: AppTheme.colors.primary,
                    borderWidth: 2,
                    backgroundColor: '#EEFCF6',
                  },
                ]}>
                <Image source={{ uri: item.image }} style={styles.carImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                  <Text style={styles.itemEta}>ETA {item.eta}</Text>
                </View>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              </AppCard>
            </Pressable>
          );
        }}
      />

      <View style={styles.footer}>
        <AppButton
          label={`Continue with ${selectedRide.name}`}
          disabled={!destination || editingDestination}
          onPress={() =>
            router.push({
              pathname: AppRoutes.booking,
              params: {
                rideId: selectedRide.id,
                destinationName: destination?.label ?? destinationText,
                destinationLat: destination?.coords.latitude,
                destinationLng: destination?.coords.longitude,
              },
            })
          }
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
  listContent: {
    padding: AppTheme.spacing.md,
    paddingBottom: 110,
    gap: 12,
  },
  headerWrap: {
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: AppTheme.colors.text,
    marginBottom: 6,
  },
  mapWrap: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  map: {
    flex: 1,
  },
  routeCard: {
    gap: 8,
  },
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  routeLabel: {
    color: AppTheme.colors.textMuted,
  },
  routeValue: {
    color: AppTheme.colors.text,
    fontWeight: '700',
  },
  routeHint: {
    fontSize: 12,
    color: AppTheme.colors.textMuted,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  carImage: {
    width: 84,
    height: 62,
    borderRadius: 12,
  },
  itemInfo: {
    flex: 1,
    gap: 3,
  },
  itemName: {
    fontSize: 17,
    fontWeight: '700',
    color: AppTheme.colors.text,
  },
  itemDesc: {
    color: AppTheme.colors.textMuted,
    fontSize: 13,
  },
  itemEta: {
    color: AppTheme.colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: AppTheme.colors.text,
  },
  footer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
  },
});
