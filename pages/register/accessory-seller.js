import { useState } from 'react'

export default function AccessorySellerRegister() {
  const [form, setForm] = useState({ name: '', address: '', lat: '', lng: '', phone: '' })
  const [submitted, setSubmitted] = useState(false)

  function submit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Register as Accessory Seller</h1>
      <p>Accessory Sellers are accessories-only. Super Sellers may register accessory sellers for their network.</p>
      <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
        <input placeholder="Shop name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <input placeholder="Latitude" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} />
        <input placeholder="Longitude" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <button type="submit">Submit (demo)</button>
      </form>
      {submitted && (
        <pre style={{ marginTop: 12 }}>{JSON.stringify(form, null, 2)}</pre>
      )}
    </div>
  )
}
