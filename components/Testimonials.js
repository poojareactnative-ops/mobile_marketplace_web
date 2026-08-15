export default function Testimonials() {
  const items = [
    { id: 1, text: 'Found a repair shop within 1km — screen fixed same day!', name: 'Asha' },
    { id: 2, text: 'Great selection of accessories and fast service.', name: 'Ravi' },
    { id: 3, text: 'Promotions helped me save on a battery replacement.', name: 'Meera' }
  ]

  return (
    <div>
      <h3 className="text-xl font-semibold">What Customers Say</h3>
      <div className="mt-3 grid gap-3">
        {items.map((t) => (
          <div key={t.id} className="p-4 bg-white/60 backdrop-blur rounded-lg border border-white/40">
            <div className="text-sm text-slate-700">“{t.text}”</div>
            <div className="mt-2 font-semibold">{t.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
