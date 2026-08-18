"use client"

import {
  Store,
  MapPin,
  Phone,
  ShieldCheck,
  Camera,
  Mail,
  Globe,
  ArrowRight,
  Twitter,
  Instagram,
  Facebook,
} from 'lucide-react'

const FooterColumn = ({ title, children }) => {
  return (
    <div>
      <h3 className="mb-5 text-sm font-semibold text-white">
        {title}
      </h3>

      <div className="space-y-3">{children}</div>
    </div>
  )
}

const FooterLink = ({ href, children }) => {
  return (
    <a
      href={href}
      className="group flex w-fit items-center gap-1 text-sm text-slate-400 transition duration-200 hover:text-white"
    >
      <span>{children}</span>

      {/* <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" /> */}
    </a>
  )
}

const Feature = ({ icon, title, description }) => {
  return (
    <div className="flex items-center gap-4 rounded-2xl px-4 py-3 transition duration-200 hover:bg-white/[0.03]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
        {icon}
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-200">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  )
}

const SocialLink = ({ href, label, icon }) => {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition duration-200 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400"
    >
      {icon}
    </a>
  )
}

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-slate-950 text-white">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="absolute -right-32 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-14 lg:px-8">
        {/* Main Footer */}
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 shadow-lg shadow-blue-500/20">
                <Store className="h-6 w-6 text-white" />
              </div>

              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  Hyperlocal Mobile
                </h2>

                <p className="text-xs text-slate-400">
                  Your local mobile marketplace
                </p>
              </div>
            </div>

            <p className="mt-6 max-w-sm text-sm leading-7 text-slate-400">
              Discover mobile accessories, trusted repair services, and
              nearby mobile shops. Everything you need, right around you.
            </p>

            {/* Location */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-slate-300 backdrop-blur-sm">
              <MapPin className="h-4 w-4 text-slate-300" />

              <span>Serving customers near you</span>
            </div>

            {/* Seller CTA */}
            <a
              href="/seller/register"
              className="group mt-5 flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition duration-200 hover:bg-blue-50"
            >
              <Store className="h-4 w-4" />

              <span>Become a Seller</span>

              <ArrowRight className="h-4 w-4 text-slate-600" />
            </a>
          </div>

          {/* Marketplace */}
          <FooterColumn title="Marketplace">
            <FooterLink href="/products">
              Browse Products
            </FooterLink>

            <FooterLink href="/categories">
              Categories
            </FooterLink>

            <FooterLink href="/shops">
              Nearby Shops
            </FooterLink>

            <FooterLink href="/repairs">
              Mobile Repair
            </FooterLink>
          </FooterColumn>

          {/* Sellers */}
          <FooterColumn title="For Sellers">
            <FooterLink href="/seller/register">
              Become a Seller
            </FooterLink>

            <FooterLink href="/seller/login">
              Seller Login
            </FooterLink>

            <FooterLink href="/seller/dashboard">
              Seller Dashboard
            </FooterLink>

            <FooterLink href="/seller/help">
              Seller Support
            </FooterLink>
          </FooterColumn>

          {/* Company */}
          <FooterColumn title="Company">
            <FooterLink href="/about">
              About Us
            </FooterLink>

            <FooterLink href="/contact">
              Contact Us
            </FooterLink>

            <FooterLink href="/privacy">
              Privacy Policy
            </FooterLink>

            <FooterLink href="/terms">
              Terms & Conditions
            </FooterLink>
          </FooterColumn>
        </div>

        {/* Feature Strip */}
        <div className="mt-14 grid gap-3 border-y border-white/10 py-6 sm:grid-cols-3">
          <Feature
            icon={<MapPin className="h-4 w-4 text-blue-400" />}
            title="Nearby Stores"
            description="Find shops around you"
          />

          <Feature
            icon={<ShieldCheck className="h-4 w-4 text-blue-400" />}
            title="Trusted Sellers"
            description="Shop with confidence"
          />

          <Feature
            icon={<Phone className="h-4 w-4 text-blue-400" />}
            title="Mobile Experts"
            description="Accessories & repairs"
          />
        </div>

        {/* Bottom */}
        <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Copyright */}
          <div>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Hyperlocal Mobile. All rights
              reserved.
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Made for local businesses and mobile users.
            </p>
          </div>

          {/* Social */}
          <div className="flex items-center gap-2">
            <SocialLink href="#" label="Instagram" icon={<Camera className="h-4 w-4" />} />

            <SocialLink href="#" label="Website" icon={<Globe className="h-4 w-4" />} />

            <SocialLink href="#" label="Mail" icon={<Mail className="h-4 w-4" />} />

            <SocialLink href="#" label="Support" icon={<Phone className="h-4 w-4" />} />
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer