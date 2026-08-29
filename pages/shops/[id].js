import Link from 'next/link'
import { useRouter } from 'next/router'

const shops = { s1: ['Pooja Mobile', 'PM', '4.8'], s2: ['QuickFix Repairs', 'QR', '4.7'], s3: ['Accessory Hub', 'AH', '4.6'] }

export default function ShopDetailPage() {
  const { query } = useRouter(); const shop = shops[query.id] || ['Local Mobile Shop', 'LM', '4.7']
  return <main className="min-h-screen bg-slate-50 px-4 py-12"><section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-9 shadow-sm"><Link href="/shops" className="text-sm font-semibold text-indigo-600">← All shops</Link><div className="mt-7 flex items-center gap-5"><div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 text-xl font-black text-white">{shop[1]}</div><div><p className="text-sm font-semibold text-indigo-600">Verified local seller</p><h1 className="mt-1 text-3xl font-black text-slate-900">{shop[0]}</h1><p className="mt-1 text-amber-600">★ {shop[2]} rating</p></div></div><p className="mt-8 text-slate-600">Mobile accessories, phone essentials and repair services available nearby.</p><a href="tel:+919000000000" className="mt-7 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white">Call shop</a></section></main>
}
