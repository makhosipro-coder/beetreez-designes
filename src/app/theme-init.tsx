'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';

export function ClientThemeInit() {
  useEffect(() => {
    const theme = useUIStore.getState().theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);
  return null;
}
