import DashboardLayout from '../../components/DashboardLayout'
import useAuth from '../../src/features/auth/hooks/useAuth'
import { User, Mail, Phone, ShieldCheck, Calendar, Clock } from 'lucide-react'

export default function AdminProfilePage() {
  const { user, shop } = useAuth()

  const profileData = {
    name: user?.name || 'Administrator',
    role: user?.role || 'ADMIN',
    email: user?.email || 'admin@hyperlocal.com',
    phone: user?.phone || '+91 98765 00000',
    shop: shop?.name || 'Platform Governance',
    permissions:
      user?.role === 'ADMIN'
        ? ['Platform-wide oversight', 'Verify and approve shops', 'View all repair jobs', 'Manage admin users']
        : ['Store management', 'Product catalog CRUD', 'Process repair tickets', 'Fulfill orders'],
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600">
            <ShieldCheck className="h-4 w-4" />
            Account Overview
          </div>
          <h1 className="mt-1 text-3xl font-black text-slate-900">Administrator Profile</h1>
          <p className="text-sm text-slate-500">Live details for your authenticated management session.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 text-2xl font-black text-white shadow-xl shadow-violet-600/20">
              {profileData.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-slate-900">{profileData.name}</h2>
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                  {profileData.role}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">UUID: {user?.id || 'Active Session'}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-slate-400 font-medium">Email Address</p>
                <p className="text-sm font-bold text-slate-800">{profileData.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-slate-400 font-medium">Phone Number</p>
                <p className="text-sm font-bold text-slate-800">{profileData.phone}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-900">Role Permissions</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {profileData.permissions.map((perm) => (
                <span
                  key={perm}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  ✓ {perm}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
