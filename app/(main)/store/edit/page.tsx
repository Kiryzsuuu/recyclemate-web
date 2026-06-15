'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Store } from 'lucide-react'
import Button from '@/components/Button'
import Input from '@/components/Input'

export default function EditStorePage() {
  const router = useRouter()
  const [form, setForm] = useState({ storeName: '', description: '', city: '', phone: '', logoUrl: '', logoPreview: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [noStore, setNoStore] = useState(false)

  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then(data => {
        if (!data.store) { setNoStore(true); setLoading(false); return }
        const s = data.store
        setForm({ storeName: s.storeName, description: s.description || '', city: s.city || '', phone: s.phone || '', logoUrl: s.logoUrl || '', logoPreview: s.logoUrl || '' })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setForm(f => ({ ...f, logoUrl: base64, logoPreview: base64 }))
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!form.storeName.trim()) { setError('Nama toko wajib diisi'); return }
    setSaving(true)
    setError('')
    try {
      const { logoPreview: _, ...payload } = form
      const res = await fetch('/api/stores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan')
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/store/manage'), 1500)
      }
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />
      </div>
    )
  }

  if (noStore) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 text-center">
        <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium mb-4">Kamu belum punya toko</p>
        <Button onClick={() => router.push('/store/open')}>Buka Toko Sekarang</Button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-800 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Kembali
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Toko</h1>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          Toko berhasil diperbarui! Mengalihkan...
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4">
        {/* Logo */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Logo Toko (opsional)</label>
          {form.logoPreview && (
            <div className="mb-3 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.logoPreview} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
              <button type="button" onClick={() => setForm(f => ({ ...f, logoUrl: '', logoPreview: '' }))} className="text-xs text-red-500 hover:underline">
                Hapus logo
              </button>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-800 hover:file:bg-primary-100 cursor-pointer"
          />
        </div>

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
            placeholder="Ceritakan tentang tokomu..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
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

        <Button loading={saving} onClick={handleSave} className="w-full mt-2">
          Simpan Perubahan
        </Button>
      </div>
    </div>
  )
}
