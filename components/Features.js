import { CheckCircle2 } from 'lucide-react'

export default function Features() {
  const items = [
    { id: 1, title: 'Location-based matching', desc: 'find shops within 1–3 km.' },
    { id: 2, title: 'Customer enquiries', desc: 'name, phone, location, product/service interest.' },
    { id: 3, title: 'Shop controls', desc: 'list products, repair services, and set service radius.' },
    { id: 4, title: 'Offers & promotions', desc: 'shops can publish offers visible to nearby customers.' },
  ]

  return (
    <div>
      <h3 className="text-xl font-semibold">Features</h3>
      <ul className="mt-3 text-sm text-slate-700 space-y-3">
        {items.map((it) => (
          <li key={it.id} className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <strong>{it.title}</strong> — {it.desc}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
