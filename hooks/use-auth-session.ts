import { useEffect, useState } from 'react';

import { type AuthSession, getAuthSession } from '@/constants/storage';

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      const nextSession = await getAuthSession();

      if (!active) {
        return;
      }

      setSession(nextSession);
      setLoading(false);
    };

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  return { session, loading };
}
