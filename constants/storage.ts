import AsyncStorage from '@react-native-async-storage/async-storage';

import { demoAccounts, findAccountByCredentials, type DemoAccount, type UserRole } from '@/constants/auth';
import type { HistoryTrip } from '@/constants/dummy-data';
import { getMatchingApiBaseUrl } from '@/constants/matching-api';

const AUTH_KEY = 'car-booking-auth';
const ACCOUNTS_KEY = 'car-booking-accounts';
const LAST_BOOKING_KEY = 'car-booking-last';
const TRIP_HISTORY_KEY = 'car-booking-trip-history';

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

export type LiveRideRequestStatus = 'waiting' | 'claimed' | 'accepted' | 'completed' | 'cancelled';

export type LiveRideRequest = {
  id: string;
  bookingId: string;
  customerAccountId: string;
  passengerName: string;
  passengerRating: number;
  pickup: string;
  destination: string;
  distanceKm: number;
  etaMin: number;
  estimatedFare: number;
  rideName: string;
  distanceText: string;
  etaText: string;
  note: string;
  status: LiveRideRequestStatus;
  driverAccountId: string | null;
  driverName: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function setAuthSession(value: AuthSession) {
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(value));
}

function isStoredAccount(value: unknown): value is DemoAccount {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<DemoAccount>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string' &&
    typeof candidate.password === 'string' &&
    typeof candidate.description === 'string' &&
    (candidate.role === 'admin' || candidate.role === 'customer' || candidate.role === 'driver')
  );
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

export async function setManagedAccounts(accounts: DemoAccount[]) {
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export async function getManagedAccounts() {
  const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);

  if (!raw) {
    await setManagedAccounts(demoAccounts);
    return demoAccounts;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (Array.isArray(parsed) && parsed.every(isStoredAccount)) {
      return parsed;
    }
  } catch {
    // Fall through to reseed the managed accounts.
  }

  await setManagedAccounts(demoAccounts);
  return demoAccounts;
}

export async function updateManagedAccountRole(accountId: string, role: Exclude<UserRole, 'admin'>) {
  const accounts = await getManagedAccounts();
  const nextAccounts = accounts.map((account) =>
    account.id === accountId && account.role !== 'admin' ? { ...account, role } : account
  );

  await setManagedAccounts(nextAccounts);
  return nextAccounts;
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

export async function resolveAuthSession() {
  const session = await getAuthSession();

  if (!session) {
    return null;
  }

  const accounts = await getManagedAccounts();
  const account = accounts.find((item) => item.id === session.accountId);

  if (!account) {
    await clearAuthSession();
    return null;
  }

  if (account.name === session.name && account.email === session.email && account.role === session.role) {
    return session;
  }

  const nextSession: AuthSession = {
    ...session,
    name: account.name,
    email: account.email,
    role: account.role,
  };

  await setAuthSession(nextSession);
  return nextSession;
}

export async function getAccountByCredentials(email: string, password: string) {
  const accounts = await getManagedAccounts();
  return findAccountByCredentials(accounts, email, password);
}

export async function clearAuthSession() {
  await AsyncStorage.removeItem(AUTH_KEY);
}

export async function setLastBookingStatus(data: LastBookingStatus) {
  await AsyncStorage.setItem(LAST_BOOKING_KEY, JSON.stringify(data));
}

function isLiveRideRequest(value: unknown): value is LiveRideRequest {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<LiveRideRequest>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.bookingId === 'string' &&
    typeof candidate.customerAccountId === 'string' &&
    typeof candidate.passengerName === 'string' &&
    typeof candidate.passengerRating === 'number' &&
    typeof candidate.pickup === 'string' &&
    typeof candidate.destination === 'string' &&
    typeof candidate.distanceKm === 'number' &&
    typeof candidate.etaMin === 'number' &&
    typeof candidate.estimatedFare === 'number' &&
    typeof candidate.rideName === 'string' &&
    typeof candidate.distanceText === 'string' &&
    typeof candidate.etaText === 'string' &&
    typeof candidate.note === 'string' &&
    (candidate.status === 'waiting' ||
      candidate.status === 'claimed' ||
      candidate.status === 'accepted' ||
      candidate.status === 'completed' ||
      candidate.status === 'cancelled') &&
    (typeof candidate.driverAccountId === 'string' || candidate.driverAccountId === null) &&
    (typeof candidate.driverName === 'string' || candidate.driverName === null) &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string'
  );
}

function isLiveRideRequestArray(value: unknown): value is LiveRideRequest[] {
  return Array.isArray(value) && value.every(isLiveRideRequest);
}

