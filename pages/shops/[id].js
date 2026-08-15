import { useRouter } from 'next/router'

export default function ShopDetail(){
  const router = useRouter()
  const { id } = router.query

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h2 className="text-2xl font-bold">Shop Details</h2>
      <p className="text-sm text-slate-600">Demo details for shop: {id}</p>
      <div className="mt-4 rounded-xl bg-white/60 backdrop-blur-md border border-white/40 p-4 shadow-sm">
        <h3 className="font-semibold">Send Inquiry</h3>
        <form className="grid gap-2 mt-2 max-w-md">
          <input placeholder="Your name" className="border p-2 rounded-md" />
          <input placeholder="Phone" className="border p-2 rounded-md" />
          <input placeholder="Product or service interest" className="border p-2 rounded-md" />
          <button className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold">Send Inquiry</button>
        </form>
      </div>
    </div>
  )
}
