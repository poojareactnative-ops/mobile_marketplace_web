import Link from 'next/link'

export default function SellerHelpPage() {
  return <main className="min-h-screen bg-slate-50 px-4 py-12"><section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><Link href="/seller/dashboard" className="text-sm font-semibold text-indigo-600">← Dashboard</Link><h1 className="mt-4 text-4xl font-black text-slate-900">Seller help</h1><p className="mt-3 leading-7 text-slate-600">Get help managing your profile, products, offers and customer enquiries.</p><ul className="mt-6 space-y-3 text-slate-700"><li>• Add and update shop products</li><li>• Create local offers</li><li>• Manage incoming customer enquiries</li></ul></section></main>
}
