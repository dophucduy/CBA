import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '@/constants/app-theme';

type EmptyStateProps = {
  title: string;
  subtitle: string;
};

export function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="car-outline" size={26} color={AppTheme.colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAFBF4',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: AppTheme.colors.text,
  },
  subtitle: {
    color: AppTheme.colors.textMuted,
    textAlign: 'center',
  },
});
