'use client';

import React from 'react';
import RoleGuard from './RoleGuard';

/**
 * Standard Protected Route Layout Wrapper
 * Secures nested dashboard and workbench pages behind authentication and role authorization.
 */
export default function ProtectedLayout({ allowedRoles = [], children }) {
  return (
    <RoleGuard allowedRoles={allowedRoles}>
      {children}
    </RoleGuard>
  );
}

