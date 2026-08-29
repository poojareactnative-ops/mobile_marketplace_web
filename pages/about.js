import Link from 'next/link'

export default function AboutPage() {
  return <main className="min-h-screen bg-slate-50 px-4 py-12"><section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><Link href="/" className="text-sm font-semibold text-indigo-600">← Home</Link><h1 className="mt-4 text-4xl font-black text-slate-900">About Hyperlocal Mobile</h1><p className="mt-3 leading-7 text-slate-600">Hyperlocal Mobile helps customers discover nearby mobile shops, offers, accessories and repair services while giving sellers an easy way to manage their business online.</p></section></main>
}
