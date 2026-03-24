import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppTheme } from '@/constants/app-theme';
import { PlaceOption } from '@/constants/dummy-data';
import { LatLng } from '@/hooks/use-user-location';

type LocationComboBoxProps = {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  options: PlaceOption[];
  origin: LatLng;
  onSelect: (option: PlaceOption) => void;
  onFocusChange?: (focused: boolean) => void;
};

function distanceKm(origin: LatLng, destination: LatLng) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371;

  const dLat = toRadians(destination.latitude - origin.latitude);
  const dLon = toRadians(destination.longitude - origin.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(origin.latitude)) *
      Math.cos(toRadians(destination.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

export function LocationComboBox({
  icon,
  placeholder,
  value,
  onChangeText,
  options,
  origin,
  onSelect,
  onFocusChange,
}: LocationComboBoxProps) {
  const [focused, setFocused] = useState(false);
  const [apiOptions, setApiOptions] = useState<PlaceOption[]>([]);
  const [loadingApi, setLoadingApi] = useState(false);

  useEffect(() => {
    const keyword = value.trim();
    if (!focused || keyword.length < 2) {
      setApiOptions([]);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      try {
        setLoadingApi(true);
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&q=${encodeURIComponent(keyword)}&lat=${origin.latitude}&lon=${origin.longitude}`;
        const response = await fetch(url);
        const json = await response.json();

        if (!active || !Array.isArray(json)) {
          return;
        }

        const mapped: PlaceOption[] = json
          .filter((item) => item?.lat && item?.lon && item?.display_name)
          .map((item) => ({
            id: String(item.place_id),
            label: item.display_name,
            coords: {
              latitude: Number(item.lat),
              longitude: Number(item.lon),
            },
          }));

        setApiOptions(mapped);
      } catch {
        if (active) {
          setApiOptions([]);
        }
      } finally {
        if (active) {
          setLoadingApi(false);
        }
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [focused, origin.latitude, origin.longitude, value]);

  const sortedOptions = useMemo(() => {
    const keyword = value.trim().toLowerCase();

    const mergedOptions = [...apiOptions, ...options].filter(
      (item, index, arr) => arr.findIndex((sub) => sub.id === item.id) === index,
    );

    const filtered = keyword
      ? mergedOptions.filter((item) => item.label.toLowerCase().includes(keyword))
      : mergedOptions;

    return [...filtered]
      .sort((a, b) => distanceKm(origin, a.coords) - distanceKm(origin, b.coords))
      .slice(0, 6);
  }, [apiOptions, options, origin, value]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputContainer}>
        <Ionicons name={icon} size={20} color={AppTheme.colors.textMuted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => {
            setFocused(true);
            onFocusChange?.(true);
          }}
          onBlur={() =>
            setTimeout(() => {
              setFocused(false);
              onFocusChange?.(false);
            }, 120)
          }
          onSubmitEditing={() => undefined}
          blurOnSubmit={false}
          placeholder={placeholder}
          placeholderTextColor={AppTheme.colors.textMuted}
          style={styles.input}
        />
      </View>

      {focused && sortedOptions.length > 0 ? (
        <View style={styles.dropdown}>
          {loadingApi ? <Text style={styles.loadingText}>Searching places...</Text> : null}
          {sortedOptions.map((item) => {
            const distance = distanceKm(origin, item.coords);

            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  onSelect(item);
                  setFocused(false);
                }}
                style={styles.optionRow}>
                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionLabel}>{item.label}</Text>
                  <Text style={styles.optionSub}>{distance.toFixed(1)} km away</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={AppTheme.colors.textMuted} />
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 10,
  },
  inputContainer: {
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
  dropdown: {
    marginTop: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    backgroundColor: '#FFFFFF',
    ...AppTheme.shadow.card,
  },
  optionRow: {
    minHeight: 50,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionTextWrap: {
    gap: 2,
  },
  optionLabel: {
    fontWeight: '600',
    color: AppTheme.colors.text,
  },
  optionSub: {
    fontSize: 12,
    color: AppTheme.colors.textMuted,
  },
  loadingText: {
    fontSize: 12,
    color: AppTheme.colors.textMuted,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
});
