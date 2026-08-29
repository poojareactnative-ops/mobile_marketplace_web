import { useState } from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '../../../../components/DashboardLayout'

export default function EditProductPage() {
  const router = useRouter(); const [name, setName] = useState('Product'); const [price, setPrice] = useState('199')
  return <DashboardLayout><div className="mx-auto max-w-2xl"><h1 className="text-3xl font-black text-slate-900">Edit product</h1><form onSubmit={(e) => { e.preventDefault(); router.push('/seller/products') }} className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><label className="block text-sm font-semibold text-slate-700">Product name<input required value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label><label className="mt-5 block text-sm font-semibold text-slate-700">Price (₹)<input required type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label><button className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white">Save changes</button></form></div></DashboardLayout>
}

export function getServerSideProps() { return { props: {} } }
