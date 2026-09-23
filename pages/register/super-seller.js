import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Sparkles, ArrowLeft } from 'lucide-react'
import apiClient from '../../src/lib/api/client'
import { useAuthStore } from '../../src/store/auth.store'

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
      const res = await apiClient.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        shopName: accountType === 'SUPER_SELLER' ? form.shopName || form.name : undefined,
        address: accountType === 'SUPER_SELLER' ? form.address : undefined,
        latitude: accountType === 'SUPER_SELLER' && form.lat ? parseFloat(form.lat) : undefined,
        longitude: accountType === 'SUPER_SELLER' && form.lng ? parseFloat(form.lng) : undefined,
        role: accountType,
      })
      const { user, shop, tokens } = res.data.data
      useAuthStore.getState().setAuth(user, shop, tokens.accessToken)
      setSubmitted(true)
    } catch (err) {
      setRegError(
        err.response?.data?.error?.message || 'Registration failed. Please check your details.'
      )
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
      const res = await apiClient.post('/auth/login', loginForm)
      const { user, shop, tokens } = res.data.data
      useAuthStore.getState().setAuth(user, shop, tokens.accessToken)
      if (user.role === 'ADMIN' || user.role === 'PLATFORM_ADMIN') {
        router.push('/admin')
      } else if (user.role === 'CUSTOMER') {
        router.push('/products')
      } else {
        router.push('/seller/dashboard')
      }
    } catch (err) {
      setLoginError(err.response?.data?.error?.message || 'Invalid email or password.')
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