function isDriverPayload(value: unknown): value is { accountId: string; name: string } {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<{ accountId: string; name: string }>;
  return typeof candidate.accountId === 'string' && typeof candidate.name === 'string';
}

async function requestMatchingApi<T>(
  path: string,
  init?: RequestInit,
  guard?: (value: unknown) => value is T
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${getMatchingApiBaseUrl()}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new Error('Live matching server is unavailable.');
  }

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const errorPayload =
      payload && typeof payload === 'object' ? (payload as { message?: unknown }) : null;
    const message =
      typeof errorPayload?.message === 'string'
        ? errorPayload.message
        : 'Live matching request failed.';
    throw new Error(message);
  }

  if (guard && !guard(payload)) {
    throw new Error('Live matching server returned an unexpected response.');
  }

  return payload as T;
}

export async function getLiveRideRequests() {
  return requestMatchingApi('/api/live-ride-requests', undefined, isLiveRideRequestArray);
}

export async function getRideRequestById(requestId: string) {
  return requestMatchingApi(
    `/api/live-ride-requests/${encodeURIComponent(requestId)}`,
    undefined,
    (value): value is LiveRideRequest | null => value === null || isLiveRideRequest(value)
  );
}

export async function getRideRequestByBookingId(bookingId: string) {
  return requestMatchingApi(
    `/api/live-ride-requests/by-booking/${encodeURIComponent(bookingId)}`,
    undefined,
    (value): value is LiveRideRequest | null => value === null || isLiveRideRequest(value)
  );
}

export async function getWaitingRideRequests() {
  return requestMatchingApi('/api/live-ride-requests?status=waiting', undefined, isLiveRideRequestArray);
}

export async function upsertCustomerRideRequest(input: {
  bookingId: string;
  customerAccountId: string;
  passengerName: string;
  pickup: string;
  destination: string;
  rideName: string;
  distanceText: string;
  etaText: string;
  estimatedFare: number;
  note?: string;
}) {
  return requestMatchingApi(
    '/api/live-ride-requests/upsert-customer',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    (value): value is LiveRideRequest => isLiveRideRequest(value)
  );
}

export async function claimNextWaitingRideRequest(driver: { accountId: string; name: string }) {
  if (!isDriverPayload(driver)) {
    throw new Error('Driver identity is required for live matching.');
  }

  return requestMatchingApi(
    '/api/live-ride-requests/claim-next',
    {
      method: 'POST',
      body: JSON.stringify(driver),
    },
    (value): value is LiveRideRequest | null => value === null || isLiveRideRequest(value)
  );
}

export async function releaseRideRequest(requestId: string) {
  return requestMatchingApi(
    `/api/live-ride-requests/${encodeURIComponent(requestId)}/release`,
    {
      method: 'POST',
    },
    (value): value is LiveRideRequest | null => value === null || isLiveRideRequest(value)
  );
}

export async function acceptRideRequest(requestId: string, driver: { accountId: string; name: string }) {
  if (!isDriverPayload(driver)) {
    throw new Error('Driver identity is required for live matching.');
  }

  return requestMatchingApi(
    `/api/live-ride-requests/${encodeURIComponent(requestId)}/accept`,
    {
      method: 'POST',
      body: JSON.stringify(driver),
    },
    (value): value is LiveRideRequest | null => value === null || isLiveRideRequest(value)
  );
}

export async function completeRideRequest(requestId: string) {
  return requestMatchingApi(
    `/api/live-ride-requests/${encodeURIComponent(requestId)}/complete`,
    {
      method: 'POST',
    },
    (value): value is LiveRideRequest | null => value === null || isLiveRideRequest(value)
  );
}

function isHistoryTrip(value: unknown): value is HistoryTrip {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<HistoryTrip>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.date === 'string' &&
    typeof candidate.from === 'string' &&
    typeof candidate.to === 'string' &&
    typeof candidate.price === 'number' &&
    typeof candidate.distance === 'string' &&
    typeof candidate.duration === 'string'
  );
}

export async function getTripHistory() {
  const raw = await AsyncStorage.getItem(TRIP_HISTORY_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) && parsed.every(isHistoryTrip) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addTripToHistory(trip: HistoryTrip) {
  const existingTrips = await getTripHistory();
  const nextTrips = [trip, ...existingTrips.filter((item) => item.id !== trip.id)].slice(0, 20);
  await AsyncStorage.setItem(TRIP_HISTORY_KEY, JSON.stringify(nextTrips));
  return nextTrips;
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
