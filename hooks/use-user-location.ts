import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

export type LatLng = {
  latitude: number;
  longitude: number;
};

const DEFAULT_COORDS: LatLng = {
  latitude: 10.7769,
  longitude: 106.7009,
};

export function useUserLocation() {
  const [coords, setCoords] = useState<LatLng>(DEFAULT_COORDS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setError('Location permission was denied');
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCoords({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
    } catch {
      setError('Unable to fetch current location');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  return {
    coords,
    loading,
    error,
    refreshLocation,
  };
}
