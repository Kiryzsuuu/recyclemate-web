'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Button from '@/components/Button'
import Input from '@/components/Input'
import RoleCard from '@/components/RoleCard'

const STORE_TYPES = [
  { role: 'penumpul', title: 'Toko Penumpul', description: 'Jual limbah & sampah ke pengepul', icon: '🗑️' },
  { role: 'pengepul', title: 'Toko Pengepul', description: 'Beli & olah limbah jadi bahan baku', icon: '🏭' },
  { role: 'pengrajin', title: 'Toko Pengrajin', description: 'Buat & jual kerajinan daur ulang', icon: '🎨' },
  { role: 'distributor', title: 'Toko Distributor', description: 'Distribusikan produk ke konsumen', icon: '🚚' },
]

export default function OpenStorePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [storeType, setStoreType] = useState('')
  const [form, setForm] = useState({ storeName: '', description: '', city: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!storeType || !form.storeName) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, storeType }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal membuka toko')
      } else {
        router.push('/store/manage')
      }
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-8">
        <button onClick={() => step === 1 ? router.back() : setStep(1)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> {step === 1 ? 'Kembali' : 'Pilih Tipe Toko'}
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-primary-800 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <div className={`h-0.5 flex-1 ${step >= 2 ? 'bg-primary-800' : 'bg-gray-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-primary-800 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
          </div>

          {step === 1 ? (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Pilih Tipe Toko</h2>
              <p className="text-gray-500 text-sm mb-6">Pilih jenis toko yang sesuai dengan peranmu</p>
              <div className="flex flex-col gap-3 mb-6">
                {STORE_TYPES.map(t => (
                  <RoleCard
                    key={t.role}
                    role={t.role}
                    title={t.title}
                    description={t.description}
                    icon={t.icon}
                    selected={storeType === t.role}
                    onClick={() => setStoreType(t.role)}
                  />
                ))}
              </div>
              <Button disabled={!storeType} onClick={() => setStep(2)} size="lg" className="w-full">
                Lanjut <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Detail Toko</h2>
              <p className="text-gray-500 text-sm mb-6">Lengkapi informasi tokomu</p>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
              )}
              <div className="flex flex-col gap-4">
                <Input
                  label="Nama Toko"
                  value={form.storeName}
                  onChange={e => setForm(f => ({ ...f, storeName: e.target.value }))}
                  placeholder="Nama toko kamu"
                  required
                />
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Deskripsi Toko</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
                    placeholder="Ceritakan tentang tokomu..."
                  />
                </div>
                <Input
                  label="Kota"
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  placeholder="Kota toko"
                />
                <Input
                  label="No. HP / WhatsApp"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="08xx"
                />
                <Button loading={loading} onClick={submit} size="lg" className="w-full mt-2">
                  Buka Toko Sekarang!
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
