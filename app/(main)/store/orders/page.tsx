'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Package, ImageIcon, MapPin, Phone, CheckCircle2, Truck, Eye, Inbox } from 'lucide-react'
import { ORDER_STATUS_META, getPaymentOption } from '@/lib/payment'

interface Order {
  _id: string
  productName: string
  productImageUrl: string
  quantity: number
  totalPrice: number
  buyerName: string
  recipientName: string
  recipientPhone: string
  shippingAddress: string
  shippingCity: string
  paymentMethod: string
  paymentProofUrl: string
  trackingNumber: string
  status: string
  createdAt: string
}

const FILTERS = [
  { id: 'all', label: 'Semua' },
  { id: 'pending', label: 'Perlu Konfirmasi' },
  { id: 'paid', label: 'Diproses' },
  { id: 'shipped', label: 'Dikirim' },
  { id: 'completed', label: 'Selesai' },
]

export default function SellerOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [acting, setActing] = useState<string | null>(null)
  const [trackingInput, setTrackingInput] = useState<Record<string, string>>({})
  const [proofModal, setProofModal] = useState('')

  const fetchOrders = () => {
    fetch('/api/orders/seller').then(r => r.json()).then(d => setOrders(d.orders || [])).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/login'); return }
      fetchOrders()
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const doAction = async (orderId: string, action: string, extra?: Record<string, unknown>) => {
    setActing(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      })
      if (res.ok) fetchOrders()
    } finally {
      setActing(null)
    }
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => {
    if (filter === 'paid') return o.status === 'paid' || o.status === 'processing'
    return o.status === filter
  })

  const counts = {
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid' || o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <button onClick={() => router.push('/store/manage')} className="text-sm text-gray-500 hover:text-primary-800 mb-1 transition-colors">Kembali ke Kelola Produk</button>
          <h1 className="text-2xl font-bold text-gray-900">Pesanan Masuk</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} total pesanan</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
          {FILTERS.map(f => {
            const count = f.id === 'pending' ? counts.pending : f.id === 'paid' ? counts.paid : f.id === 'shipped' ? counts.shipped : 0
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filter === f.id ? 'bg-primary-800 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}
              >
                {f.label}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f.id ? 'bg-white/20' : 'bg-red-500 text-white'}`}>{count}</span>
                )}
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="bg-white h-32 rounded-2xl animate-pulse border border-gray-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-4">
              <Inbox className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">Belum ada pesanan</p>
            <p className="text-sm text-gray-400 mt-1">Pesanan dari pembeli akan muncul di sini</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(o => {
              const meta = ORDER_STATUS_META[o.status] || ORDER_STATUS_META.pending
              const payment = getPaymentOption(o.paymentMethod)
              return (
                <div key={o._id} className="bg-white rounded-2xl border border-gray-100 p-5 animate-fadeIn">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString('id-ID')}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${meta.color}`}>{meta.label}</span>
                  </div>

                  {/* Product */}
                  <div className="flex gap-3 pb-3 border-b border-gray-100">
                    <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {o.productImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={o.productImageUrl} alt={o.productName} className="w-full h-full object-cover" />
                      ) : <ImageIcon className="w-5 h-5 text-gray-300" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{o.productName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{o.quantity} barang • {payment?.label}</p>
                      <p className="text-sm font-bold text-primary-800 mt-0.5">Rp {o.totalPrice.toLocaleString('id-ID')}</p>
                    </div>
                  </div>

                  {/* Buyer & address */}
                  <div className="py-3 text-xs text-gray-500 space-y-1">
                    <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {o.recipientName} • <Phone className="w-3 h-3" /> {o.recipientPhone}</p>
                    <p className="pl-4.5">{o.shippingAddress}{o.shippingCity ? `, ${o.shippingCity}` : ''}</p>
                  </div>

                  {/* Bukti bayar */}
                  {o.paymentProofUrl && o.status === 'pending' && (
                    <button onClick={() => setProofModal(o.paymentProofUrl)} className="flex items-center gap-1.5 text-xs text-primary-800 font-medium mb-3 hover:underline">
                      <Eye className="w-3.5 h-3.5" /> Lihat Bukti Pembayaran
                    </button>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <a href={`/orders/${o._id}`} className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">Detail</a>

                    {o.status === 'pending' && (
                      <button onClick={() => doAction(o._id, 'confirm_payment')} disabled={acting === o._id} className="flex-1 flex items-center justify-center gap-1.5 bg-primary-800 text-white py-2 rounded-xl text-xs font-semibold hover:bg-primary-700 disabled:opacity-60 transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Konfirmasi Pembayaran
                      </button>
                    )}

                    {(o.status === 'paid' || o.status === 'processing') && (
                      <div className="flex-1 flex gap-2">
                        <input
                          value={trackingInput[o._id] || ''}
                          onChange={e => setTrackingInput(t => ({ ...t, [o._id]: e.target.value }))}
                          placeholder="No. resi (opsional)"
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-800"
                        />
                        <button onClick={() => doAction(o._id, 'ship', { trackingNumber: trackingInput[o._id] })} disabled={acting === o._id} className="flex items-center gap-1.5 bg-primary-800 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-primary-700 disabled:opacity-60 transition-colors whitespace-nowrap">
                          <Truck className="w-3.5 h-3.5" /> Kirim
                        </button>
                      </div>
                    )}

                    {o.status === 'shipped' && o.trackingNumber && (
                      <div className="flex-1 flex items-center justify-center gap-1.5 text-xs text-gray-500">
                        <Truck className="w-3.5 h-3.5" /> Resi: <span className="font-semibold text-gray-700">{o.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Proof modal */}
      {proofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setProofModal('')}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-white rounded-2xl p-4 max-w-md w-full">
            <p className="font-semibold text-gray-900 mb-3">Bukti Pembayaran</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={proofModal} alt="Bukti" className="w-full rounded-xl" />
          </div>
        </div>
      )}
    </div>
  )
}
