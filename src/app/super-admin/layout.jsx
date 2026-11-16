'use client';

import React from 'react';

export default function SuperAdminLayout({ children }) {
  // Page-level guards (like RoleGuard in /super-admin/page.jsx) protect sensitive views
  // while allowing /super-admin/login to render without hydration or redirect issues.
  return <>{children}</>;
}


