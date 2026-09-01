import { useEffect, useState } from 'react'

export default function Toast({ message, duration = 3000 }) {
  const [show, setShow] = useState(!!message)

  useEffect(() => {
    setShow(!!message)
    if (!message) return
    const t = setTimeout(() => setShow(false), duration)
    return () => clearTimeout(t)
  }, [message])

  if (!show) return null

  return (
    <div className="fixed right-4 bottom-6 z-50 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">{message}</div>
  )
}
