'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Copy, Check, Clock, CreditCard, Truck, CheckCircle2, Upload, ImageIcon, MapPin, Phone, FileText, ShieldCheck, Wallet } from 'lucide-react'
import { getPaymentOption, ORDER_STATUS_META } from '@/lib/payment'

interface Order {
  _id: string
  productName: string
  productImageUrl: string
  productPrice: number
  quantity: number
  subtotal: number
  shippingCost: number
  totalPrice: number
  crafterName: string
  recipientName: string
  recipientPhone: string
  shippingAddress: string
  shippingCity: string
  notes: string
  paymentMethod: string
  paymentProofUrl: string
  trackingNumber: string
  status: string
  createdAt: string
}

const STEPS = [
  { key: 'pending', label: 'Pesanan Dibuat', icon: Clock },
  { key: 'paid', label: 'Pembayaran', icon: CreditCard },
  { key: 'shipped', label: 'Dikirim', icon: Truck },
  { key: 'completed', label: 'Selesai', icon: CheckCircle2 },
]

export default function OrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [proofPreview, setProofPreview] = useState('')
  const [acting, setActing] = useState(false)

  const fetchOrder = () => {
    fetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(d => { setOrder(d.order); setProofPreview(d.order?.paymentProofUrl || '') })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrder() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const copyAccount = (acc: string) => {
    navigator.clipboard.writeText(acc)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleProof = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('Ukuran gambar maksimal 2MB'); return }
    const reader = new FileReader()
    reader.onloadend = () => setProofPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const submitProof = async () => {
    if (!proofPreview) return
    setUploading(true)
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upload_proof', paymentProofUrl: proofPreview }),
      })
      if (res.ok) fetchOrder()
    } finally {
      setUploading(false)
    }
  }

  const doAction = async (action: string) => {
    setActing(true)
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) fetchOrder()
    } finally {
      setActing(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl h-96 animate-pulse border border-gray-100" />
      </div>
    )
  }

  if (!order) {
    return <div className="text-center py-20 text-gray-500">Pesanan tidak ditemukan</div>
  }

  const payment = getPaymentOption(order.paymentMethod)
  const statusMeta = ORDER_STATUS_META[order.status] || ORDER_STATUS_META.pending
  const currentStep = statusMeta.step
  const isCancelled = ['cancelled', 'refunded', 'refund_requested'].includes(order.status)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => router.push('/profile')} className="text-sm text-gray-500 hover:text-primary-800 mb-1 transition-colors">Kembali ke Profil</button>
          <h1 className="text-2xl font-bold text-gray-900">Detail Pesanan</h1>
          <p className="text-xs text-gray-400 mt-0.5">ID: {order._id} • {new Date(order.createdAt).toLocaleString('id-ID')}</p>
        </div>
        <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${statusMeta.color}`}>{statusMeta.label}</span>
      </div>

      {/* Timeline */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          <div className="flex items-center justify-between relative">
            {STEPS.map((step, i) => {
              const active = currentStep >= (i + 1)
              const Icon = step.icon
              return (
                <div key={step.key} className="flex flex-col items-center flex-1 relative z-10">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${active ? 'bg-primary-800 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs mt-2 text-center ${active ? 'text-primary-800 font-semibold' : 'text-gray-400'}`}>{step.label}</span>
                </div>
              )
            })}
            {/* Progress line */}
            <div className="absolute top-[22px] left-[12%] right-[12%] h-0.5 bg-gray-100 -z-0">
              <div className="h-full bg-primary-800 transition-all duration-500" style={{ width: `${Math.max(0, (currentStep - 1) / 3 * 100)}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Instruksi Pembayaran (status pending, bukan COD) */}
      {order.status === 'pending' && order.paymentMethod !== 'cod' && (
        <div className="bg-white rounded-2xl border-2 border-primary-200 p-6 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-primary-800" />
            <h2 className="font-bold text-gray-900">Instruksi Pembayaran</h2>
          </div>

          {payment?.group === 'transfer' && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-500 mb-1">{payment.label} - Virtual Account</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900 tracking-wide">{payment.account}</span>
                <button onClick={() => copyAccount(payment.account!)} className="flex items-center gap-1.5 text-sm text-primary-800 font-medium hover:text-primary-700">
                  {copied ? <><Check className="w-4 h-4" /> Tersalin</> : <><Copy className="w-4 h-4" /> Salin</>}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">a.n. {payment.accountName}</p>
            </div>
          )}

          {payment?.group === 'instant' && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4 flex flex-col items-center">
              <div className="w-40 h-40 bg-white rounded-xl border border-gray-200 flex items-center justify-center mb-2">
                {/* Placeholder QR */}
                <svg viewBox="0 0 100 100" className="w-32 h-32 text-gray-800"><rect x="0" y="0" width="30" height="30" fill="currentColor"/><rect x="10" y="10" width="10" height="10" fill="white"/><rect x="70" y="0" width="30" height="30" fill="currentColor"/><rect x="80" y="10" width="10" height="10" fill="white"/><rect x="0" y="70" width="30" height="30" fill="currentColor"/><rect x="10" y="80" width="10" height="10" fill="white"/><rect x="40" y="40" width="20" height="20" fill="currentColor"/><rect x="70" y="50" width="10" height="10" fill="currentColor"/><rect x="50" y="70" width="10" height="10" fill="currentColor"/><rect x="80" y="80" width="10" height="10" fill="currentColor"/></svg>
              </div>
              <p className="text-xs text-gray-500">Scan QRIS dengan aplikasi e-wallet kamu</p>
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-primary-50 rounded-xl mb-4">
            <span className="text-sm text-gray-600">Total Pembayaran</span>
            <span className="text-lg font-bold text-primary-800">Rp {order.totalPrice.toLocaleString('id-ID')}</span>
          </div>

          {/* Upload bukti */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Upload Bukti Pembayaran</label>
            <label className="cursor-pointer block">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-primary-800/50 transition-colors">
                {proofPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={proofPreview} alt="Bukti" className="w-full h-48 object-contain rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center py-6 gap-2 text-gray-400">
                    <Upload className="w-8 h-8" />
                    <span className="text-sm">Pilih foto bukti transfer</span>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleProof} />
            </label>
            {proofPreview && proofPreview !== order.paymentProofUrl && (
              <button onClick={submitProof} disabled={uploading} className="w-full mt-3 bg-primary-800 text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-60 transition-colors">
                {uploading ? 'Mengunggah...' : 'Kirim Bukti Pembayaran'}
              </button>
            )}
            {order.paymentProofUrl && proofPreview === order.paymentProofUrl && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-xl">
                <CheckCircle2 className="w-4 h-4" /> Bukti terkirim, menunggu konfirmasi penjual
              </div>
            )}
          </div>
        </div>
      )}

      {/* COD info */}
      {order.paymentMethod === 'cod' && order.status !== 'completed' && order.status !== 'cancelled' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-center gap-3">
          <Wallet className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700">Pesanan COD — siapkan uang tunai <b>Rp {order.totalPrice.toLocaleString('id-ID')}</b> saat barang tiba.</p>
        </div>
      )}

      {/* Resi */}
      {order.trackingNumber && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary-800" />
            <span className="text-sm text-gray-600">No. Resi</span>
          </div>
          <span className="text-sm font-bold text-gray-900">{order.trackingNumber}</span>
        </div>
      )}

      {/* Produk & Alamat */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <h2 className="font-bold text-gray-900 mb-4">Rincian Pesanan</h2>
        <div className="flex gap-3 pb-4 border-b border-gray-100">
          <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
            {order.productImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={order.productImageUrl} alt={order.productName} className="w-full h-full object-cover" />
            ) : <ImageIcon className="w-6 h-6 text-gray-300" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{order.productName}</p>
            <p className="text-xs text-gray-500 mt-0.5">Penjual: {order.crafterName}</p>
            <p className="text-sm text-gray-600 mt-1">{order.quantity} × Rp {order.productPrice.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Alamat */}
        <div className="py-4 border-b border-gray-100 space-y-1.5">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">{order.recipientName}</p>
              <p className="text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {order.recipientPhone}</p>
              <p className="text-gray-500">{order.shippingAddress}{order.shippingCity ? `, ${order.shippingCity}` : ''}</p>
            </div>
          </div>
          {order.notes && (
            <div className="flex items-start gap-2 text-sm text-gray-500"><FileText className="w-4 h-4 text-gray-400 mt-0.5" /> {order.notes}</div>
          )}
        </div>

        {/* Biaya */}
        <div className="pt-4 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span className="text-gray-900">Rp {order.subtotal.toLocaleString('id-ID')}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-600">Ongkos kirim</span><span className="text-gray-900">Rp {order.shippingCost.toLocaleString('id-ID')}</span></div>
          <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-lg font-bold text-primary-800">Rp {order.totalPrice.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* Aksi pembeli */}
      <div className="flex gap-3">
        {order.status === 'shipped' && (
          <button onClick={() => doAction('complete')} disabled={acting} className="flex-1 bg-primary-800 text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-60 transition-colors">
            {acting ? 'Memproses...' : 'Pesanan Diterima'}
          </button>
        )}
        {order.status === 'pending' && (
          <button onClick={() => doAction('cancel')} disabled={acting} className="flex-1 border border-red-200 text-red-600 py-3 rounded-xl text-sm font-semibold hover:bg-red-50 disabled:opacity-60 transition-colors">
            Batalkan Pesanan
          </button>
        )}
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-gray-400">
        <ShieldCheck className="w-3.5 h-3.5" /> Pesanan terlindungi RecycleMate
      </div>
    </div>
  )
}
