import InputField from '../InputField'
import { User, Mail, Lock, Phone, Store, MapPin, Navigation, ArrowRight } from 'lucide-react'

export default function SellerRegisterForm({
  form,
  accountType,
  setAccountType,
  handleChange,
  submitRegistration,
  regError,
  loginSubmitted,
}) {
  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAccountType('SUPER_SELLER')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              accountType === 'SUPER_SELLER'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Super Seller
          </button>
          <button
            type="button"
            onClick={() => setAccountType('CUSTOMER')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              accountType === 'CUSTOMER'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Normal Customer
          </button>
        </div>

        <h2 className="mt-3 text-2xl font-bold text-slate-900">
          {accountType === 'SUPER_SELLER' ? 'Super Seller Profile' : 'Customer Account'}
        </h2>

        <p className="mt-1.5 text-sm text-slate-500">
          {accountType === 'SUPER_SELLER'
            ? 'List mobile accessories, take repair tickets, and reach nearby buyers.'
            : 'Explore genuine local accessories and send verified enquiries.'}
        </p>

        {regError && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-600">
            {regError}
          </div>
        )}
      </div>

      <form onSubmit={submitRegistration} className="space-y-4">
        <InputField
          label="Your Full Name"
          name="name"
          placeholder="e.g. Pooja Mourya"
          value={form.name}
          onChange={handleChange}
          icon={<User className="h-5 w-5" />}
          required
        />

        <InputField
          label="Email Address (Login Username)"
          name="email"
          type="email"
          placeholder="e.g. pooja@example.com"
          value={form.email}
          onChange={handleChange}
          icon={<Mail className="h-5 w-5" />}
          required
        />

        <InputField
          label="Password (min 6 characters)"
          name="password"
          type="password"
          placeholder="Create a secure password"
          value={form.password}
          onChange={handleChange}
          icon={<Lock className="h-5 w-5" />}
          required
        />

        <InputField
          label="Phone number"
          name="phone"
          type="tel"
          placeholder="+91 98765 43210"
          value={form.phone}
          onChange={handleChange}
          icon={<Phone className="h-5 w-5" />}
          required
        />

        {accountType === 'SUPER_SELLER' && (
          <>
            <InputField
              label="Shop name"
              name="shopName"
              placeholder="e.g. Pooja Mobile Store"
              value={form.shopName}
              onChange={handleChange}
              icon={<Store className="h-5 w-5" />}
              required
            />

            <InputField
              label="Shop address"
              name="address"
              placeholder="Enter complete shop address"
              value={form.address}
              onChange={handleChange}
              icon={<MapPin className="h-5 w-5" />}
              required
            />

            <div className="pt-1">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Store GPS Coordinates</h3>
                  <p className="text-[11px] text-slate-500">
                    Used to calculate proximity for nearby customer inquiries.
                  </p>
                </div>
                <Navigation className="h-4 w-4 text-indigo-500" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InputField
                  label="Latitude"
                  name="lat"
                  type="number"
                  step="any"
                  placeholder="12.9716"
                  value={form.lat}
                  onChange={handleChange}
                  required
                />
                <InputField
                  label="Longitude"
                  name="lng"
                  type="number"
                  step="any"
                  placeholder="77.5946"
                  value={form.lng}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loginSubmitted}
          className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition duration-200 hover:bg-indigo-600 hover:shadow-indigo-600/20 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:opacity-75"
        >
          {accountType === 'SUPER_SELLER' ? 'Register as Super Seller' : 'Create Customer Account'}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>

        <p className="text-center text-xs leading-5 text-slate-400">
          By registering, you agree to our seller terms and conditions.
        </p>
      </form>
    </>
  )
}
