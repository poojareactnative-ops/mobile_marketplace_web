import SuperAdminDashboard from './index'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AdminAnalyticsPage() {
  const router = useRouter()
  useEffect(() => {
    if (router.query.tab !== 'analytics') {
      router.replace('/admin?tab=analytics', undefined, { shallow: true })
    }
  }, [router])

  return <SuperAdminDashboard />
}
