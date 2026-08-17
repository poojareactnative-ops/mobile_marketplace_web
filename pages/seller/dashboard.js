import Link from 'next/link'
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Tag,
  MessageCircle,
  PlusCircle,
  LogOut,
  User,
} from 'lucide-react'

const SAMPLE_PRODUCTS = [
  { id: 'p1', name: 'Tempered Glass', price: '₹199', stock: 42 },
  { id: 'p2', name: 'USB-C Cable (1m)', price: '₹299', stock: 12 },
  { id: 'p3', name: 'Wireless Earbuds', price: '₹1299', stock: 4 },
]

export default function SellerDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white/60 backdrop-blur px-4 py-3">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-600 p-2 text-white">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-semibold">Seller Dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1 text-sm font-medium text-indigo-600 shadow-sm">
              <User className="h-4 w-4" />
              Profile
            </button>

            <button className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <aside className="sticky top-6 self-start max-h-[calc(100vh-6rem)] overflow-auto">
            <nav className="space-y-3">
              <Link href="/seller/dashboard" className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm font-medium shadow-sm">
                <ShoppingBag className="h-4 w-4 text-indigo-600" />
                Products
              </Link>

              <Link href="/seller/orders" className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm hover:bg-white/60">
                <ClipboardList className="h-4 w-4 text-slate-600" />
                Orders
              </Link>

              <Link href="/seller/offers" className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm hover:bg-white/60">
                <Tag className="h-4 w-4 text-slate-600" />
                Offers
              </Link>

              <Link href="/seller/enquiries" className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm hover:bg-white/60">
                <MessageCircle className="h-4 w-4 text-slate-600" />
                Enquiries
              </Link>
            </nav>
          </aside>

          {/* Content */}
          <section>
            {/* Summary */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Products</p>
                    <p className="mt-1 text-2xl font-bold">{SAMPLE_PRODUCTS.length}</p>
                  </div>

                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Orders</p>
                    <p className="mt-1 text-2xl font-bold">12</p>
                  </div>

                  <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Active Offers</p>
                    <p className="mt-1 text-2xl font-bold">3</p>
                  </div>

                  <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
                    <Tag className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">New Enquiries</p>
                    <p className="mt-1 text-2xl font-bold">5</p>
                  </div>

                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Products list header */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Products</h2>

              <div className="flex items-center gap-2">
                <Link href="/seller/products/new" className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm">
                  <PlusCircle className="h-4 w-4" />
                  Add product
                </Link>
              </div>
            </div>

            {/* Products table */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500">
                      <th className="py-2">Product</th>
                      <th className="py-2">Price</th>
                      <th className="py-2">Stock</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {SAMPLE_PRODUCTS.map((p) => (
                      <tr key={p.id} className="align-middle">
                        <td className="py-3">
                          <div className="font-medium text-slate-900">{p.name}</div>
                        </td>

                        <td className="py-3">{p.price}</td>

                        <td className="py-3">{p.stock}</td>

                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <button className="rounded-md border border-slate-200 px-3 py-1 text-sm">Edit</button>
                            <button className="rounded-md border border-red-300 bg-red-50 px-3 py-1 text-sm text-red-600">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
