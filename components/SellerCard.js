import { Phone } from 'lucide-react'

export default function SellerCard({ seller }) {
  return (
    <div className="rounded-lg p-4 bg-white/60 backdrop-blur-md border border-white/40 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-lg font-semibold">{seller.name}</div>
          <div className="text-sm text-slate-600">{seller.type === 'super' ? 'Super Seller (repairs + accessories)' : 'Accessory Seller'}</div>
        </div>

        <div className="text-right">
          {seller.distance != null && <div className="text-sm font-medium">{seller.distance} m</div>}
          <div className="mt-1 flex items-center justify-end gap-2 text-sm text-slate-700">
            <Phone className="h-4 w-4 text-slate-500" />
            <span>{seller.phone}</span>
          </div>
        </div>
      </div>

      {seller.items && (
        <div className="mt-3">
          <div className="text-sm font-semibold">Products</div>
          <div className="text-sm text-slate-700">{seller.items.join(', ')}</div>
        </div>
      )}

      {seller.services && (
        <div className="mt-3">
          <div className="text-sm font-semibold">Repair Services</div>
          <div className="text-sm text-slate-700">{seller.services.join(', ')}</div>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <a className="text-sm text-blue-600 font-medium flex items-center gap-2" href={`tel:${seller.phone}`}><Phone className="h-4 w-4" />Call</a>
        <a className="text-sm text-blue-600 font-medium" href={`sms:${seller.phone}`}>SMS / Inquiry</a>
      </div>
    </div>
  )
}
