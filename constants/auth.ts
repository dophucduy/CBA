import { AppRoutes } from '@/navigation/routes';

export type UserRole = 'admin' | 'customer' | 'driver';

export type DemoAccount = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  description: string;
};

export const demoAccounts: DemoAccount[] = [
  {
    id: 'admin-1',
    name: 'Ava Admin',
    email: 'admin@cba.app',
    password: 'admin123',
    role: 'admin',
    description: 'Assigns accounts and controls which role each user can access.',
  },
  {
    id: 'customer-1',
    name: 'Chris Customer',
    email: 'customer@cba.app',
    password: 'customer123',
    role: 'customer',
    description: 'Uses the rider flow to book trips, pay, and review ride history.',
  },
  {
    id: 'driver-1',
    name: 'Dylan Driver',
    email: 'driver@cba.app',
    password: 'driver123',
    role: 'driver',
    description: 'Uses the driver workspace to go online and accept nearby trips.',
  },
];

export function getRoleLabel(role: UserRole) {
  switch (role) {
    case 'admin':
      return 'Admin';
    case 'driver':
      return 'Driver';
    default:
      return 'Customer';
  }
}

export function getDefaultRouteForRole(role: UserRole) {
  switch (role) {
    case 'admin':
      return AppRoutes.adminHome;
    case 'driver':
      return AppRoutes.driverHome;
    default:
      return AppRoutes.home;
  }
}

export function findDemoAccountByCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  return (
    demoAccounts.find(
      (account) =>
        account.email.toLowerCase() === normalizedEmail && account.password === normalizedPassword
    ) ?? null
  );
}
