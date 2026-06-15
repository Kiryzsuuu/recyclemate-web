'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Modal from '@/components/Modal'

interface Product {
  _id: string
  name: string
  price: number
  material: string
  stock: number
  productType: string
  isActive: boolean
}

const PRODUCT_TYPES = [
  { value: 'waste', label: 'Limbah (Waste)' },
  { value: 'material', label: 'Bahan Baku (Material)' },
  { value: 'handcraft', label: 'Kerajinan (Handcraft)' },
  { value: 'retail', label: 'Retail' },
]

const defaultForm = { name: '', price: 0, material: '', description: '', stock: 0, productType: 'handcraft', imageUrl: '', imagePreview: '', crafterCity: '' }

export default function ManageStorePage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchMyProducts = async () => {
    try {
      const res = await fetch('/api/products/mine')
      const data = await res.json()
      setProducts(data.products || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/login'); return }
      fetchMyProducts()
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openAdd = () => {
    setEditId(null)
    setForm(defaultForm)
    setError('')
    setModal(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setForm(f => ({ ...f, imageUrl: base64, imagePreview: base64 }))
    }
    reader.readAsDataURL(file)
  }

  const openEdit = (p: Product) => {
    setEditId(p._id)
    setForm({ name: p.name, price: p.price, material: p.material, description: '', stock: p.stock, productType: p.productType, imageUrl: '', imagePreview: '', crafterCity: '' })
    setError('')
    setModal(true)
  }

  const saveProduct = async () => {
    setSaving(true)
    setError('')
    try {
      const url = editId ? `/api/products/${editId}` : '/api/products'
      const method = editId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan')
      } else {
        setModal(false)
        fetchMyProducts()
      }
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Hapus produk ini?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    fetchMyProducts()
  }

  return (
    <div>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-800 mb-1">
              Kembali
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Produk</h1>
          </div>
          <Button onClick={openAdd}>
            <Plus className="w-4 h-4 mr-1.5" /> Tambah Produk
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => <div key={i} className="bg-white h-20 rounded-2xl animate-pulse border border-gray-100" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3"><svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div>
            <p>Belum ada produk. Tambahkan produk pertamamu!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {products.map(p => (
              <div key={p._id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Rp {p.price.toLocaleString('id-ID')} • {p.material} • Stok: {p.stock} • <span className="capitalize">{p.productType}</span>
                  </p>
                  {!p.isActive && <span className="text-xs text-red-500">Tidak aktif</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary-800 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteProduct(p._id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Produk' : 'Tambah Produk Baru'}>
        <div className="flex flex-col gap-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}
          <Input label="Nama Produk" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nama produk" required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Harga (Rp)" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
            <Input label="Stok" type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} />
          </div>
          <Input label="Material" value={form.material} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} placeholder="Plastik, Kayu, dll" />
          <Input label="Kota" value={form.crafterCity} onChange={e => setForm(f => ({ ...f, crafterCity: e.target.value }))} placeholder="Kota kamu" />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Tipe Produk</label>
            <select
              value={form.productType}
              onChange={e => setForm(f => ({ ...f, productType: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
            >
              {PRODUCT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
              placeholder="Deskripsi produk..."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Gambar Produk (opsional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-800 hover:file:bg-primary-100 cursor-pointer"
            />
            {form.imagePreview && (
              <div className="mt-2 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-xl border border-gray-200" />
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, imageUrl: '', imagePreview: '' }))}
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                >✕</button>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-2">
            <Button variant="secondary" onClick={() => setModal(false)} className="flex-1">Batal</Button>
            <Button loading={saving} onClick={saveProduct} className="flex-1">Simpan</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
