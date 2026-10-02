import SuperAdminDashboard from './index'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AdminPlansPage() {
  const router = useRouter()
  useEffect(() => {
    if (router.query.tab !== 'plans') {
      router.replace('/admin?tab=plans', undefined, { shallow: true })
    }
  }, [router])

  return <SuperAdminDashboard />
}
