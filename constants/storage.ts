import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = 'car-booking-auth';
const LAST_BOOKING_KEY = 'car-booking-last';

export type LastBookingStatus = {
  id: string;
  amount: number;
  paymentMethod: 'visa' | 'cash';
  paymentStatus: 'success' | 'failed';
  updatedAt: string;
};

export async function setAuthSession(value: string) {
  await AsyncStorage.setItem(AUTH_KEY, value);
}

export async function getAuthSession() {
  return AsyncStorage.getItem(AUTH_KEY);
}

export async function clearAuthSession() {
  await AsyncStorage.removeItem(AUTH_KEY);
}

export async function setLastBookingStatus(data: LastBookingStatus) {
  await AsyncStorage.setItem(LAST_BOOKING_KEY, JSON.stringify(data));
}

export async function getLastBookingStatus() {
  const raw = await AsyncStorage.getItem(LAST_BOOKING_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as LastBookingStatus;
  } catch {
    return null;
  }
}
