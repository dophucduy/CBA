import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { StarRating } from '@/components/common/StarRating';
import { AppTheme } from '@/constants/app-theme';
import { addTripToHistory, completeRideRequest } from '@/constants/storage';
import { AppRoutes } from '@/navigation/routes';

function formatTripDate(date: Date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

export default function TripSummaryScreen() {
  const router = useRouter();
  const { requestId, bookingId, total, pickupName, destinationName, distance, eta } = useLocalSearchParams<{
    requestId?: string;
    bookingId?: string;
    total?: string;
    pickupName?: string;
    destinationName?: string;
    distance?: string;
    eta?: string;
  }>();
  const [rating, setRating] = useState(5);
  const [saving, setSaving] = useState(false);

  const handleDone = async () => {
    const price = Number(total ?? 0);

    setSaving(true);
    await addTripToHistory({
      id: bookingId ?? `trip-${Date.now()}`,
      date: formatTripDate(new Date()),
      from: pickupName ?? 'Current location',
      to: destinationName ?? 'Selected destination',
      price: Number.isFinite(price) ? price : 0,
      distance: distance ?? '--',
      duration: eta ?? '--',
    });

    if (requestId) {
      await completeRideRequest(requestId);
    }

    setSaving(false);
    router.replace(AppRoutes.history);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trip complete</Text>
      <Text style={styles.subtitle}>Thanks for riding with Car Booking App</Text>

      <AppCard style={styles.summaryCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Total price</Text>
          <Text style={styles.value}>${total ?? '7.40'}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Distance</Text>
          <Text style={styles.value}>{distance ?? '--'}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Duration</Text>
          <Text style={styles.value}>{eta ?? '--'}</Text>
        </View>
      </AppCard>

      <AppCard style={styles.ratingCard}>
        <Text style={styles.ratingTitle}>Rate your driver</Text>
        <StarRating value={rating} onChange={setRating} />
        <Text style={styles.ratingHint}>You selected {rating} / 5</Text>
      </AppCard>

      <View style={styles.footer}>
        <AppButton label="Done" onPress={handleDone} loading={saving} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
    padding: 16,
    gap: 14,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: AppTheme.colors.text,
    marginTop: 8,
  },
  subtitle: {
    color: AppTheme.colors.textMuted,
    marginBottom: 4,
  },
  summaryCard: {
    gap: 10,
  },
  ratingCard: {
    gap: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: AppTheme.colors.textMuted,
  },
  value: {
    color: AppTheme.colors.text,
    fontWeight: '800',
  },
  ratingTitle: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: AppTheme.colors.text,
  },
  ratingHint: {
    textAlign: 'center',
    color: AppTheme.colors.textMuted,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 8,
  },
});
