'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, X, Upload, ImageIcon, Package, Tag, Layers, MapPin, FileText, DollarSign, Hash, CheckCircle2, AlertCircle, Inbox } from 'lucide-react'

interface Product {
  _id: string
  name: string
  price: number
  material: string
  stock: number
  productType: string
  isActive: boolean
  imageUrl?: string
  description?: string
}

const PRODUCT_TYPES = [
  { value: 'waste', label: 'Limbah', desc: 'Jual limbah atau sampah', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { value: 'material', label: 'Bahan Baku', desc: 'Material olahan siap pakai', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { value: 'handcraft', label: 'Kerajinan', desc: 'Produk daur ulang kreatif', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { value: 'retail', label: 'Retail', desc: 'Produk siap jual ke konsumen', color: 'bg-green-50 border-green-200 text-green-700' },
]

const defaultForm = { name: '', price: '', material: '', description: '', stock: '', productType: 'handcraft', imageUrl: '', imagePreview: '', crafterCity: '' }

function formatRupiah(val: string) {
  const num = val.replace(/\D/g, '')
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export default function ManageStorePage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [priceDisplay, setPriceDisplay] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

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
    setPriceDisplay('')
    setError('')
    setDrawerOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditId(p._id)
    setForm({
      name: p.name,
      price: String(p.price),
      material: p.material || '',
      description: p.description || '',
      stock: String(p.stock),
      productType: p.productType,
      imageUrl: p.imageUrl || '',
      imagePreview: p.imageUrl || '',
      crafterCity: '',
    })
    setPriceDisplay(formatRupiah(String(p.price)))
    setError('')
    setDrawerOpen(true)
  }

  const handleImage = (file: File) => {
    if (file.size > 2 * 1024 * 1024) { setError('Ukuran gambar maksimal 2MB'); return }
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setForm(f => ({ ...f, imageUrl: base64, imagePreview: base64 }))
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) handleImage(file)
  }

  const saveProduct = async () => {
    if (!form.name.trim()) { setError('Nama produk wajib diisi'); return }
    if (!form.price || Number(form.price.replace(/\D/g,'')) === 0) { setError('Harga wajib diisi'); return }
    setSaving(true)
    setError('')
    try {
      const url = editId ? `/api/products/${editId}` : '/api/products'
      const method = editId ? 'PUT' : 'POST'
      const payload = {
        ...form,
        price: Number(form.price.replace(/\D/g,'')),
        stock: Number(form.stock) || 0,
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Gagal menyimpan'); return }
      setDrawerOpen(false)
      fetchMyProducts()
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    await fetch(`/api/products/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null)
    fetchMyProducts()
  }

  const selectedType = PRODUCT_TYPES.find(t => t.value === form.productType)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-primary-800 mb-1 transition-colors">
              Kembali
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Produk</h1>
            <p className="text-sm text-gray-500 mt-0.5">{products.length} produk terdaftar</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/store/orders')}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              <Inbox className="w-4 h-4" />
              Pesanan Masuk
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-primary-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-700 transition-all hover:shadow-lg hover:shadow-primary-800/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Tambah Produk
            </button>
          </div>
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-primary-50 rounded-3xl flex items-center justify-center mb-5">
              <Package className="w-12 h-12 text-primary-800/40" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum ada produk</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">Mulai jual produk daur ulang kamu dan jangkau lebih banyak pembeli</p>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-primary-800 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              Tambah Produk Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => (
              <div key={p._id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fadeIn">
                {/* Image */}
                <div className="relative h-44 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-200" />
                    </div>
                  )}
                  {/* Type badge */}
                  <div className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full border ${PRODUCT_TYPES.find(t=>t.value===p.productType)?.color || 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                    {PRODUCT_TYPES.find(t=>t.value===p.productType)?.label || p.productType}
                  </div>
                  {/* Status */}
                  {!p.isActive && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">Nonaktif</div>
                  )}
                  {/* Action buttons (hover) */}
                  <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(p)}
                      className="w-8 h-8 bg-white rounded-xl shadow-md flex items-center justify-center text-gray-600 hover:text-primary-800 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(p._id)}
                      className="w-8 h-8 bg-white rounded-xl shadow-md flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{p.name}</h3>
                  <p className="text-primary-800 font-bold text-base">Rp {p.price.toLocaleString('id-ID')}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{p.material || '—'}</span>
                    <span className="flex items-center gap-1"><Hash className="w-3 h-3" />Stok {p.stock}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drawer backdrop */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
      )}

      {/* Full-screen Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-2xl z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{editId ? 'Perbarui informasi produk' : 'Lengkapi detail produk untuk mulai berjualan'}</p>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <ImageIcon className="w-4 h-4 text-gray-400" />
              Foto Produk
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all ${
                dragOver ? 'border-primary-800 bg-primary-50' : 'border-gray-200 hover:border-primary-800/50 hover:bg-gray-50'
              }`}
            >
              {form.imagePreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.imagePreview} alt="Preview" className="w-full h-56 object-cover rounded-2xl" />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 rounded-2xl transition-colors flex items-center justify-center">
                    <span className="opacity-0 hover:opacity-100 bg-white text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg transition-opacity">Ganti Foto</span>
                  </div>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, imageUrl: '', imagePreview: '' })) }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center">
                    <Upload className="w-7 h-7 text-primary-800/60" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">Drag foto ke sini atau <span className="text-primary-800">pilih file</span></p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP • Maks. 2MB</p>
                  </div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImage(f) }} />
          </div>

          {/* Tipe Produk */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Tag className="w-4 h-4 text-gray-400" />
              Kategori Produk
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {PRODUCT_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, productType: t.value }))}
                  className={`relative flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all ${
                    form.productType === t.value
                      ? 'border-primary-800 bg-primary-50'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  {form.productType === t.value && (
                    <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-primary-800" />
                  )}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full mb-2 border ${t.color}`}>{t.label}</span>
                  <span className="text-xs text-gray-500 leading-relaxed">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Nama Produk */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Package className="w-4 h-4 text-gray-400" />
              Nama Produk <span className="text-red-400">*</span>
            </label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Contoh: Kursi dari Botol Plastik Daur Ulang"
              maxLength={100}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-800/30 focus:border-primary-800 transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{form.name.length}/100</p>
          </div>

          {/* Harga & Stok */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                Harga <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">Rp</span>
                <input
                  value={priceDisplay}
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g,'')
                    setPriceDisplay(formatRupiah(raw))
                    setForm(f => ({ ...f, price: raw }))
                  }}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-800/30 focus:border-primary-800 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Hash className="w-4 h-4 text-gray-400" />
                Stok
              </label>
              <input
                type="number"
                min={0}
                value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                placeholder="0"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-800/30 focus:border-primary-800 transition-colors"
              />
            </div>
          </div>

          {/* Material & Kota */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Layers className="w-4 h-4 text-gray-400" />
                Material
              </label>
              <input
                value={form.material}
                onChange={e => setForm(f => ({ ...f, material: e.target.value }))}
                placeholder="Plastik, Kayu, Kaca..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-800/30 focus:border-primary-800 transition-colors"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                Kota
              </label>
              <input
                value={form.crafterCity}
                onChange={e => setForm(f => ({ ...f, crafterCity: e.target.value }))}
                placeholder="Jakarta, Surabaya..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-800/30 focus:border-primary-800 transition-colors"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FileText className="w-4 h-4 text-gray-400" />
              Deskripsi Produk
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={4}
              maxLength={500}
              placeholder="Jelaskan kondisi, ukuran, keunggulan produk kamu..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-800/30 focus:border-primary-800 transition-colors resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/500</p>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white">
          {form.name && form.price && (
            <div className={`flex items-center gap-2 mb-3 p-3 rounded-xl text-xs ${selectedType?.color || 'bg-gray-50 text-gray-600'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="font-medium">{form.name}</span>
              <span className="ml-auto font-bold">Rp {formatRupiah(form.price)}</span>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => setDrawerOpen(false)}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={saveProduct}
              disabled={saving || !form.name.trim() || !form.price}
              className="flex-2 flex-grow-[2] px-4 py-3 bg-primary-800 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-primary-800/20 active:scale-95 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>{editId ? 'Simpan Perubahan' : 'Tambah Produk'}</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-slideUp">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-center mb-2">Hapus Produk?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Produk yang dihapus tidak bisa dikembalikan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
