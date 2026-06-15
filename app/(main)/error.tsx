'use client'
import { useEffect } from 'react'
import Button from '@/components/Button'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <div className="text-5xl">⚠️</div>
      <h2 className="text-xl font-bold text-gray-900">Terjadi Kesalahan</h2>
      <p className="text-gray-500 text-sm max-w-sm">Halaman ini tidak dapat dimuat. Coba lagi atau kembali ke beranda.</p>
      <Button onClick={reset}>Coba Lagi</Button>
    </div>
  )
}
