import type { CSSProperties } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

type OsmMapEmbedProps = {
  latitude: number;
  longitude: number;
  zoom?: number;
  destination?: {
    latitude: number;
    longitude: number;
  };
};

function zoomToDelta(zoom: number) {
  // Approximate view span for OpenStreetMap embed bbox.
  return Math.max(0.002, 60 / Math.pow(2, zoom));
}

function toMercatorY(lat: number) {
  const limited = Math.max(-85, Math.min(85, lat));
  const radians = (limited * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + radians / 2));
}

export function OsmMapEmbed({ latitude, longitude, zoom = 15, destination }: OsmMapEmbedProps) {
  const delta = zoomToDelta(zoom);
  const minLon = destination ? Math.min(longitude, destination.longitude) : longitude;
  const maxLon = destination ? Math.max(longitude, destination.longitude) : longitude;
  const minLat = destination ? Math.min(latitude, destination.latitude) : latitude;
  const maxLat = destination ? Math.max(latitude, destination.latitude) : latitude;

  const lonPadding = destination ? Math.max(0.01, (maxLon - minLon) * 0.35) : delta;
  const latPadding = destination ? Math.max(0.01, (maxLat - minLat) * 0.35) : delta;

  const left = minLon - lonPadding;
  const right = maxLon + lonPadding;
  const top = maxLat + latPadding;
  const bottom = minLat - latPadding;

  const bbox = `${left},${bottom},${right},${top}`;
  const firstMarker = `${latitude}%2C${longitude}`;
  const secondMarker = destination
    ? `&marker=${destination.latitude}%2C${destination.longitude}`
    : '';
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${firstMarker}${secondMarker}`;

  const topMerc = toMercatorY(top);
  const bottomMerc = toMercatorY(bottom);

  const startX = ((longitude - left) / (right - left)) * 100;
  const startY = ((topMerc - toMercatorY(latitude)) / (topMerc - bottomMerc)) * 100;
  const endX = destination ? ((destination.longitude - left) / (right - left)) * 100 : startX;
  const endY = destination
    ? ((topMerc - toMercatorY(destination.latitude)) / (topMerc - bottomMerc)) * 100
    : startY;

  const clamp = (value: number) => Math.max(0, Math.min(100, value));

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.container}>
      <iframe
        src={src}
        style={styles.iframe as unknown as CSSProperties}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="OpenStreetMap"
      />
      {destination ? (
        <View style={styles.overlay} pointerEvents="none">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line
              x1={clamp(startX)}
              y1={clamp(startY)}
              x2={clamp(endX)}
              y2={clamp(endY)}
              stroke="#00A86B"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx={clamp(startX)} cy={clamp(startY)} r="2.1" fill="#00A86B" />
            <circle cx={clamp(endX)} cy={clamp(endY)} r="2.1" fill="#0A84FF" />
          </svg>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#EAF2F8',
  },
  iframe: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
    zIndex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
});
