import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppTheme } from '@/constants/app-theme';
import { getDefaultRouteForRole, getRoleDescription, getRoleLabel, type DemoAccount } from '@/constants/auth';
import { clearAuthSession } from '@/constants/storage';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useManagedAccounts } from '@/hooks/use-managed-accounts';
import { AppRoutes } from '@/navigation/routes';

export default function RoleHomeScreen() {
  const router = useRouter();
  const { session, loading } = useAuthSession();
  const { accounts, loading: accountsLoading, assignRole } = useManagedAccounts();
  const [statusMessage, setStatusMessage] = useState('');
  const [updatingAccountId, setUpdatingAccountId] = useState<string | null>(null);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!session) {
      router.replace(AppRoutes.login);
      return;
    }

    if (session.role !== 'admin') {
      router.replace(getDefaultRouteForRole(session.role));
    }
  }, [loading, router, session]);

  const handleLogout = async () => {
    await clearAuthSession();
    router.replace(AppRoutes.login);
  };

  const handleAssignRole = async (account: DemoAccount, nextRole: 'customer' | 'driver') => {
    setUpdatingAccountId(account.id);
    setStatusMessage('');

    await assignRole(account.id, nextRole);
    setStatusMessage(`${account.name} is now assigned as ${getRoleLabel(nextRole)}.`);
    setUpdatingAccountId(null);
  };

  const driverCount = accounts.filter((account) => account.role === 'driver').length;
  const customerCount = accounts.filter((account) => account.role === 'customer').length;

  if (loading || accountsLoading || !session || session.role !== 'admin') {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.loadingText}>Loading admin center...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(520)} style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.eyebrow}>ADMIN CENTER</Text>
              <Text style={styles.title}>Welcome, {session.name}</Text>
              <Text style={styles.subtitle}>Assign rider accounts to the driver workspace from here.</Text>
            </View>
            <View style={styles.heroIconWrap}>
              <Ionicons name="key-outline" size={22} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.highlightRow}>
            <View style={styles.highlightItem}>
              <Ionicons name="people-outline" size={15} color={AppTheme.colors.primary} />
              <Text style={styles.highlightLabel}>Accounts</Text>
              <Text style={styles.highlightValue}>{accounts.length}</Text>
            </View>
            <View style={styles.highlightItem}>
              <Ionicons name="car-sport-outline" size={15} color={AppTheme.colors.primary} />
              <Text style={styles.highlightLabel}>Drivers</Text>
              <Text style={styles.highlightValue}>{driverCount}</Text>
            </View>
            <View style={styles.highlightItem}>
              <Ionicons name="person-outline" size={15} color={AppTheme.colors.primary} />
              <Text style={styles.highlightLabel}>Customers</Text>
              <Text style={styles.highlightValue}>{customerCount}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(110).duration(520)}>
          <AppCard style={styles.roleCard}>
            <Text style={styles.cardTitle}>Assign users to driver</Text>
            <Text style={styles.cardText}>
              Admin can promote any non-admin user into the driver role and switch them back to customer later.
            </Text>
            {statusMessage ? <Text style={styles.statusMessage}>{statusMessage}</Text> : null}
          </AppCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(190).duration(520)}>
          <View style={styles.accountList}>
            {accounts.map((account) => {
              const isAdmin = account.role === 'admin';
              const isUpdating = updatingAccountId === account.id;

              return (
                <AppCard key={account.id} style={styles.accountCard}>
                  <View style={styles.accountHeader}>
                    <View style={styles.accountCopy}>
                      <Text style={styles.accountName}>{account.name}</Text>
                      <Text style={styles.accountDescription}>{getRoleDescription(account.role)}</Text>
                    </View>
                    <Text
                      style={[
                        styles.accountBadge,
                        account.role === 'admin'
                          ? styles.accountBadgeAdmin
                          : account.role === 'driver'
                            ? styles.accountBadgeDriver
                            : styles.accountBadgeCustomer,
                      ]}>
                      {getRoleLabel(account.role)}
                    </Text>
                  </View>

                  <View style={styles.credentialRow}>
                    <Text style={styles.credentialLabel}>Email</Text>
                    <Text style={styles.credentialValue}>{account.email}</Text>
                  </View>
                  <View style={styles.credentialRow}>
                    <Text style={styles.credentialLabel}>Password</Text>
                    <Text style={styles.credentialValue}>{account.password}</Text>
                  </View>

                  {isAdmin ? (
                    <View style={styles.lockedRow}>
                      <Ionicons name="lock-closed-outline" size={16} color={AppTheme.colors.textMuted} />
                      <Text style={styles.lockedText}>Admin role is locked.</Text>
                    </View>
                  ) : (
                    <View style={styles.actionRow}>
                      <AppButton
                        label={account.role === 'driver' ? 'Already driver' : 'Assign as driver'}
                        onPress={() => handleAssignRole(account, 'driver')}
                        variant="secondary"
                        disabled={isUpdating || account.role === 'driver'}
                        style={styles.actionButton}
                      />
                      <AppButton
                        label={account.role === 'customer' ? 'Already customer' : 'Set as customer'}
                        onPress={() => handleAssignRole(account, 'customer')}
                        variant="ghost"
                        disabled={isUpdating || account.role === 'customer'}
                        style={styles.actionButton}
                      />
                    </View>
                  )}
                </AppCard>
              );
            })}
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <AppButton label="Logout" onPress={handleLogout} variant="secondary" />
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
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.colors.background,
    paddingHorizontal: 24,
  },
  loadingText: {
    color: AppTheme.colors.textMuted,
    fontWeight: '600',
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AppTheme.colors.text,
  },
  cardText: {
    color: AppTheme.colors.textMuted,
  },
  statusMessage: {
    color: AppTheme.colors.primary,
    fontWeight: '700',
  },
  accountList: {
    gap: 10,
  },
  accountCard: {
    gap: 10,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  accountCopy: {
    flex: 1,
    gap: 4,
  },
  accountName: {
    color: AppTheme.colors.text,
    fontWeight: '800',
    fontSize: 17,
  },
  accountDescription: {
    color: AppTheme.colors.textMuted,
    fontWeight: '600',
  },
  accountBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '800',
  },
  accountBadgeAdmin: {
    backgroundColor: '#DBEAFE',
    color: '#1D4ED8',
  },
  accountBadgeCustomer: {
    backgroundColor: '#DCFCE7',
    color: '#15803D',
  },
  accountBadgeDriver: {
    backgroundColor: '#FCE7F3',
    color: '#BE185D',
  },
  credentialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  credentialLabel: {
    color: AppTheme.colors.textMuted,
    fontWeight: '600',
  },
  credentialValue: {
    color: AppTheme.colors.text,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lockedText: {
    color: AppTheme.colors.textMuted,
    fontWeight: '600',
  },
  footer: {
    marginTop: 4,
  },
});
