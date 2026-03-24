import { useEffect, useState } from 'react';

import { LatLng } from '@/hooks/use-user-location';

type RouteInfo = {
  distanceKm: number;
  durationMin: number;
  path: LatLng[];
};

export function useRouteInfo(origin: LatLng, destination: LatLng | null) {
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  useEffect(() => {
    if (!destination) {
      setRoute(null);
      return;
    }

    let active = true;

    const fetchRoute = async () => {
      setLoadingRoute(true);

      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const json = await response.json();

        const firstRoute = json?.routes?.[0];
        if (!firstRoute || !active) {
          return;
        }

        setRoute({
          distanceKm: firstRoute.distance / 1000,
          durationMin: firstRoute.duration / 60,
          path: firstRoute.geometry.coordinates.map((item: [number, number]) => ({
            latitude: item[1],
            longitude: item[0],
          })),
        });
      } catch {
        if (active) {
          setRoute(null);
        }
      } finally {
        if (active) {
          setLoadingRoute(false);
        }
      }
    };

    fetchRoute();

    return () => {
      active = false;
    };
  }, [destination, origin.latitude, origin.longitude]);

  return {
    route,
    loadingRoute,
  };
}
