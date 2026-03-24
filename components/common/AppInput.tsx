import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { AppTheme } from '@/constants/app-theme';

type AppInputProps = TextInputProps & {
  icon: keyof typeof Ionicons.glyphMap;
};

export function AppInput({ icon, ...props }: AppInputProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={20} color={AppTheme.colors.textMuted} />
      <TextInput
        placeholderTextColor={AppTheme.colors.textMuted}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: AppTheme.colors.text,
  },
});
