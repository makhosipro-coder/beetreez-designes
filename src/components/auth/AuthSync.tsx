'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/stores/authStore';

export function AuthSync() {
  const { data: session } = useSession();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id || session.user.email || 'anonymous',
        name: session.user.name || 'User',
        email: session.user.email || '',
        image: session.user.image,
      });
    } else {
      setUser(null);
    }
  }, [session, setUser]);

  return null;
}
