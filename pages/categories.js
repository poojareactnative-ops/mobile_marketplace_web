import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../src/lib/api/client'
import { Tag, ArrowRight, Sparkles, Layers, ShieldCheck, Wrench } from 'lucide-react'

export default function CategoriesPage() {
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () => {
      const res = await apiClient.get('/categories')
      return res.data?.data || []
    },
  })

  const categories = categoriesData || []

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
              <Sparkles className="h-4 w-4" />
              Explore Marketplace
            </div>
            <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Browse Product & Service Categories</h1>
            <p className="mt-2 text-sm text-slate-600">
              Find verified local sellers for mobile parts, screen replacements, chargers, and premium cases.
            </p>
          </div>

          <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
            ← Home
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-3xl bg-slate-200" />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?categoryId=${category.id}`}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-600/5"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                    {category.type === 'REPAIR' ? <Wrench className="h-6 w-6" /> : <Tag className="h-6 w-6" />}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    {category.type || 'ACCESSORY'}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
                  {category.name}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Explore available products from local stores →
                </p>

                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-600">
                  <span>Browse Category</span>
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
