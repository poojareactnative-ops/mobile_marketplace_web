import Link from 'next/link'

function Error({ statusCode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white p-6">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-5xl font-extrabold text-slate-900">{statusCode || '500'}</h1>
        <p className="mt-4 text-lg text-slate-600">Oops — something went wrong.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Go home</Link>
          <Link href="/seller/dashboard" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Seller dashboard</Link>
        </div>
      </div>
    </div>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
