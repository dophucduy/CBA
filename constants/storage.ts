import AsyncStorage from '@react-native-async-storage/async-storage';

import type { UserRole } from '@/constants/auth';

const AUTH_KEY = 'car-booking-auth';
const LAST_BOOKING_KEY = 'car-booking-last';

export type AuthSession = {
  accountId: string;
  name: string;
  email: string;
  role: UserRole;
  loggedInAt: string;
};

export type LastBookingStatus = {
  id: string;
  amount: number;
  paymentMethod: 'visa' | 'cash';
  paymentStatus: 'success' | 'failed';
  updatedAt: string;
};

export async function setAuthSession(value: AuthSession) {
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(value));
}

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<AuthSession>;

  return (
    typeof candidate.accountId === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string' &&
    (candidate.role === 'admin' || candidate.role === 'customer' || candidate.role === 'driver') &&
    typeof candidate.loggedInAt === 'string'
  );
}

export async function getAuthSession() {
  const raw = await AsyncStorage.getItem(AUTH_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return isAuthSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
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
