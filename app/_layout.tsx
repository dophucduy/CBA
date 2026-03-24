import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: 'splash',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="splash">
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ title: 'Admin Center' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="driver-home" options={{ title: 'Driver Center' }} />
        <Stack.Screen name="driver-scanning" options={{ headerShown: false }} />
        <Stack.Screen name="driver-found" options={{ headerShown: false }} />
        <Stack.Screen name="driver-match" options={{ title: 'Trip Match' }} />
        <Stack.Screen name="select-ride" options={{ title: 'Select Ride' }} />
        <Stack.Screen name="booking" options={{ title: 'Booking' }} />
        <Stack.Screen name="payment" options={{ title: 'Payment' }} />
        <Stack.Screen name="payment-processing" options={{ headerShown: false }} />
        <Stack.Screen name="payment-result" options={{ headerShown: false }} />
        <Stack.Screen name="driver-searching" options={{ headerShown: false }} />
        <Stack.Screen name="trip-live" options={{ headerShown: false }} />
        <Stack.Screen name="trip-summary" options={{ title: 'Trip Summary' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Info' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
