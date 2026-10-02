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
    roleLabel = 'Super Admin (Platform Owner)'
    dashboardHref = '/admin'
    navItems = [
      { name: 'Command Center', href: '/admin', icon: LayoutDashboard },
      { name: 'Onboarding Requests', href: '/admin?tab=requests', icon: Clock },
      { name: 'Subscription Plans', href: '/admin?tab=plans', icon: CreditCard },
      { name: 'Platform Analytics', href: '/admin?tab=analytics', icon: TrendingUp },
      { name: 'Manage Shops', href: '/admin/shops', icon: Store },
      { name: 'User Accounts', href: '/admin/users', icon: Users },
      { name: 'Platform Repairs', href: '/admin/repairs', icon: Wrench },
      { name: 'Browse Products', href: '/products', icon: ShoppingBag },
    ]
  } else if (role === 'SUPER_SELLER') {
    roleLabel = 'Super Seller (Sales & Repairs)'
    dashboardHref = '/seller/dashboard'
    navItems = [
      { name: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
      { name: 'Manage Sellers (Admins)', href: '/seller/team', icon: Users },
      { name: 'Products', href: '/seller/products', icon: ShoppingBag },
      { name: 'Categories', href: '/seller/categories', icon: Tag },
      { name: 'Orders', href: '/seller/orders', icon: ClipboardList },
      { name: 'Offers', href: '/seller/offers', icon: Tag },
      { name: 'Enquiries', href: '/seller/enquiries', icon: MessageCircle },
      { name: 'Repair Center', href: '/seller/mobile-repairing', icon: Wrench },
      { name: 'Repair Customers', href: '/seller/admin/repairing/customers', icon: Users },
      { name: 'Local Customers', href: '/seller/admin/customers', icon: Users },
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
    roleLabel = 'Store Staff / Seller Admin'
    dashboardHref = '/seller/dashboard'
    navItems = [
      { name: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
      { name: 'Repair Center', href: '/seller/mobile-repairing', icon: Wrench },
      { name: 'Local Customers', href: '/seller/admin/customers', icon: Users },
      { name: 'Products', href: '/seller/products', icon: ShoppingBag },
      { name: 'Orders', href: '/seller/orders', icon: ClipboardList },
      { name: 'Offers', href: '/seller/offers', icon: Tag },
      { name: 'Enquiries', href: '/seller/enquiries', icon: MessageCircle },
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
          role={role}
          status={user?.status}
        />
        <main className="min-w-0 flex-1">
          <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
      <DashboardMobileNav navItems={navItems} pathname={pathname} />
    </div>
  )
}