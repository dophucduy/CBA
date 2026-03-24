export const AppTheme = {
  colors: {
    primary: '#00A86B',
    secondary: '#0A84FF',
    background: '#F4F7F8',
    surface: '#FFFFFF',
    text: '#0F172A',
    textMuted: '#64748B',
    border: '#E2E8F0',
    success: '#16A34A',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
  radius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },
  shadow: {
    card: {
      shadowColor: '#0F172A',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
  },
} as const;
