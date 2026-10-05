'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Tag,
  MessageCircle,
  Store,
  Users,
  Wrench,
  Clock,
  CreditCard,
  TrendingUp,
} from 'lucide-react'
import useAuth from '../src/features/auth/hooks/useAuth'
import {
  DashboardLoadingState,
  UnauthenticatedState,
  AdminOnlyGuard,
  CustomerBlockedGuard,
} from './dashboard/RoleAccessGuard'
import DashboardHeader from './dashboard/DashboardHeader'
import DashboardSidebar from './dashboard/DashboardSidebar'
import DashboardMobileNav from './dashboard/DashboardMobileNav'

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, shop, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) return <DashboardLoadingState />
  if (!isAuthenticated) return <UnauthenticatedState />

  const role = user?.role || 'SELLER'
  const isAdminPath = router.pathname?.startsWith('/admin')
  const isSellerPath = router.pathname?.startsWith('/seller')

  if (isAdminPath && role !== 'ADMIN' && role !== 'PLATFORM_ADMIN' && role !== 'SUPER_ADMIN') {
    return <AdminOnlyGuard />
  }

  if (isSellerPath && role === 'CUSTOMER') {
    return <CustomerBlockedGuard user={user} />
  }

  let navItems = []
  let dashboardHref = '/seller/dashboard'
  let roleLabel = 'Store Seller'

  if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'PLATFORM_ADMIN') {
    roleLabel = 'Platform Owner (Super Admin)'
    dashboardHref = '/admin'
    navItems = [
      { name: 'Onboarding Request', href: '/admin?tab=requests', tabKey: 'requests', icon: Clock },
      { name: 'Subscription Plan', href: '/admin?tab=plans', tabKey: 'plans', icon: CreditCard },
      { name: 'Users Account', href: '/admin/users', tabKey: 'users', icon: Users },
    ]
  } else if (role === 'SUPER_SELLER') {
    roleLabel = 'Super Seller (Shop Owner)'
    dashboardHref = '/seller/dashboard'
    navItems = [
      { name: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
      { name: 'Repair Center', href: '/seller/repair-jobs', icon: Wrench },
      { name: 'Products Catalog', href: '/seller/products', icon: ShoppingBag },
      { name: 'Categories', href: '/seller/categories', icon: Tag },
      { name: 'Orders', href: '/seller/orders', icon: ClipboardList },
      { name: 'Offers & Deals', href: '/seller/offers', icon: Tag },
      { name: 'WhatsApp Leads', href: '/seller/enquiries', icon: MessageCircle },
      { name: 'Manage Store Staff', href: '/seller/team', icon: Users },
      { name: 'Shop Profile', href: '/seller/profile', icon: Store },
    ]
  } else if (role === 'CUSTOMER') {
    roleLabel = 'Customer'
    dashboardHref = '/'
    navItems = [
      { name: 'Nearby Shops', href: '/shops', icon: Store },
      { name: 'Products Catalog', href: '/products', icon: ShoppingBag },
      { name: 'Book / Track Repair', href: '/repairs', icon: Wrench },
      { name: 'Categories', href: '/categories', icon: Tag },
      { name: 'Home', href: '/', icon: LayoutDashboard },
    ]
  } else {
    // SELLER_ADMIN (Store Staff / Technician)
    roleLabel = 'Store Staff / Technician'
    dashboardHref = '/seller/dashboard'
    navItems = [
      { name: 'Staff Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
      { name: 'Repair Center', href: '/seller/repair-jobs', icon: Wrench },
      { name: 'Local Customers', href: '/seller/admin/customers', icon: Users },
      { name: 'Products & Stock', href: '/seller/products', icon: ShoppingBag },
      { name: 'Store Orders', href: '/seller/orders', icon: ClipboardList },
      { name: 'Offers', href: '/seller/offers', icon: Tag },
      { name: 'WhatsApp Enquiries', href: '/seller/enquiries', icon: MessageCircle },
      { name: 'Shop Profile', href: '/seller/profile', icon: Store },
    ]
  }

  const shopName = shop?.name || user?.name || 'Local Marketplace'
  const initials = (shop?.name || user?.name || 'HM').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader dashboardHref={dashboardHref} roleLabel={roleLabel} />
      <div className="mx-auto flex max-w-[1600px]">
        <DashboardSidebar
          shopName={shopName}
          initials={initials}
          roleLabel={roleLabel}
          navItems={navItems}
          pathname={pathname}
          queryTab={router.query?.tab}
          role={role}
          status={user?.status}
        />
        <main className="min-w-0 flex-1">
          <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
      <DashboardMobileNav
        navItems={navItems}
        pathname={pathname}
        queryTab={router.query?.tab}
      />
    </div>
  )
}