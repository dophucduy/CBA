import { useEffect, useState } from 'react';

import { type DemoAccount, type UserRole } from '@/constants/auth';
import { getManagedAccounts, updateManagedAccountRole } from '@/constants/storage';

export function useManagedAccounts() {
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadAccounts = async () => {
      const nextAccounts = await getManagedAccounts();

      if (!active) {
        return;
      }

      setAccounts(nextAccounts);
      setLoading(false);
    };

    loadAccounts();

    return () => {
      active = false;
    };
  }, []);

  const reload = async () => {
    const nextAccounts = await getManagedAccounts();
    setAccounts(nextAccounts);
    setLoading(false);
    return nextAccounts;
  };

  const assignRole = async (accountId: string, role: Exclude<UserRole, 'admin'>) => {
    const nextAccounts = await updateManagedAccountRole(accountId, role);
    setAccounts(nextAccounts);
    return nextAccounts;
  };

  return { accounts, loading, reload, assignRole };
}
