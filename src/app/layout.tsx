
import React from 'react'
import { ReactNode } from 'react'
import QueryProvider from '../providers/QueryProvider'
import AuthProvider from '../providers/AuthProvider'
import ThemeProvider from '../providers/ThemeProvider'

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || 'Hyperlocal Mobile',
  description: 'Hyperlocal mobile accessories & repairs marketplace',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
