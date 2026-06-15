import Link from 'next/link'
import { Recycle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2"><Recycle className="w-10 h-10 text-gray-400" /></div>
      <h1 className="text-3xl font-bold text-gray-900">404</h1>
      <p className="text-gray-500">Halaman yang kamu cari tidak ditemukan.</p>
      <Link href="/home" className="mt-2 px-6 py-2.5 bg-primary-800 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors text-sm">
        Kembali ke Beranda
      </Link>
    </div>
  )
}
