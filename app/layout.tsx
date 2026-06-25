import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import PageLoader from '@/components/PageLoader'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'RecycleMate | Marketplace Produk Daur Ulang',
  description: 'Jual beli produk daur ulang, limbah, bahan baku, dan kerajinan tangan ramah lingkungan.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={poppins.variable}>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <PageLoader />
        {children}
      </body>
    </html>
  )
}
