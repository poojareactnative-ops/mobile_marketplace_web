'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import ProtectedLayout from '../../components/ProtectedLayout';

export default function SuperAdminLayout({ children }) {
  const pathname = usePathname();

  // The login page itself must never be blocked by authentication checks
  if (pathname === '/super-admin/login') {
    return <>{children}</>;
  }

  return (
    <ProtectedLayout allowedRoles={['SUPER_ADMIN']}>
      {children}
    </ProtectedLayout>
  );
}

