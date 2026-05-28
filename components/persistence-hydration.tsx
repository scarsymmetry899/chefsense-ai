'use client';

import { useEffect } from 'react';
import { hydrateAllUserState } from '@/lib/user-state';
import { subscribeToAuth } from '@/lib/auth/browser';

/**
 * Mounts once at the root. Pulls every user_state row from Supabase into
 * localStorage on app boot, and re-pulls whenever the auth session changes
 * (so a fresh sign-in inherits the user's data from any device).
 */
export function PersistenceHydration() {
  useEffect(() => {
    void hydrateAllUserState();

    const unsubscribe = subscribeToAuth(() => {
      void hydrateAllUserState();
    });

    return unsubscribe;
  }, []);

  return null;
}
