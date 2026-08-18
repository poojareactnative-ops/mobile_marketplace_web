"use client"
import './globals.css'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TopBanner from '../../components/TopBanner'
import Navbar from '../components/navigation/Navbar'
import Hero from '../../components/Hero'
import ProductShowcase from '../../components/ProductShowcase'
import HowItWorks from '../../components/HowItWorks'
import Features from '../../components/Features'
import Testimonials from '../../components/Testimonials'
import Footer from '../../components/Footer'


export default function Page() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    // Demo auth: check localStorage for a demo token (replace with real auth)
    const token = typeof window !== 'undefined' ? localStorage.getItem('demo_auth') : null
    if (token) {
      setLoggedIn(true)
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready && loggedIn) {
      router.push('/seller/dashboard')
    }
  }, [ready, loggedIn, router])

  if (!ready) return null

  // If not logged in, show the public homepage with hero and UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <TopBanner />

        <section id="hero" className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div id="hero-section" className="animate-float overflow-hidden rounded-3xl border border-white/70 bg-white/60 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6">
              <Hero onFind={() => {}} />

              <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <label htmlFor="radius" className="text-sm font-semibold text-slate-700">Search Radius</label>
                  <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">2.5 km</span>
                </div>
                <input id="radius" type="range" min={500} max={5000} step={250} defaultValue={2500} className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600" />
                <div className="mt-2 flex justify-between text-xs text-slate-400"><span>500 m</span><span>5 km</span></div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Nearby Shops</h2>
                <p className="mt-1 text-sm text-slate-500">Find trusted shops around you</p>
              </div>
            </div>
            <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
              <p className="text-sm font-medium text-slate-700">Discover shops near you</p>
              <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">Click "Find Nearby Shops" to detect your location and find mobile shops around you.</p>
            </div>
          </div>
        </section>

        <section id="products" className="mt-6 rounded-3xl border border-white/70 bg-white/60 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-8">
          <ProductShowcase />
        </section>

        <section id="how" className="mt-8 rounded-3xl border border-white/70 bg-white/60 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-8">
          <HowItWorks />
        </section>

        <section id="features" className="mt-6 rounded-3xl border border-white/70 bg-white/60 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-8">
          <Features />
        </section>

        <section id="testimonials" className="mt-6 rounded-3xl border border-white/70 bg-white/60 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-8">
          <Testimonials />
        </section>
      </main>

      <Footer />
    </div>
  )
}
