"use client"

import { useRouter } from 'next/navigation'

export default function LogoutButton({ redirectTo = '/' }) {
  const router = useRouter()

  const handleLogout = () => {
    try {
      localStorage.removeItem('demo_auth')
    } catch (err) {
      // ignore
    }

    // navigate home and reload to reset any client state
    router.push(redirectTo)
    try {
      // small delay to ensure navigation starts
      setTimeout(() => window.location.reload(), 200)
    } catch (e) {}
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>

      <span className="hidden sm:inline">Logout</span>
    </button>
  )
}
