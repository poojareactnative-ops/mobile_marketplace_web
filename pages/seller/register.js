import Link from 'next/link'
import { Smartphone } from 'lucide-react'

export default function SellerRegister() {
  return (
    <main className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-violet-600 p-3 text-white">
            <Smartphone className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold">Register as a Seller</h1>
        </div>

        <p className="mb-6 text-slate-600">Create a seller account to list accessories or offer repair services.</p>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">This is a placeholder registration page. Implement form and onboarding flow here.</p>

          <div className="mt-6 flex gap-3">
            <Link href="/seller/dashboard" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Go to dashboard</Link>
            <Link href="/" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Home</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
