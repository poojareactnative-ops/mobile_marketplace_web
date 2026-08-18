import { useState } from 'react'
import { useRouter } from 'next/router'
import {
  Store,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  KeyRound,
} from 'lucide-react'
import InputField from '../../components/InputField'
import Feature from '../../components/Auth/Feature'
import DetailRow from '../../components/DetailRow'

export default function SuperSellerRegister() {
  const [mode, setMode] = useState('register')
  const [submitted, setSubmitted] = useState(false)
  const [loginSubmitted, setLoginSubmitted] = useState(false)

  const [form, setForm] = useState({
    name: '',
    address: '',
    lat: '',
    lng: '',
    phone: '',
  })

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter()

  function handleChange(e) {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function handleLoginChange(e) {
    const { name, value } = e.target

    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function submitRegistration(e) {
    e.preventDefault()

    // TODO: POST registration data to your API
    console.log('Seller registration:', form)

    setSubmitted(true)
  }

  function submitLogin(e) {
    e.preventDefault()

    // TODO: POST login credentials to your API
    console.log('Seller login:', loginForm)

    setLoginSubmitted(true)

    // Redirect to seller dashboard after successful login
    router.push('/seller/dashboard')
  }

  /* ================================================= */
  /* REGISTRATION SUCCESS */
  /* ================================================= */

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-xl shadow-slate-200/60">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Registration Submitted!
          </h1>

          <p className="mt-3 leading-6 text-slate-500">
            Your Super Seller registration has been successfully submitted.
            Our team will review your shop details shortly.
          </p>

          <div className="mt-7 rounded-2xl bg-slate-50 p-5 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Shop Details
            </p>

            <div className="mt-4 space-y-3 text-sm">
              <DetailRow label="Shop" value={form.name} />
              <DetailRow label="Phone" value={form.phone} />
              <DetailRow label="Address" value={form.address} />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => {
                setSubmitted(false)
                setMode('register')
              }}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            >
              Register Another Shop
            </button>

            <button
              onClick={() => {
                setSubmitted(false)
                setMode('login')
              }}
              className="rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
            >
              Seller Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ================================================= */
  /* MAIN */
  /* ================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Background */}
      <div className="absolute inset-x-0 top-0 -z-0 h-[430px] overflow-hidden bg-slate-950">
        <div className="absolute -left-20 -top-32 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />

        <div className="absolute -right-20 top-10 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />

        <div className="absolute left-1/2 top-40 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-10 text-center text-white">
          <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur">
            <Sparkles className="h-4 w-4 text-indigo-300" />

            <span className="text-sm font-medium text-slate-200">
              Grow your local business
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Become a{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Super Seller
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Register your shop and reach more customers around you.
            Set up your seller profile in just a few minutes.
          </p>
        </div>

        {/* ================================================= */}
        {/* MAIN CARD */}
        {/* ================================================= */}

        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 lg:grid-cols-[0.85fr_1.15fr]">

          {/* ================================================= */}
          {/* LEFT SIDE */}
          {/* ================================================= */}

          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-8 text-white sm:p-10">
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />

            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-black/10 blur-2xl" />

            <div className="relative">
              {mode === 'register' ? (
                <RegisterInfo onLogin={() => setMode('login')} />
              ) : (
                <LoginPanel
                  loginForm={loginForm}
                  handleLoginChange={handleLoginChange}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  onSubmit={submitLogin}
                  onRegister={() => setMode('register')}
                  loginSubmitted={loginSubmitted}
                />
              )}
            </div>
          </div>

          {/* ================================================= */}
          {/* RIGHT SIDE */}
          {/* ================================================= */}

          <div className="p-6 sm:p-10">
            {mode === 'register' ? (
              <RegistrationForm
                form={form}
                handleChange={handleChange}
                submitRegistration={submitRegistration}
              />
            ) : (
              <LoginInfo
                onRegister={() => setMode('register')}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

/* ================================================= */
/* REGISTER LEFT PANEL */
/* ================================================= */

function RegisterInfo({ onLogin }) {
  return (
    <>
      <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
        <Store className="h-7 w-7" />
      </div>

      <h2 className="text-2xl font-bold">
        Sell more. Reach more.
      </h2>

      <p className="mt-3 leading-7 text-indigo-100">
        Join our seller network and make your shop easier to discover
        by nearby customers.
      </p>

      <div className="mt-10 space-y-6">
        <Feature
          icon={<MapPin className="h-5 w-5" />}
          title="Local Discovery"
          description="Help customers find your shop nearby."
        />

        <Feature
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Trusted Seller"
          description="Build credibility with a verified seller profile."
        />

        <Feature
          icon={<Navigation className="h-5 w-5" />}
          title="Easy Location Setup"
          description="Add your exact shop location for better reach."
        />
      </div>

      {/* Login CTA */}
      <div className="mt-10 border-t border-white/10 pt-7">
        <p className="text-sm text-indigo-100">
          Already registered as a seller?
        </p>

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

/* ================================================= */
/* LOGIN LEFT PANEL */
/* ================================================= */

function LoginPanel({
  loginForm,
  handleLoginChange,
  showPassword,
  setShowPassword,
  onSubmit,
  onRegister,
  loginSubmitted,
}) {
  return (
    <>
      <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
        <LogIn className="h-7 w-7" />
      </div>

      <h2 className="text-2xl font-bold">
        Welcome back
      </h2>

      <p className="mt-3 leading-7 text-indigo-100">
        Login to manage your shop, products, orders and customer enquiries.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4"
      >
        {/* Email */}
        <div>
          <label className="mb-2 block text-xs font-semibold text-indigo-100">
            Email address
          </label>

          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-200" />

            <input
              type="email"
              name="email"
              value={loginForm.email}
              onChange={handleLoginChange}
              placeholder="seller@example.com"
              required
              className="w-full rounded-xl border border-white/10 bg-white/10 py-3.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-indigo-200/60 backdrop-blur transition focus:border-white/30 focus:bg-white/15"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="mb-2 block text-xs font-semibold text-indigo-100">
            Password
          </label>

          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-200" />

            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={loginForm.password}
              onChange={handleLoginChange}
              placeholder="Enter your password"
              required
              className="w-full rounded-xl border border-white/10 bg-white/10 py-3.5 pl-10 pr-11 text-sm text-white outline-none placeholder:text-indigo-200/60 backdrop-blur transition focus:border-white/30 focus:bg-white/15"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-200 transition hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Forgot */}
        <div className="flex justify-end">
          <a
            href="/seller/forgot-password"
            className="text-xs font-medium text-indigo-100 transition hover:text-white hover:underline"
          >
            Forgot password?
          </a>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
        >
          <LogIn className="h-4 w-4" />

          {loginSubmitted ? 'Logging in...' : 'Login'}

          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </form>

      {/* Register */}
      <div className="mt-8 border-t border-white/10 pt-6">
        <p className="text-center text-xs text-indigo-100">
          Don't have a seller account?
        </p>

        <button
          type="button"
          onClick={onRegister}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <UserPlus className="h-4 w-4" />

          Create Seller Account
        </button>
      </div>
    </>
  )
}

/* ================================================= */
/* REGISTRATION FORM */
/* ================================================= */

function RegistrationForm({
  form,
  handleChange,
  submitRegistration,
}) {
  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-semibold text-indigo-600">
          SELLER REGISTRATION
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          Shop information
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Enter your shop details below to create your seller profile.
        </p>
      </div>

      <form
        onSubmit={submitRegistration}
        className="space-y-5"
      >
        <InputField
          label="Shop name"
          name="name"
          placeholder="e.g. Pooja Mobile Store"
          value={form.name}
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

        {/* Location */}
        <div className="pt-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Shop location
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Add the latitude and longitude of your shop.
              </p>
            </div>

            <Navigation className="h-5 w-5 text-indigo-500" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Latitude"
              name="lat"
              type="number"
              step="any"
              placeholder="23.2599"
              value={form.lat}
              onChange={handleChange}
              required
            />

            <InputField
              label="Longitude"
              name="lng"
              type="number"
              step="any"
              placeholder="77.4126"
              value={form.lng}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="group mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition duration-200 hover:bg-indigo-600 hover:shadow-indigo-600/20 focus:outline-none focus:ring-4 focus:ring-indigo-100"
        >
          Register as Super Seller

          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>

        <p className="text-center text-xs leading-5 text-slate-400">
          By registering, you agree to our seller terms and conditions.
        </p>
      </form>
    </>
  )
}

/* ================================================= */
/* LOGIN RIGHT INFO */
/* ================================================= */

function LoginInfo({ onRegister }) {
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <KeyRound className="h-7 w-7" />
      </div>

      <p className="mt-8 text-sm font-semibold text-indigo-600">
        SELLER PORTAL
      </p>

      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        Manage your business from one place.
      </h2>

      <p className="mt-4 text-sm leading-7 text-slate-500">
        Login to manage your shop profile, products, offers, orders,
        enquiries and customer interactions.
      </p>

      <div className="mt-8 space-y-4">
        <LoginBenefit
          title="Manage Products"
          description="Add, update and manage your mobile accessories."
        />

        <LoginBenefit
          title="Track Orders"
          description="Keep track of customer orders and enquiries."
        />

        <LoginBenefit
          title="Create Offers"
          description="Publish special offers to nearby customers."
        />
      </div>

      <div className="mt-10 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <p className="text-sm font-semibold text-slate-900">
          New seller?
        </p>

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

/* ================================================= */
/* LOGIN BENEFIT */
/* ================================================= */

function LoginBenefit({ title, description }) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  )
}

/* ================================================= */
/* INPUT */
/* ================================================= */



/* ================================================= */
/* FEATURE */
/* ================================================= */


/* ================================================= */
/* DETAIL ROW */
/* ================================================= */

