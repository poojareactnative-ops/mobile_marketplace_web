import './globals.css';
import Providers from '../components/Providers';

export const metadata = {
  title: 'SmartFix Hub - Supabase & Next.js Mobile Repair & 2% Referral Platform',
  description: 'Hyperlocal mobile repair shop workbench and accessory seller referral platform with automated 2% commission splits, powered by Supabase and Next.js.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

