import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppTheme } from '@/constants/app-theme';
import { AppRoutes } from '@/navigation/routes';

type PaymentMethod = 'visa' | 'cash';

type PromoConfig = {
  code: string;
  discountRate: number;
};

const PROMO_CODES: PromoConfig[] = [
  { code: 'SAVE10', discountRate: 0.1 },
  { code: 'WELCOME20', discountRate: 0.2 },
];

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    total?: string;
    rideName?: string;
    destinationName?: string;
    distance?: string;
    eta?: string;
  }>();

  const baseTotal = Number(params.total ?? 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('visa');
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoConfig | null>(null);

  const discountValue = useMemo(() => {
    if (!appliedPromo) {
      return 0;
    }
    return baseTotal * appliedPromo.discountRate;
  }, [appliedPromo, baseTotal]);

  const finalAmount = Math.max(0, baseTotal - discountValue);

  const applyPromo = () => {
    const normalized = promoInput.trim().toUpperCase();
    const matched = PROMO_CODES.find((item) => item.code === normalized) ?? null;
    setAppliedPromo(matched);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment</Text>
      <Text style={styles.subtitle}>Choose payment method and confirm your booking</Text>

      <AppCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Payment method</Text>
        <View style={styles.methodRow}>
          <Pressable
            onPress={() => setPaymentMethod('visa')}
            style={[styles.methodCard, paymentMethod === 'visa' && styles.methodCardActive]}>
            <Ionicons name="card-outline" size={20} color={AppTheme.colors.text} />
            <Text style={styles.methodLabel}>Visa</Text>
            <Text style={styles.methodSub}>**** 1028</Text>
          </Pressable>

          <Pressable
            onPress={() => setPaymentMethod('cash')}
            style={[styles.methodCard, paymentMethod === 'cash' && styles.methodCardActive]}>
            <Ionicons name="cash-outline" size={20} color={AppTheme.colors.text} />
            <Text style={styles.methodLabel}>Cash</Text>
            <Text style={styles.methodSub}>Pay after ride</Text>
          </Pressable>
        </View>
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Promo code</Text>
        <View style={styles.promoRow}>
          <TextInput
            value={promoInput}
            onChangeText={setPromoInput}
            placeholder="Enter code"
            placeholderTextColor={AppTheme.colors.textMuted}
            autoCapitalize="characters"
            style={styles.promoInput}
          />
          <AppButton label="Apply" onPress={applyPromo} style={styles.applyButton} variant="ghost" />
        </View>
        <Text style={styles.promoHint}>
          {appliedPromo ? `Applied ${appliedPromo.code} (${Math.round(appliedPromo.discountRate * 100)}% off)` : 'Try SAVE10 or WELCOME20'}
        </Text>
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Booking summary</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Ride</Text>
          <Text style={styles.value}>{params.rideName ?? 'Selected ride'}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Destination</Text>
          <Text style={styles.value} numberOfLines={1}>{params.destinationName || 'Set destination'}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Distance / ETA</Text>
          <Text style={styles.value}>{params.distance ?? '--'} / {params.eta ?? '--'}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Subtotal</Text>
          <Text style={styles.value}>${baseTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Discount</Text>
          <Text style={styles.value}>-${discountValue.toFixed(2)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.rowBetween}>
          <Text style={styles.totalLabel}>Total to pay</Text>
          <Text style={styles.totalValue}>${finalAmount.toFixed(2)}</Text>
        </View>
      </AppCard>

      <View style={styles.footer}>
        <AppButton
          label="Process payment"
          onPress={() =>
            router.push({
              pathname: AppRoutes.paymentProcessing,
              params: {
                total: finalAmount.toFixed(2),
                paymentMethod,
                rideName: params.rideName,
                destinationName: params.destinationName,
                distance: params.distance,
                eta: params.eta,
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
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: AppTheme.colors.text,
  },
  subtitle: {
    color: AppTheme.colors.textMuted,
  },
  sectionCard: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.colors.text,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 10,
  },
  methodCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: 14,
    padding: 12,
    gap: 4,
    backgroundColor: '#F8FAFC',
  },
  methodCardActive: {
    borderColor: AppTheme.colors.primary,
    backgroundColor: '#EAFBF4',
  },
  methodLabel: {
    fontWeight: '700',
    color: AppTheme.colors.text,
  },
  methodSub: {
    color: AppTheme.colors.textMuted,
    fontSize: 12,
  },
  promoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  promoInput: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    color: AppTheme.colors.text,
  },
  applyButton: {
    width: 96,
  },
  promoHint: {
    color: AppTheme.colors.textMuted,
    fontSize: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  label: {
    color: AppTheme.colors.textMuted,
  },
  value: {
    color: AppTheme.colors.text,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: AppTheme.colors.border,
    marginVertical: 2,
  },
  totalLabel: {
    color: AppTheme.colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  totalValue: {
    color: AppTheme.colors.primary,
    fontWeight: '800',
    fontSize: 18,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 8,
  },
});
