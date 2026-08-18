import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-cyan-500 p-3 text-white">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold">Products</h1>
        </div>

        <p className="mb-6 text-slate-600">Browse sample products available from nearby sellers.</p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="h-32 w-full rounded-md bg-slate-100" />
            <h3 className="mt-3 font-semibold">Tempered Glass Screen</h3>
            <p className="text-sm text-slate-500">Protective glass for most models.</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="h-32 w-full rounded-md bg-slate-100" />
            <h3 className="mt-3 font-semibold">Fast Charger</h3>
            <p className="text-sm text-slate-500">USB-C fast charging adapter.</p>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Back to home</Link>
        </div>
      </div>
    </main>
  )
}
