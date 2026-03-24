import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { EmptyState } from '@/components/common/EmptyState';
import { AppTheme } from '@/constants/app-theme';
import { historyTrips } from '@/constants/dummy-data';

export default function HistoryRoute() {
  const [refreshing, setRefreshing] = useState(false);
  const trips = useMemo(() => historyTrips, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={<Text style={styles.title}>Trip history</Text>}
        ListEmptyComponent={
          <EmptyState title="No trips yet" subtitle="Your completed rides will appear here" />
        }
        renderItem={({ item }) => (
          <AppCard style={styles.itemCard}>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.route} numberOfLines={1}>
              {item.from} - {item.to}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{item.distance}</Text>
              <Text style={styles.metaText}>{item.duration}</Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            </View>
          </AppCard>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: AppTheme.colors.text,
    marginBottom: 6,
  },
  itemCard: {
    gap: 8,
  },
  date: {
    color: AppTheme.colors.textMuted,
    fontSize: 12,
  },
  route: {
    color: AppTheme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    color: AppTheme.colors.textMuted,
    fontSize: 13,
  },
  price: {
    color: AppTheme.colors.primary,
    fontWeight: '800',
  },
});
