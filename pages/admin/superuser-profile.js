"use client"

import DashboardLayout from '../../components/DashboardLayout'
import ProfileCard from '../../components/ProfileCard'

const SUPER = {
  name: 'Rohit Sharma',
  role: 'Super User',
  email: 'rohit@company.com',
  phone: '9887766550',
  location: 'Bengaluru, IN',
  joined: '2022-06-01',
  lastLogin: '2026-08-29 07:40',
  active: true,
  permissions: ['Full access', 'Manage admins', 'View analytics', 'System settings'],
  activity: ['Changed site theme', 'Added new admin user', 'Exported reports']
}

export default function SuperUserProfilePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Super User Profile</h1>
          <p className="mt-1 text-sm text-slate-500">High-privilege account with organization-wide controls.</p>
        </div>

        <ProfileCard user={SUPER} />
      </div>
    </DashboardLayout>
  )
}
