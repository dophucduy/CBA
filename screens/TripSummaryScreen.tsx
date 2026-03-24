import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { StarRating } from '@/components/common/StarRating';
import { AppTheme } from '@/constants/app-theme';
import { AppRoutes } from '@/navigation/routes';

export default function TripSummaryScreen() {
  const router = useRouter();
  const { total } = useLocalSearchParams<{ total?: string }>();
  const [rating, setRating] = useState(5);

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
          <Text style={styles.value}>3.8 km</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Duration</Text>
          <Text style={styles.value}>12 mins</Text>
        </View>
      </AppCard>

      <AppCard style={styles.ratingCard}>
        <Text style={styles.ratingTitle}>Rate your driver</Text>
        <StarRating value={rating} onChange={setRating} />
        <Text style={styles.ratingHint}>You selected {rating} / 5</Text>
      </AppCard>

      <View style={styles.footer}>
        <AppButton label="Done" onPress={() => router.replace(AppRoutes.history)} />
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
