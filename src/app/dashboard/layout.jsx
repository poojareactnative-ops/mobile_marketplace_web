'use client';

import React from 'react';
import ProtectedLayout from '../../components/ProtectedLayout';

export default function DashboardLayout({ children }) {
  return (
    <ProtectedLayout allowedRoles={['ADMIN', 'SELLER', 'SUPER_ADMIN', 'CUSTOMER']}>
      {children}
    </ProtectedLayout>
  );
}

