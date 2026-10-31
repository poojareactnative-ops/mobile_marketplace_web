'use client';

import React from 'react';
import ProtectedLayout from '../../components/ProtectedLayout';

export default function SuperAdminLayout({ children }) {
  return (
    <ProtectedLayout allowedRoles={['SUPER_ADMIN']}>
      {children}
    </ProtectedLayout>
  );
}

