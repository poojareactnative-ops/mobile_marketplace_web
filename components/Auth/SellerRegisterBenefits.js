import {
  Sparkles,
  Store,
  MapPin,
  Phone,
  ShieldCheck,
  LogIn,
  ArrowRight,
  KeyRound,
  CheckCircle2,
} from 'lucide-react'
import Feature from '../Auth/Feature'

export function RegisterSidebar({ onLogin }) {
  return (
    <>
      <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
        <Sparkles className="h-7 w-7" />
      </div>

      <h2 className="text-2xl font-bold">Why become a Super Seller?</h2>
      <p className="mt-3 leading-7 text-indigo-100">
        Join our network of verified mobile repair and accessories sellers in Bangalore.
      </p>

      <div className="mt-8 space-y-4">
        <Feature
          icon={<Store className="h-5 w-5" />}
          title="Digital Storefront"
          description="Get a dedicated shop page to showcase your products and repairs."
        />
        <Feature
          icon={<MapPin className="h-5 w-5" />}
          title="Local Visibility"
          description="Reach customers actively searching for mobile services near you."
        />
        <Feature
          icon={<Phone className="h-5 w-5" />}
          title="Direct Inquiries"
          description="Receive customer calls, chat requests and repair bookings directly."
        />
        <Feature
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Verified Badge"
          description="Build trust with a verified seller badge on your shop profile."
        />
      </div>

      <div className="mt-10 border-t border-white/10 pt-6">
        <p className="text-sm text-indigo-100">Already registered as a seller?</p>
        <button
          type="button"
          onClick={onLogin}
          className="group mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
        >
          <LogIn className="h-4 w-4" />
          Login to Seller Account
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </>
  )
}

export function LoginInfo({ onRegister }) {
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <KeyRound className="h-7 w-7" />
      </div>

      <p className="mt-8 text-sm font-semibold text-indigo-600">SELLER PORTAL</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        Manage your business from one place.
      </h2>
      <p className="mt-4 text-sm leading-7 text-slate-500">
        Login to manage your shop profile, products, offers, orders, enquiries and customer
        interactions.
      </p>

      <div className="mt-8 space-y-4">
        <div className="flex gap-3">
          <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Manage Products</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Add, update and manage your mobile accessories.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Track Orders</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Keep track of customer orders and enquiries.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Create Offers</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Publish special offers to nearby customers.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <p className="text-sm font-semibold text-slate-900">New seller?</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Register your shop and start reaching customers in your area.
        </p>
        <button
          type="button"
          onClick={onRegister}
          className="mt-4 flex items-center gap-2 text-sm font-bold text-indigo-600 transition hover:text-indigo-700"
        >
          Create Seller Account
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
