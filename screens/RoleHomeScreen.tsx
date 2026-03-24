import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppTheme } from '@/constants/app-theme';
import { AppRoutes } from '@/navigation/routes';

const highlights = [
  { id: 'wallet', icon: 'wallet-outline', label: 'Vi tien ich', value: '$84.20' },
  { id: 'promo', icon: 'pricetag-outline', label: 'Uu dai', value: '3 voucher' },
  { id: 'safe', icon: 'shield-checkmark-outline', label: 'An toan', value: 'Verified' },
] as const;

export default function RoleHomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(520)} style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.eyebrow}>CARBOOK APP</Text>
              <Text style={styles.title}>Xin chao, Alex</Text>
              <Text style={styles.subtitle}>Chon vai tro de bat dau 1 ngay van hanh</Text>
            </View>
            <View style={styles.heroIconWrap}>
              <Ionicons name="swap-horizontal" size={22} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.highlightRow}>
            {highlights.map((item) => (
              <View key={item.id} style={styles.highlightItem}>
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={15}
                  color={AppTheme.colors.primary}
                />
                <Text style={styles.highlightLabel}>{item.label}</Text>
                <Text style={styles.highlightValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(110).duration(520)}>
          <AppCard style={styles.roleCard}>
            <View style={styles.roleHead}>
              <View style={styles.iconWrapPrimary}>
                <Ionicons name="person-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.roleHeadTextWrap}>
                <Text style={styles.cardTitle}>Khach hang</Text>
                <Text style={styles.cardText}>Dat xe nhanh, theo doi tai xe va thanh toan trong 1 luong.</Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <Text style={styles.featureText}>Map live</Text>
              <Text style={styles.featureDot}>•</Text>
              <Text style={styles.featureText}>Goi xe 1 cham</Text>
              <Text style={styles.featureDot}>•</Text>
              <Text style={styles.featureText}>Lich su chuyen</Text>
            </View>

            <AppButton label="Vao giao dien khach" onPress={() => router.push(AppRoutes.home)} />
          </AppCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(190).duration(520)}>
          <AppCard style={styles.roleCard}>
            <View style={styles.roleHead}>
              <View style={styles.iconWrapSecondary}>
                <Ionicons name="car-sport-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.roleHeadTextWrap}>
                <Text style={styles.cardTitle}>Tai xe</Text>
                <Text style={styles.cardText}>Bat dau hanh trinh, quet khach theo khu vuc va nhan chuyen.</Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <Text style={styles.featureText}>Trang thai online</Text>
              <Text style={styles.featureDot}>•</Text>
              <Text style={styles.featureText}>Scan tu dong</Text>
              <Text style={styles.featureDot}>•</Text>
              <Text style={styles.featureText}>Match thong minh</Text>
            </View>

            <AppButton
              label="Vao giao dien tai xe"
              variant="secondary"
              onPress={() => router.push(AppRoutes.driverHome)}
            />
          </AppCard>
        </Animated.View>

        <Pressable style={styles.footNoteCard}>
          <Ionicons name="notifications-outline" size={18} color={AppTheme.colors.textMuted} />
          <Text style={styles.footNoteText}>Ban co 2 thong bao van hanh moi</Text>
          <Ionicons name="chevron-forward" size={16} color={AppTheme.colors.textMuted} />
        </Pressable>
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
    paddingBottom: 22,
  },
  heroCard: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: '#EAFBF4',
    borderWidth: 1,
    borderColor: '#C7F0DD',
    gap: 12,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  eyebrow: {
    color: AppTheme.colors.primary,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  heroIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.colors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: AppTheme.colors.text,
  },
  subtitle: {
    color: AppTheme.colors.textMuted,
  },
  highlightRow: {
    flexDirection: 'row',
    gap: 8,
  },
  highlightItem: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7EFE2',
    padding: 10,
    gap: 3,
  },
  highlightLabel: {
    fontSize: 11,
    color: AppTheme.colors.textMuted,
  },
  highlightValue: {
    color: AppTheme.colors.text,
    fontWeight: '800',
    fontSize: 13,
  },
  roleCard: {
    gap: 10,
  },
  roleHead: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  roleHeadTextWrap: {
    flex: 1,
    gap: 2,
  },
  iconWrapPrimary: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.colors.primary,
  },
  iconWrapSecondary: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.colors.secondary,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AppTheme.colors.text,
  },
  cardText: {
    color: AppTheme.colors.textMuted,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureText: {
    color: AppTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  featureDot: {
    color: AppTheme.colors.primary,
    fontSize: 14,
  },
  footNoteCard: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  footNoteText: {
    color: AppTheme.colors.textMuted,
    flex: 1,
    fontWeight: '600',
  },
});
