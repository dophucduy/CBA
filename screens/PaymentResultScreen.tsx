import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppTheme } from '@/constants/app-theme';
import { AppRoutes } from '@/navigation/routes';

export default function PaymentResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    status?: 'success' | 'failed';
    total?: string;
    paymentMethod?: 'visa' | 'cash';
    rideName?: string;
    destinationName?: string;
    distance?: string;
    eta?: string;
  }>();

  const isSuccess = params.status === 'success';

  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    const timer = setTimeout(() => {
      router.replace({
        pathname: AppRoutes.driverSearching,
        params: { total: params.total ?? '0.00' },
      });
    }, 1600);

    return () => clearTimeout(timer);
  }, [isSuccess, params.total, router]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: isSuccess ? '#DCFCE7' : '#FEE2E2' },
        ]}>
        <Ionicons
          name={isSuccess ? 'checkmark' : 'close'}
          size={36}
          color={isSuccess ? AppTheme.colors.success : AppTheme.colors.danger}
        />
      </View>

      <Text style={styles.title}>{isSuccess ? 'Payment Successful' : 'Payment Failed'}</Text>
      <Text style={styles.subtitle}>
        {isSuccess
          ? 'Your booking has been updated. Finding a driver now...'
          : 'Payment could not be completed. Please try another method or retry.'}
      </Text>

      <AppCard style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.value}>${Number(params.total ?? 0).toFixed(2)}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Method</Text>
          <Text style={styles.value}>{params.paymentMethod === 'cash' ? 'Cash' : 'Visa'}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Ride</Text>
          <Text style={styles.value}>{params.rideName ?? '--'}</Text>
        </View>
      </AppCard>

      <View style={styles.footer}>
        {isSuccess ? (
          <AppButton
            label="Go to driver searching"
            onPress={() => router.replace({ pathname: AppRoutes.driverSearching, params: { total: params.total ?? '0.00' } })}
          />
        ) : (
          <AppButton
            label="Back to payment"
            variant="secondary"
            onPress={() =>
              router.replace({
                pathname: AppRoutes.payment,
                params: {
                  total: params.total,
                  rideName: params.rideName,
                  destinationName: params.destinationName,
                  distance: params.distance,
                  eta: params.eta,
                },
              })
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: AppTheme.colors.text,
  },
  subtitle: {
    color: AppTheme.colors.textMuted,
    textAlign: 'center',
    maxWidth: 300,
  },
  card: {
    width: '100%',
    gap: 8,
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
    fontWeight: '700',
  },
  footer: {
    width: '100%',
    marginTop: 4,
  },
});
