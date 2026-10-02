import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Sparkles, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../../src/store/auth.store'
import authService from '../../src/lib/api/auth.service'

import SellerLoginPanel from '../../components/auth/SellerLoginPanel'
import SellerRegisterForm from '../../components/auth/SellerRegisterForm'
import { RegisterSidebar, LoginInfo } from '../../components/auth/SellerRegisterBenefits'
import SellerSuccessView from '../../components/auth/SellerSuccessView'

export default function SuperSellerRegister() {
  const router = useRouter()
  const [mode, setMode] = useState('login')
  const [accountType, setAccountType] = useState('SUPER_SELLER')
  const [submitted, setSubmitted] = useState(false)
  const [loginSubmitted, setLoginSubmitted] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [regError, setRegError] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    shopName: '',
    address: '',
    lat: '12.9716',
    lng: '77.5946',
    whatsappNumber: '',
    openingHours: '9:00 AM - 9:00 PM',
    planType: 'STARTER_MONTHLY',
    businessDocUrl: '',
  })

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (router.query.mode === 'register') {
      setMode('register')
    }
    if (router.query.type === 'customer') {
      setAccountType('CUSTOMER')
    }
  }, [router.query])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleLoginChange(e) {
    const { name, value } = e.target
    setLoginForm((prev) => ({ ...prev, [name]: value }))
  }

  async function submitRegistration(e) {
    e.preventDefault()
    setLoginSubmitted(true)
    setRegError('')

    if (accountType === 'SUPER_SELLER' && (!form.shopName.trim() || !form.address.trim())) {
      setRegError('Shop Name and Shop Address are required for Super Sellers.')
      setLoginSubmitted(false)
      return
    }

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        shopName: form.shopName.trim() || form.name.trim(),
        shopType: 'SUPER_SELLER',
        address: form.address.trim(),
        latitude: form.lat ? parseFloat(form.lat) : 12.9716,
        longitude: form.lng ? parseFloat(form.lng) : 77.5946,
        whatsappNumber: form.whatsappNumber?.trim() || form.phone.trim(),
        businessDocUrl: form.businessDocUrl?.trim() || undefined,
        openingHours: form.openingHours?.trim() || '9:00 AM - 9:00 PM',
        planType: form.planType || 'STARTER_MONTHLY',
      }

      const res = await authService.registerSuperSeller(payload)

      // If tokens or user profile returned, store them
      const user = res?.data?.user || res?.user
      const shop = res?.data?.shop || res?.shop
      const tokens = res?.data?.tokens || res?.tokens
      if (user && tokens?.accessToken) {
        useAuthStore.getState().setAuth(user, shop, tokens.accessToken, tokens.refreshToken)
      }

      setSubmitted(true)
    } catch (err) {
      if (err.response?.status === 409) {
        setRegError('Email already registered. Please login or use a different email.')
      } else {
        setRegError(
          err.response?.data?.message ||
            err.response?.data?.error?.message ||
            'Registration failed. Please check your details.'
        )
      }
    } finally {
      setLoginSubmitted(false)
    }
  }

  async function submitLogin(e) {
    e.preventDefault()
    setLoginSubmitted(true)
    setLoginError('')

    if (!loginForm.email.trim() || !loginForm.password) {
      setLoginError('Please enter both your registered email and password.')
      setLoginSubmitted(false)
      return
    }

    try {
      const { user } = await useAuthStore.getState().login({
        email: loginForm.email.trim(),
        password: loginForm.password,
      })

      const redirect = router.query.redirect
      if (redirect && typeof redirect === 'string' && redirect.startsWith('/')) {
        router.push(redirect)
      } else if (user?.role === 'ADMIN' || user?.role === 'PLATFORM_ADMIN' || user?.role === 'SUPER_ADMIN') {
        router.push('/admin')
      } else if (user?.role === 'CUSTOMER') {
        router.push('/products')
      } else {
        router.push('/seller/dashboard')
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setLoginError('Invalid email or password.')
      } else if (err.response?.status === 403) {
        setLoginError(
          err.response?.data?.message ||
            'Your account is pending Super Admin approval or has been suspended.'
        )
      } else {
        setLoginError(
          err.response?.data?.message ||
            err.response?.data?.error?.message ||
            'Login failed. Please check your credentials.'
        )
      }
    } finally {
      setLoginSubmitted(false)
    }
  }

  if (submitted) {
    return (
      <SellerSuccessView
        form={form}
        onRegisterAnother={() => {
          setSubmitted(false)
          setMode('register')
        }}
        onLogin={() => {
          setSubmitted(false)
          setMode('login')
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Background Gradient */}
      <div className="absolute inset-x-0 top-0 -z-0 h-[430px] overflow-hidden bg-slate-950">
        <div className="absolute -left-20 -top-32 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute -right-20 top-10 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute left-1/2 top-40 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center text-white">
          <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur">
            <Sparkles className="h-4 w-4 text-indigo-300" />
            <span className="text-sm font-medium text-slate-200">Grow your local business</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Become a{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Super Seller
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Register your shop and reach more customers around you. Set up your seller profile in
            just a few minutes.
          </p>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10">
          <div className="grid lg:grid-cols-12">
            {/* Left Panel */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 text-white sm:p-12 lg:col-span-5">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-violet-400/20 blur-2xl" />

              <div className="relative z-10">
                {mode === 'login' ? (
                  <SellerLoginPanel
                    loginForm={loginForm}
                    handleLoginChange={handleLoginChange}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    onSubmit={submitLogin}
                    onRegister={() => setMode('register')}
                    loginSubmitted={loginSubmitted}
                    loginError={loginError}
                  />
                ) : (
                  <RegisterSidebar onLogin={() => setMode('login')} />
                )}
              </div>
            </div>

            {/* Right Panel */}
            <div className="p-8 sm:p-12 lg:col-span-7">
              {mode === 'login' ? (
                <LoginInfo onRegister={() => setMode('register')} />
              ) : (
                <SellerRegisterForm
                  form={form}
                  accountType={accountType}
                  setAccountType={setAccountType}
                  handleChange={handleChange}
                  submitRegistration={submitRegistration}
                  regError={regError}
                  loginSubmitted={loginSubmitted}
                />
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  )
}
