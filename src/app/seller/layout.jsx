'use client';

import React from 'react';
import ProtectedLayout from '../../components/ProtectedLayout';

export default function SellerLayout({ children }) {
  return (
    <ProtectedLayout allowedRoles={['SELLER', 'SUPER_ADMIN']}>
      {children}
    </ProtectedLayout>
  );
}

