import Link from 'next/link'
import { useRouter } from 'next/router'

const offers = { o1: ['10% OFF', 'Screen Protectors', 'GLASS10'], o2: ['BUY 1 GET 1', 'USB-C Cables', 'CABLEBOGO'], o3: ['FREE CHECKUP', 'Battery Health', 'BATTERYFREE'], o4: ['20% OFF', 'Mobile Accessories', 'SMART20'] }

export default function OfferDetailPage() {
  const { query } = useRouter(); const offer = offers[query.id] || ['Special offer', 'Local mobile deal', 'LOCALDEAL']
  return <main className="min-h-screen bg-slate-50 px-4 py-12"><section className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-sm"><div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-9 text-white"><p className="text-sm font-bold uppercase tracking-widest text-indigo-100">{offer[1]}</p><h1 className="mt-2 text-4xl font-black">{offer[0]}</h1></div><div className="p-9"><p className="text-slate-600">Use this voucher code at the participating local shop. Confirm availability before visiting.</p><div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center font-mono text-xl font-bold text-slate-800">{offer[2]}</div><Link href="/shops" className="mt-7 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white">Find a shop</Link></div></section></main>
}
