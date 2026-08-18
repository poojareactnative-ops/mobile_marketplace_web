import Link from 'next/link'
import { MapPin, Store } from 'lucide-react'

export default function ShopsPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-indigo-600 p-3 text-white">
            <Store className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold">Nearby Shops</h1>
        </div>

        <p className="mb-6 text-slate-600">Discover local stores that sell mobile accessories and offer repair services near you.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold">Speedy Repairs</h3>
            <p className="text-sm text-slate-500">Screen repairs and battery replacements.</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="h-4 w-4" /> 0.8 km
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold">Gadget Hub</h3>
            <p className="text-sm text-slate-500">Accessories, cases, chargers and more.</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="h-4 w-4" /> 1.6 km
            </div>
          </article>
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Back to home</Link>
        </div>
      </div>
    </main>
  )
}
