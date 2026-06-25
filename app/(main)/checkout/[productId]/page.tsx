'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { MapPin, User, Phone, FileText, CreditCard, Building2, QrCode, Wallet, CheckCircle2, ShieldCheck, ImageIcon, Minus, Plus } from 'lucide-react'
import { PAYMENT_OPTIONS, DEFAULT_SHIPPING_COST } from '@/lib/payment'

interface Product {
  _id: string
  name: string
  price: number
  imageUrl?: string
  stock: number
  material: string
  crafterName: string
  crafterCity: string
}

const PAY_ICONS: Record<string, React.ElementType> = {
  transfer_bca: Building2,
  transfer_bri: Building2,
  transfer_mandiri: Building2,
  qris: QrCode,
  cod: Wallet,
}

export default function CheckoutPage() {
  const { productId } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQty = Number(searchParams.get('qty')) || 1

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(initialQty)
  const [form, setForm] = useState({ recipientName: '', recipientPhone: '', shippingAddress: '', shippingCity: '', notes: '' })
  const [paymentMethod, setPaymentMethod] = useState('transfer_bca')
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/login'); return }
      setForm(f => ({ ...f, recipientName: d.user.name || '', recipientPhone: d.user.phone || '', shippingCity: d.user.city || '' }))
    })
    fetch(`/api/products/${productId}`)
      .then(r => r.json())
      .then(d => { setProduct(d.product); if (d.product && initialQty > d.product.stock) setQty(d.product.stock) })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const placeOrder = async () => {
    if (!form.recipientName.trim() || !form.recipientPhone.trim() || !form.shippingAddress.trim()) {
      setError('Lengkapi data penerima dan alamat pengiriman')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setPlacing(true)
    setError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: qty, ...form, paymentMethod }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) { router.push('/login'); return }
        setError(data.error || 'Gagal membuat pesanan')
        return
      }
      router.push(`/orders/${data.order._id}`)
    } catch {
      setError('Terjadi kesalahan jaringan')
    } finally {
      setPlacing(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl h-40 animate-pulse border border-gray-100" />
            <div className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />
          </div>
          <div className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100" />
        </div>
      </div>
    )
  }

  if (!product) {
    return <div className="text-center py-20 text-gray-500">Produk tidak ditemukan</div>
  }

  const subtotal = product.price * qty
  const total = subtotal + DEFAULT_SHIPPING_COST
  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-800/30 focus:border-primary-800 transition-colors"
  const transferOpts = PAYMENT_OPTIONS.filter(p => p.group === 'transfer')
  const instantOpts = PAYMENT_OPTIONS.filter(p => p.group === 'instant')
  const codOpts = PAYMENT_OPTIONS.filter(p => p.group === 'cod')

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-primary-800 mb-1 transition-colors">Kembali</button>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-5">
          {/* Alamat Pengiriman */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary-800" />
              <h2 className="font-bold text-gray-900">Alamat Pengiriman</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5"><User className="w-3.5 h-3.5 text-gray-400" /> Nama Penerima</label>
                <input className={inputClass} value={form.recipientName} onChange={e => setForm(f => ({ ...f, recipientName: e.target.value }))} placeholder="Nama lengkap" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> No. HP</label>
                <input className={inputClass} value={form.recipientPhone} onChange={e => setForm(f => ({ ...f, recipientPhone: e.target.value }))} placeholder="08xxxxxxxxxx" />
              </div>
            </div>
            <div className="mt-3">
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> Alamat Lengkap</label>
              <textarea className={inputClass + ' resize-none'} rows={3} value={form.shippingAddress} onChange={e => setForm(f => ({ ...f, shippingAddress: e.target.value }))} placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Kota / Kabupaten</label>
                <input className={inputClass} value={form.shippingCity} onChange={e => setForm(f => ({ ...f, shippingCity: e.target.value }))} placeholder="Kota" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5"><FileText className="w-3.5 h-3.5 text-gray-400" /> Catatan (opsional)</label>
                <input className={inputClass} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Catatan untuk penjual" />
              </div>
            </div>
          </div>

          {/* Metode Pembayaran */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary-800" />
              <h2 className="font-bold text-gray-900">Metode Pembayaran</h2>
            </div>

            <div className="space-y-4">
              {[['Transfer Bank', transferOpts], ['Pembayaran Instan', instantOpts], ['Bayar di Tempat', codOpts]].map(([title, opts]) => (
                <div key={title as string}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{title as string}</p>
                  <div className="space-y-2">
                    {(opts as typeof PAYMENT_OPTIONS).map(opt => {
                      const Icon = PAY_ICONS[opt.id] || CreditCard
                      const selected = paymentMethod === opt.id
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setPaymentMethod(opt.id)}
                          className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${selected ? 'border-primary-800 bg-primary-50' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${selected ? 'bg-primary-800 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                            <p className="text-xs text-gray-500">{opt.description}</p>
                          </div>
                          {selected && <CheckCircle2 className="w-5 h-5 text-primary-800 flex-shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT - Ringkasan */}
        <div className="lg:sticky lg:top-20 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4">Ringkasan Pesanan</h2>
              {/* Product */}
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : <ImageIcon className="w-6 h-6 text-gray-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2">{product.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{product.crafterName}</p>
                  <p className="text-sm font-bold text-primary-800 mt-1">Rp {product.price.toLocaleString('id-ID')}</p>
                </div>
              </div>
              {/* Qty */}
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-600">Jumlah</span>
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-2.5 py-1.5 hover:bg-gray-50"><Minus className="w-3.5 h-3.5" /></button>
                  <span className="px-2 text-sm font-medium min-w-[2rem] text-center">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-2.5 py-1.5 hover:bg-gray-50"><Plus className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>

            {/* Rincian biaya */}
            <div className="p-5 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({qty} barang)</span>
                <span className="text-gray-900">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ongkos kirim</span>
                <span className="text-gray-900">Rp {DEFAULT_SHIPPING_COST.toLocaleString('id-ID')}</span>
              </div>
              <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-primary-800">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                onClick={placeOrder}
                disabled={placing}
                className="w-full flex items-center justify-center gap-2 bg-primary-800 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-primary-700 disabled:opacity-60 transition-all hover:shadow-lg hover:shadow-primary-800/20 active:scale-[0.98]"
              >
                {placing ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Memproses...</>
                ) : (
                  <>Buat Pesanan</>
                )}
              </button>
              <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Transaksi aman & terlindungi
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
