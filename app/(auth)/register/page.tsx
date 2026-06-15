'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Recycle, ArrowLeft } from 'lucide-react'
import Button from '@/components/Button'
import Input from '@/components/Input'
import RoleCard from '@/components/RoleCard'

const ROLES = [
  { role: 'pembeli', title: 'Pembeli', description: 'Beli produk kerajinan & daur ulang' },
  { role: 'penumpul', title: 'Penumpul', description: 'Kumpulkan & jual limbah ke pengepul' },
  { role: 'pengepul', title: 'Pengepul', description: 'Sortir limbah jadi bahan baku' },
  { role: 'pengrajin', title: 'Pengrajin', description: 'Buat kerajinan dari bahan daur ulang' },
  { role: 'distributor', title: 'Distributor', description: 'Distribusikan produk ke pembeli' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', city: '', phone: '' })
  const [role, setRole] = useState('pembeli')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registrasi gagal')
      } else {
        router.push('/home')
      }
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-50 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-800 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-800 rounded-xl flex items-center justify-center">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-primary-800">RecycleMate</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Buat Akun Baru</h1>
          <p className="text-gray-500 text-sm mt-1">Bergabung dengan komunitas daur ulang Indonesia</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Nama Lengkap"
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nama kamu"
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="kamu@email.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Min. 6 karakter"
              required
              minLength={6}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Kota"
                type="text"
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="Jakarta"
              />
              <Input
                label="No. HP"
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="08xx"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Pilih Peran Kamu</p>
              <div className="grid grid-cols-1 gap-2">
                {ROLES.map(r => (
                  <RoleCard
                    key={r.role}
                    role={r.role}
                    title={r.title}
                    description={r.description}
                    selected={role === r.role}
                    onClick={() => setRole(r.role)}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
              Buat Akun
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-primary-800 font-semibold hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
