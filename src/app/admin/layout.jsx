'use client';

import React from 'react';
import ProtectedLayout from '../../components/ProtectedLayout';

export default function AdminLayout({ children }) {
  return (
    <ProtectedLayout allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      {children}
    </ProtectedLayout>
  );
}

