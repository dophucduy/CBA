import AsyncStorage from '@react-native-async-storage/async-storage';

import { demoAccounts, findAccountByCredentials, type DemoAccount, type UserRole } from '@/constants/auth';

const AUTH_KEY = 'car-booking-auth';
const ACCOUNTS_KEY = 'car-booking-accounts';
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
