import InputField from '../InputField'
import {
  User,
  Mail,
  Lock,
  Phone,
  Store,
  MapPin,
  Navigation,
  ArrowRight,
  Clock,
  MessageSquare,
  Sparkles,
  FileText,
} from 'lucide-react'

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
        </div>

        <h2 className="mt-3 text-2xl font-bold text-slate-900">
          {accountType === 'SUPER_SELLER' ? 'Super Seller Profile' : 'Customer Account'}
        </h2>

        <p className="mt-1.5 text-sm text-slate-500">
          {accountType === 'SUPER_SELLER'
            ? 'Register your store for Super Admin approval. List mobile accessories, manage repair tickets, and reach nearby buyers.'
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
          placeholder="+91 98450 12345"
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
              placeholder="e.g. Pooja Mobile Hub"
              value={form.shopName}
              onChange={handleChange}
              icon={<Store className="h-5 w-5" />}
              required
            />

            <InputField
              label="Shop address"
              name="address"
              placeholder="e.g. 12/4 Brigade Road, Bangalore"
              value={form.address}
              onChange={handleChange}
              icon={<MapPin className="h-5 w-5" />}
              required
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <InputField
                label="WhatsApp Number (Customer Enquiry)"
                name="whatsappNumber"
                type="tel"
                placeholder="919845012345"
                value={form.whatsappNumber || ''}
                onChange={handleChange}
                icon={<MessageSquare className="h-5 w-5" />}
              />

              <InputField
                label="Opening Hours"
                name="openingHours"
                placeholder="9:00 AM - 9:00 PM"
                value={form.openingHours || ''}
                onChange={handleChange}
                icon={<Clock className="h-5 w-5" />}
              />
            </div>

            <div>
              <label
                htmlFor="planType"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Onboarding Plan
              </label>
              <div className="relative">
                <Sparkles className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <select
                  id="planType"
                  name="planType"
                  value={form.planType || 'STARTER_MONTHLY'}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-8 text-sm font-medium text-slate-900 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                >
                  <option value="STARTER_MONTHLY">Starter Monthly (Standard)</option>
                  <option value="GROWTH_PRO">Growth Pro (Multi-Admin)</option>
                  <option value="ENTERPRISE">Enterprise Platinum</option>
                </select>
              </div>
            </div>

            <InputField
              label="Business Document URL (Optional GST/Certificate)"
              name="businessDocUrl"
              placeholder="https://example.com/gst-cert.pdf"
              value={form.businessDocUrl || ''}
              onChange={handleChange}
              icon={<FileText className="h-5 w-5" />}
            />

            <div className="pt-1">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Store GPS Coordinates</h3>
                  <p className="text-[11px] text-slate-500">
                    Used for hyper-local customer proximity search radius.
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
          {accountType === 'SUPER_SELLER'
            ? 'Submit Super Seller Registration'
            : 'Create Customer Account'}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>

        <p className="text-center text-xs leading-5 text-slate-400">
          Requests are reviewed by Super Admin. No payment gateway involved.
        </p>
      </form>
    </>
  )
}
