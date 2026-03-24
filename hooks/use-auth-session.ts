import { useEffect, useState } from 'react';

import { type AuthSession, resolveAuthSession } from '@/constants/storage';

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      const nextSession = await resolveAuthSession();

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
