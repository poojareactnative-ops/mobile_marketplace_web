import '../styles.css'


export default function MyApp({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-sky-50">
      <Component {...pageProps} />
    </div>
  )
}
