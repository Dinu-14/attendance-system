// app/layout.tsx
'use client' // You might need to add this if AuthGuard causes issues, but often not.
             // Best to keep RootLayout as a Server Component if possible.

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './context/AuthContext'
import AuthGuard from "./components/AuthGuard" // Adjust the import path
import { Toaster } from 'react-hot-toast'


const inter = Inter({ subsets: ['latin'] })

// You can still export metadata from a server component layout
// export const metadata: Metadata = { ... }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AuthGuard>
            {children}
          </AuthGuard>
          <Toaster position="top-center" reverseOrder={false} />
        </AuthProvider>
      </body>
    </html>
  )
}