import Link from 'next/link'
import '../src/app/globals.css'
import {
  ArrowLeft,
  ArrowRight,
  Home,
  Search,
  ShoppingBag,
  Smartphone,
  Store,
  MapPin,
} from 'lucide-react'


export default function Custom404() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">

      {/* ========================================= */}
      {/* BACKGROUND */}
      {/* ========================================= */}

      <div className="pointer-events-none absolute inset-0">

        {/* Gradient blobs */}
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />

        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

      </div>

      {/* ========================================= */}
      {/* CONTENT */}
      {/* ========================================= */}

      <div className="relative z-10 w-full max-w-3xl">

        {/* Brand */}
        <div className="mb-10 flex justify-center">

          <Link
            href="/"
            className="group flex items-center gap-3"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-600/20 transition duration-300 group-hover:scale-105">
              <Smartphone className="h-5 w-5" />
            </div>

            <div className="text-left">
              <p className="text-sm font-bold text-white">
                Hyperlocal Mobile
              </p>

              <p className="text-[11px] text-slate-500">
                Your local mobile marketplace
              </p>
            </div>

          </Link>

        </div>

        {/* Main Card */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-10">

          {/* Card decoration */}
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-2xl" />

          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-violet-500/10 blur-2xl" />

          <div className="relative text-center">

            {/* 404 visual */}
            <div className="relative mx-auto mb-8 w-fit">

              <div className="text-[110px] font-black leading-none tracking-[-0.08em] text-transparent bg-gradient-to-br from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text sm:text-[150px]">
                404
              </div>

              {/* Floating icons */}
              <div className="absolute -left-7 top-8 flex h-12 w-12 rotate-[-12deg] items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-indigo-300 shadow-xl backdrop-blur-md sm:-left-12">
                <Search className="h-5 w-5" />
              </div>

              <div className="absolute -right-7 bottom-6 flex h-12 w-12 rotate-[12deg] items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-cyan-300 shadow-xl backdrop-blur-md sm:-right-12">
                <MapPin className="h-5 w-5" />
              </div>

            </div>

            {/* Badge */}
            <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2">

              <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />

              <span className="text-xs font-semibold text-indigo-300">
                PAGE NOT FOUND
              </span>

            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Looks like you took a wrong turn.
            </h1>

            {/* Description */}
            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-400 sm:text-base">
              The page you're looking for doesn't exist or may have been
              moved. Let's get you back to something useful.
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

              <Link
                href="/"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-slate-900 shadow-xl shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-50"
              >
                <Home className="h-4 w-4" />

                Go to Homepage

                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/seller/dashboard"
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:border-indigo-400/30 hover:bg-indigo-500/10"
              >
                <Store className="h-4 w-4 text-indigo-300" />

                Seller Dashboard

                <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-indigo-300" />
              </Link>

            </div>

            {/* Back */}
            <button
              type="button"
              onClick={() => window.history.back()}
              className="group mx-auto mt-6 flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />

              Go back to previous page
            </button>

          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">

          <QuickLink
            href="/shops"
            icon={<Store className="h-4 w-4" />}
            label="Nearby Shops"
          />

          <QuickLink
            href="/products"
            icon={<ShoppingBag className="h-4 w-4" />}
            label="Browse Products"
          />

          <QuickLink
            href="/seller/register"
            icon={<Smartphone className="h-4 w-4" />}
            label="Become a Seller"
            className="col-span-2 sm:col-span-1"
          />

        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} Hyperlocal Mobile. All rights reserved.
        </p>

      </div>
    </main>
  )
}

/* ========================================= */
/* QUICK LINK */
/* ========================================= */

function QuickLink({
  href,
  icon,
  label,
  className = '',
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-xs font-semibold text-slate-400 backdrop-blur-sm transition duration-200 hover:border-white/10 hover:bg-white/[0.07] hover:text-white ${className}`}
    >
      <span className="text-indigo-400 transition group-hover:scale-110">
        {icon}
      </span>

      {label}
    </Link>
  )
}