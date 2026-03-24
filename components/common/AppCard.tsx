import { PropsWithChildren } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { AppTheme } from '@/constants/app-theme';

type AppCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function AppCard({ children, style }: AppCardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: AppTheme.colors.surface,
          borderRadius: AppTheme.radius.lg,
          padding: AppTheme.spacing.md,
          borderWidth: 1,
          borderColor: AppTheme.colors.border,
          ...AppTheme.shadow.card,
        },
        style,
      ]}>
      {children}
    </View>
  );
}
