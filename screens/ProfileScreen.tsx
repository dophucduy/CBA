import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppTheme } from '@/constants/app-theme';
import { clearAuthSession } from '@/constants/storage';
import { AppRoutes } from '@/navigation/routes';

const settings = [
  { id: 'wallet', icon: 'wallet-outline', label: 'Wallet' },
  { id: 'promo', icon: 'pricetag-outline', label: 'Promotions' },
  { id: 'support', icon: 'help-circle-outline', label: 'Support' },
  { id: 'security', icon: 'shield-checkmark-outline', label: 'Privacy & Security' },
] as const;

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await clearAuthSession();
    router.replace(AppRoutes.login);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <AppCard style={styles.userCard}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>Alex Morgan</Text>
        <Text style={styles.email}>alex.morgan@email.com</Text>
      </AppCard>

      <AppCard style={styles.settingsCard}>
        {settings.map((item) => (
          <Pressable key={item.id} style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={20}
                color={AppTheme.colors.text}
              />
              <Text style={styles.settingLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={AppTheme.colors.textMuted} />
          </Pressable>
        ))}
      </AppCard>

      <View style={styles.switchWrap}>
        <AppButton label="Switch role" onPress={() => router.push(AppRoutes.roleHome)} variant="ghost" />
      </View>

      <View style={styles.logoutWrap}>
        <AppButton label="Logout" onPress={handleLogout} variant="secondary" />
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
    fontSize: 28,
    fontWeight: '800',
    color: AppTheme.colors.text,
  },
  userCard: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 22,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
  },
  name: {
    fontSize: 19,
    fontWeight: '800',
    color: AppTheme.colors.text,
  },
  email: {
    color: AppTheme.colors.textMuted,
  },
  settingsCard: {
    paddingVertical: 8,
  },
  settingItem: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingLabel: {
    color: AppTheme.colors.text,
    fontWeight: '600',
  },
  switchWrap: {
    marginTop: 'auto',
  },
  logoutWrap: {
    marginBottom: 8,
  },
});
