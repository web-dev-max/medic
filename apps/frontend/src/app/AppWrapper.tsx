'use client';

import { createContext } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';

// Context to mark admin routes
export const AdminContext = createContext(false);

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const isAdmin = false; // Root level - not admin
  
  if (isAdmin) {
    return <>{children}</>;
  }
  
  return (
    <PageLayout>
      {children}
    </PageLayout>
  );
}
