"use client"

import Link from 'next/link'

export default function GlobalError({ error, reset }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-white p-6">
      <div className="max-w-2xl w-full">
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-slate-900">Something went wrong</h1>
          <p className="mt-3 text-sm text-slate-600">An unexpected error occurred. You can try to reload the page or go back to safety.</p>

          <pre className="mt-4 rounded-md bg-slate-50 p-3 text-xs text-slate-700">{String(error?.message)}</pre>

          <div className="mt-6 flex gap-3">
            <button onClick={() => reset?.()} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Try again</button>
            <Link href="/" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Home</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
