'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Button from '@/components/Button'
import Input from '@/components/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <Image src="/logo.png" alt="RecycleMate" width={120} height={120} className="h-16 w-auto mx-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Lupa Password?</h1>
          <p className="text-gray-500 text-sm mt-1">Masukkan email kamu dan kami akan kirim link reset password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Email Terkirim!</h3>
              <p className="text-sm text-gray-500 mb-6">
                Kami telah mengirim link reset password ke <strong>{email}</strong>. Cek inbox atau folder spam kamu.
              </p>
              <Link href="/login" className="text-sm text-primary-800 font-semibold hover:underline">
                Kembali ke Login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="kamu@email.com"
                  required
                />
                <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
                  Kirim Link Reset Password
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Ingat password kamu?{' '}
          <Link href="/login" className="text-primary-800 font-semibold hover:underline">
            Masuk di sini
          </Link>
        </p>
        <p className="text-center mt-3">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Kembali ke Beranda
          </Link>
        </p>
      </div>
    </div>
  )
}
