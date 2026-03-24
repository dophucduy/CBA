import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppTheme } from '@/constants/app-theme';

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
};

export function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((item) => (
        <Pressable key={item} onPress={() => onChange(item)} style={styles.starButton}>
          <Ionicons
            name={item <= value ? 'star' : 'star-outline'}
            size={34}
            color={item <= value ? AppTheme.colors.warning : '#CBD5E1'}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  starButton: {
    padding: 4,
  },
});
