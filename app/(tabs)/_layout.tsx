import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { AppTheme } from '@/constants/app-theme';
import { getDefaultRouteForRole } from '@/constants/auth';
import { Colors } from '@/constants/theme';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppRoutes } from '@/navigation/routes';

export default function TabLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { session, loading } = useAuthSession();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!session) {
      router.replace(AppRoutes.login);
      return;
    }

    if (session.role !== 'customer') {
      router.replace(getDefaultRouteForRole(session.role));
    }
  }, [loading, router, session]);

  if (loading || !session || session.role !== 'customer') {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.loadingText}>Loading customer workspace...</Text>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="time-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="person-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.colors.background,
  },
  loadingText: {
    color: AppTheme.colors.textMuted,
    fontWeight: '600',
  },
});
