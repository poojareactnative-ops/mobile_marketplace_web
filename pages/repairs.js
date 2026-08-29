import Link from 'next/link'

export default function RepairsPage() {
  return <main className="min-h-screen bg-slate-50 px-4 py-12"><section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><Link href="/" className="text-sm font-semibold text-indigo-600">← Home</Link><h1 className="mt-4 text-4xl font-black text-slate-900">Mobile repair services</h1><p className="mt-3 leading-7 text-slate-600">Connect with local experts for screen replacement, battery issues, charging-port repairs and diagnostics.</p><Link href="/shops" className="mt-8 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white">Find nearby repair shops</Link></section></main>
}
