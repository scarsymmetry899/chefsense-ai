'use client';

import { type ReactNode } from 'react';
import { LanguageProvider } from '@/lib/i18n/language-context';
import { PersistenceHydration } from '@/components/persistence-hydration';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <PersistenceHydration />
      {children}
    </LanguageProvider>
  );
}
