import '../styles.css'
import QueryProvider from '../src/providers/QueryProvider'
import RouteGuard from '../src/components/auth/RouteGuard'

export default function MyApp({ Component, pageProps }) {
  return (
    <QueryProvider>
      <RouteGuard>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-sky-50">
          <Component {...pageProps} />
        </div>
      </RouteGuard>
    </QueryProvider>
  )
}
