import Link from 'next/link'

export default function PrivacyPage() {
  return <main className="min-h-screen bg-slate-50 px-4 py-12"><section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><Link href="/" className="text-sm font-semibold text-indigo-600">← Home</Link><h1 className="mt-4 text-4xl font-black text-slate-900">Privacy policy</h1><p className="mt-3 leading-7 text-slate-600">We collect only the information needed to run the service, connect customers with sellers, and improve the platform. We do not sell your personal data.</p></section></main>
}
