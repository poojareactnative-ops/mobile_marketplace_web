"use client"

import { MapPin, Search, MessageSquare, Repeat } from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    { id: 1, icon: MapPin, text: 'Customers allow location access or enter their address.' },
    { id: 2, icon: Search, text: 'The platform finds Super Sellers and Accessory Sellers within your radius.' },
    { id: 3, icon: MessageSquare, text: 'Customers send enquiries (name, phone, location, product/service interest).' },
    { id: 4, icon: Repeat, text: 'Shops reply, post offers, and serve nearby customers quickly.' },
  ]

  return (
    <div>
      <h3 className="text-xl font-semibold">How it Works</h3>
      <ol className="mt-3 text-sm text-slate-700 space-y-3">
        {steps.map((s) => {
          const Icon = s.icon
          return (
            <li key={s.id} className="flex items-start gap-3">
              <Icon className="h-5 w-5 text-blue-500 mt-0.5" />
              <span>{s.text}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
