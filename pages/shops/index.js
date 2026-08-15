import { useEffect, useState } from 'react'
import SellerCard from '../../components/SellerCard'

export default function Shops(){
  const [sellers, setSellers] = useState([])
  useEffect(()=>{
    fetch('/api/sellers').then(r=>r.json()).then(setSellers)
  },[])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h2 className="text-2xl font-bold mb-4">All Shops (demo)</h2>
      <div className="grid gap-4">
        {sellers.map(s=> (
          <div key={s.id} className="rounded-xl bg-white/60 backdrop-blur-md border border-white/40 p-4 shadow-sm">
            <SellerCard seller={s} />
          </div>
        ))}
      </div>
    </div>
  )
}
