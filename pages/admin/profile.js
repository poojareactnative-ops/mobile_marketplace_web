"use client"

import DashboardLayout from '../../components/DashboardLayout'
import ProfileCard from '../../components/ProfileCard'

const ADMIN = {
  name: 'Asha Verma',
  role: 'Admin',
  email: 'asha@company.com',
  phone: '9001234567',
  location: 'Mumbai, IN',
  joined: '2023-02-14',
  lastLogin: '2026-08-28 09:12',
  active: true,
  permissions: ['Manage products', 'View orders', 'Handle enquiries'],
  activity: ['Updated product SKU #122', 'Marked inquiry inq_234 resolved', 'Viewed order ORD_987']
}

export default function AdminProfilePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Profile</h1>
          <p className="mt-1 text-sm text-slate-500">View and manage administrator account details.</p>
        </div>

        <ProfileCard user={ADMIN} />
      </div>
    </DashboardLayout>
  )
}
