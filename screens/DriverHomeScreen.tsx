import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { OsmMapEmbed } from '@/components/web/osm-map-embed';
import { AppTheme } from '@/constants/app-theme';
import { placeOptions, sampleDriverRequest } from '@/constants/dummy-data';
import { useUserLocation } from '@/hooks/use-user-location';
import { AppRoutes } from '@/navigation/routes';

type DriverStatus = 'offline' | 'running';

const kpiItems = [
  { id: 'trips', label: 'Chuyen hom nay', value: '7' },
  { id: 'earn', label: 'Doanh thu', value: '$92.4' },
  { id: 'online', label: 'Online', value: '3h 42m' },
] as const;

const workflowItems = [
  'Bat dau hanh trinh de mo nhan chuyen',
  'He thong quet yeu cau khach gan ban',
  'Xac nhan va xem chi tiet match chuyen',
] as const;

export default function DriverHomeScreen() {
  const router = useRouter();
  const { coords } = useUserLocation();
  const [status, setStatus] = useState<DriverStatus>('offline');
  const pickupCoords = placeOptions.find((item) => item.label === sampleDriverRequest.pickup)?.coords;

  const isRunning = status === 'running';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Driver Center</Text>
            <Text style={styles.subtitle}>Quan ly hanh trinh va nhan chuyen theo thoi gian thuc</Text>
          </View>
          <Pressable style={styles.headerAction} onPress={() => router.replace(AppRoutes.roleHome)}>
            <Ionicons name="swap-horizontal" size={18} color={AppTheme.colors.text} />
          </Pressable>
        </View>

        <AppCard style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: isRunning ? AppTheme.colors.success : AppTheme.colors.warning }]} />
            <Text style={styles.statusLabel}>Trang thai tai xe</Text>
            <Text style={styles.statusValue}>{isRunning ? 'Dang chay' : 'Dang dung'}</Text>
          </View>

          <Text style={styles.statusHint}>
            {isRunning
              ? 'Ban dang san sang nhan yeu cau moi trong khu vuc gan day'
              : 'Bat dau hanh trinh de mo tinh nang quet khach hang'}
          </Text>

          <AppButton
            label={isRunning ? 'Da bat dau hanh trinh' : 'Bat dau hanh trinh'}
            onPress={() => setStatus('running')}
            disabled={isRunning}
          />
        </AppCard>

        {pickupCoords ? (
          <View style={styles.mapCard}>
            <OsmMapEmbed latitude={coords.latitude} longitude={coords.longitude} destination={pickupCoords} zoom={13} />
          </View>
        ) : null}

        <View style={styles.kpiRow}>
          {kpiItems.map((item) => (
            <AppCard key={item.id} style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>{item.label}</Text>
              <Text style={styles.kpiValue}>{item.value}</Text>
            </AppCard>
          ))}
        </View>

        <AppCard style={styles.tipCard}>
          <View style={styles.tipTitleRow}>
            <Ionicons name="list-outline" size={18} color={AppTheme.colors.text} />
            <Text style={styles.tipTitle}>Workflow tai xe</Text>
          </View>
          {workflowItems.map((item, index) => (
            <View key={item} style={styles.workflowRow}>
              <View style={styles.workflowStepBadge}>
                <Text style={styles.workflowStepText}>{index + 1}</Text>
              </View>
              <Text style={styles.tipText}>{item}</Text>
            </View>
          ))}
        </AppCard>

        <AppCard style={styles.requestCard}>
          <Text style={styles.requestTitle}>Trang thai he thong</Text>
          <View style={styles.requestRow}>
            <Text style={styles.requestLabel}>Khach dang doi gan ban</Text>
            <Text style={styles.requestValue}>12</Text>
          </View>
          <View style={styles.requestRow}>
            <Text style={styles.requestLabel}>Do uu tien khu vuc</Text>
            <Text style={styles.requestValue}>Quan 1 - Quan 3</Text>
          </View>
          <View style={styles.requestRow}>
            <Text style={styles.requestLabel}>Ty le nhan chuyen</Text>
            <Text style={styles.requestValue}>94%</Text>
          </View>
        </AppCard>

        <View style={styles.footer}>
          <AppButton
            label="Quet tim khach hang"
            variant="secondary"
            disabled={!isRunning}
            onPress={() => router.push(AppRoutes.driverScanning)}
          />
        </View>
      </ScrollView>
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
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 29,
    fontWeight: '800',
    color: AppTheme.colors.text,
  },
  subtitle: {
    color: AppTheme.colors.textMuted,
  },
  statusCard: {
    gap: 10,
    borderColor: '#CDEBD8',
    backgroundColor: '#F8FFFB',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLabel: {
    color: AppTheme.colors.textMuted,
  },
  statusValue: {
    color: AppTheme.colors.text,
    fontWeight: '800',
    marginLeft: 'auto',
  },
  statusHint: {
    color: AppTheme.colors.textMuted,
  },
  mapCard: {
    width: '100%',
    height: 180,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    backgroundColor: '#EAF2F8',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 8,
  },
  kpiLabel: {
    color: AppTheme.colors.textMuted,
    fontSize: 12,
  },
  kpiValue: {
    color: AppTheme.colors.text,
    fontWeight: '800',
  },
  tipCard: {
    gap: 8,
  },
  tipTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tipTitle: {
    color: AppTheme.colors.text,
    fontWeight: '700',
  },
  workflowRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  workflowStepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EAFBF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CDEBD8',
  },
  workflowStepText: {
    color: AppTheme.colors.primary,
    fontWeight: '800',
    fontSize: 12,
  },
  tipText: {
    color: AppTheme.colors.textMuted,
    flex: 1,
  },
  requestCard: {
    gap: 8,
  },
  requestTitle: {
    color: AppTheme.colors.text,
    fontWeight: '800',
  },
  requestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  requestLabel: {
    color: AppTheme.colors.textMuted,
  },
  requestValue: {
    color: AppTheme.colors.text,
    fontWeight: '700',
  },
  footer: {
    marginTop: 2,
  },
});
