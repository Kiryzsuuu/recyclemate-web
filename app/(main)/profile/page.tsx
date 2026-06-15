'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, ShoppingBag, Heart, Store, Settings } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Button from '@/components/Button'
import Input from '@/components/Input'

interface UserData {
  _id: string
  name: string
  email: string
  role: string
  city: string
  phone: string
  bio: string
}

interface Order {
  _id: string
  productName: string
  quantity: number
  totalPrice: number
  status: string
  createdAt: string
}

interface Donation {
  _id: string
  itemName: string
  material: string
  quantity: number
  status: string
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
}

const TABS = [
  { id: 'profil', label: 'Profil', icon: User },
  { id: 'pesanan', label: 'Pesanan', icon: ShoppingBag },
  { id: 'donasi', label: 'Donasi', icon: Heart },
]

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [tab, setTab] = useState('profil')
  const [editName, setEditName] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editBio, setEditBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [donateModal, setDonateModal] = useState(false)
  const [donateForm, setDonateForm] = useState({ itemName: '', description: '', material: '', quantity: 1 })
  const [donating, setDonating] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data.user) { router.push('/login'); return }
        setUser(data.user)
        setEditName(data.user.name)
        setEditCity(data.user.city || '')
        setEditPhone(data.user.phone || '')
        setEditBio(data.user.bio || '')
      })
  }, [router])

  useEffect(() => {
    if (tab === 'pesanan') {
      fetch('/api/orders').then(r => r.json()).then(d => setOrders(d.orders || []))
    }
    if (tab === 'donasi') {
      fetch('/api/donations').then(r => r.json()).then(d => setDonations(d.donations || []))
    }
  }, [tab])

  const saveProfile = async () => {
    setSaving(true)
    // Note: For simplicity this calls me endpoint; in real app you'd have a PUT /api/users/me
    setSaving(false)
  }

  const submitDonation = async () => {
    setDonating(true)
    try {
      await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donateForm),
      })
      setDonateModal(false)
      fetch('/api/donations').then(r => r.json()).then(d => setDonations(d.donations || []))
    } finally {
      setDonating(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />
        </div>
      </div>
    )
  }

  const isSellerRole = ['penumpul', 'pengepul', 'pengrajin', 'distributor'].includes(user.role)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-green-100 text-sm">{user.email}</p>
              <span className="inline-block mt-1 bg-white/20 text-xs px-2 py-0.5 rounded-full capitalize">{user.role}</span>
            </div>
          </div>
          <div className="flex gap-3 mt-4 flex-wrap">
            {user.role === 'admin' && (
              <Button size="sm" onClick={() => router.push('/admin')} className="bg-orange-500 hover:bg-orange-600">
                <Settings className="w-3.5 h-3.5 mr-1" /> Admin Panel
              </Button>
            )}
            {user.role === 'pembeli' && (
              <Button size="sm" onClick={() => router.push('/store/open')} className="bg-white text-primary-800 hover:bg-green-50">
                <Store className="w-3.5 h-3.5 mr-1" /> Buka Toko
              </Button>
            )}
            {isSellerRole && (
              <Button size="sm" onClick={() => router.push('/store/manage')} className="bg-white text-primary-800 hover:bg-green-50">
                <Store className="w-3.5 h-3.5 mr-1" /> Kelola Produk
              </Button>
            )}
            <Button size="sm" onClick={() => setDonateModal(true)} className="bg-white/20 text-white hover:bg-white/30">
              <Heart className="w-3.5 h-3.5 mr-1" /> Donasi Limbah
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id ? 'border-primary-800 text-primary-800' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Profil tab */}
        {tab === 'profil' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4">
            <Input label="Nama Lengkap" value={editName} onChange={e => setEditName(e.target.value)} />
            <Input label="Kota" value={editCity} onChange={e => setEditCity(e.target.value)} placeholder="Kota kamu" />
            <Input label="No. HP" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="08xx" />
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Bio</label>
              <textarea
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                rows={3}
                placeholder="Ceritakan tentang kamu..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
              />
            </div>
            <Button loading={saving} onClick={saveProfile} className="self-end">
              Simpan Perubahan
            </Button>
          </div>
        )}

        {/* Pesanan tab */}
        {tab === 'pesanan' && (
          <div className="flex flex-col gap-3">
            {orders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Belum ada pesanan</p>
              </div>
            ) : orders.map(order => (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-sm text-gray-900">{order.productName}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Qty: {order.quantity} • Total: Rp {order.totalPrice.toLocaleString('id-ID')}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
              </div>
            ))}
          </div>
        )}

        {/* Donasi tab */}
        {tab === 'donasi' && (
          <div className="flex flex-col gap-3">
            <Button onClick={() => setDonateModal(true)} className="self-start">
              + Donasi Limbah Baru
            </Button>
            {donations.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Belum ada donasi</p>
              </div>
            ) : donations.map(don => (
              <div key={don._id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-sm text-gray-900">{don.itemName}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[don.status] || 'bg-gray-100 text-gray-600'}`}>
                    {don.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{don.material} • {don.quantity} unit</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Donate modal */}
      {donateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDonateModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">Donasi Limbah</h3>
            <div className="flex flex-col gap-3">
              <Input label="Nama Item" value={donateForm.itemName} onChange={e => setDonateForm(f => ({ ...f, itemName: e.target.value }))} placeholder="Contoh: Botol plastik bekas" />
              <Input label="Material" value={donateForm.material} onChange={e => setDonateForm(f => ({ ...f, material: e.target.value }))} placeholder="Plastik, Kayu, dll" />
              <Input label="Jumlah (unit)" type="number" value={donateForm.quantity} onChange={e => setDonateForm(f => ({ ...f, quantity: Number(e.target.value) }))} />
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Deskripsi</label>
                <textarea
                  value={donateForm.description}
                  onChange={e => setDonateForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
                  placeholder="Kondisi, ukuran, dll"
                />
              </div>
              <div className="flex gap-3 mt-2">
                <Button variant="secondary" onClick={() => setDonateModal(false)} className="flex-1">Batal</Button>
                <Button loading={donating} onClick={submitDonation} className="flex-1">Kirim Donasi</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
