import { useState, useEffect } from 'react'

export function useAuth() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // demo: read demo token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('demo_auth')
      if (token) setUser({ name: 'Demo user' })
    }
  }, [])

  function loginDemo() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo_auth', '1')
      setUser({ name: 'Demo user' })
    }
  }

  function logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_auth')
      setUser(null)
    }
  }

  return { user, loginDemo, logout }
}
