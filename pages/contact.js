import Link from 'next/link'

export default function ContactPage() {
  return <main className="min-h-screen bg-slate-50 px-4 py-12"><section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><Link href="/" className="text-sm font-semibold text-indigo-600">← Home</Link><h1 className="mt-4 text-4xl font-black text-slate-900">Contact us</h1><p className="mt-3 leading-7 text-slate-600">Need help with a shop, offer, repair request or seller account? Contact the Hyperlocal Mobile support team.</p><a href="mailto:support@hyperlocalmobile.com" className="mt-7 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white">Email support</a></section></main>
}
