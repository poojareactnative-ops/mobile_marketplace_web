import Link from 'next/link'

export default function CategoriesPage() {
  const categories = ['Mobile Accessories', 'Chargers & Cables', 'Screen Protection', 'Phone Repairs', 'Batteries & Parts', 'Pre-owned Mobiles']
  return <main className="min-h-screen bg-slate-50 px-4 py-12"><section className="mx-auto max-w-5xl"><Link href="/" className="text-sm font-semibold text-indigo-600">← Home</Link><h1 className="mt-4 text-4xl font-black text-slate-900">Browse categories</h1><p className="mt-2 text-slate-600">Find nearby sellers for mobile products and services.</p><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category) => <Link key={category} href="/shops" className="rounded-2xl border border-slate-200 bg-white p-5 font-bold text-slate-800 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600">{category}<span className="mt-2 block text-sm font-normal text-slate-500">Explore local shops →</span></Link>)}</div></section></main>
}
