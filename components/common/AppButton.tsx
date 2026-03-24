import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { AppTheme } from '@/constants/app-theme';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle;
  loading?: boolean;
  disabled?: boolean;
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  style,
  loading,
  disabled,
}: AppButtonProps) {
  const variants = {
    primary: {
      backgroundColor: AppTheme.colors.primary,
      color: '#FFFFFF',
    },
    secondary: {
      backgroundColor: AppTheme.colors.secondary,
      color: '#FFFFFF',
    },
    ghost: {
      backgroundColor: '#EAFBF4',
      color: AppTheme.colors.primary,
    },
  };

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: variants[variant].backgroundColor,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          opacity: pressed || loading || disabled ? 0.55 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={variants[variant].color} />
      ) : (
        <Text style={[styles.label, { color: variants[variant].color }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
