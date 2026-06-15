'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, ShoppingBag, Package, Heart, Recycle } from 'lucide-react'
import Link from 'next/link'
import StatCard from '@/components/StatCard'

interface Stats { users: number; products: number; orders: number; donations: number }
interface User { _id: string; name: string; email: string; role: string; isDeactivated: boolean; createdAt: string }
interface Product { _id: string; name: string; price: number; productType: string; crafterName: string; isActive: boolean }
interface Order { _id: string; productName: string; buyerName: string; totalPrice: number; status: string; createdAt: string }
interface Donation { _id: string; itemName: string; donorName: string; material: string; status: string }

const TABS = ['overview', 'users', 'products', 'orders', 'donations']

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [donations, setDonations] = useState<Donation[]>([])

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || d.user.role !== 'admin') router.push('/home')
    })
    fetch('/api/admin/stats').then(r => r.json()).then(d => setStats(d))
  }, [router])

  useEffect(() => {
    if (tab === 'users' && users.length === 0) {
      fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users || []))
    }
    if (tab === 'products' && products.length === 0) {
      fetch('/api/admin/products').then(r => r.json()).then(d => setProducts(d.products || []))
    }
    if (tab === 'orders' && orders.length === 0) {
      fetch('/api/admin/orders').then(r => r.json()).then(d => setOrders(d.orders || []))
    }
    if (tab === 'donations' && donations.length === 0) {
      fetch('/api/admin/donations').then(r => r.json()).then(d => setDonations(d.donations || []))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const toggleDeactivate = async (userId: string, current: boolean) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isDeactivated: !current }),
    })
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, isDeactivated: !current } : u))
  }

  const changeRole = async (userId: string, role: string) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    })
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navbar */}
      <nav className="sticky top-0 z-50 bg-primary-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold">RecycleMate</span>
              <span className="ml-2 text-xs bg-orange-500 px-2 py-0.5 rounded-full">Admin</span>
            </div>
          </div>
          <Link href="/home" className="text-sm text-green-100 hover:text-white">← Marketplace</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Admin</h1>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${
                tab === t ? 'border-primary-800 text-primary-800' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Pengguna" value={stats?.users ?? '—'} icon={<Users className="w-6 h-6" />} color="bg-blue-50 text-blue-700" />
            <StatCard title="Produk Aktif" value={stats?.products ?? '—'} icon={<Package className="w-6 h-6" />} color="bg-primary-50 text-primary-800" />
            <StatCard title="Total Pesanan" value={stats?.orders ?? '—'} icon={<ShoppingBag className="w-6 h-6" />} color="bg-purple-50 text-purple-700" />
            <StatCard title="Donasi Limbah" value={stats?.donations ?? '—'} icon={<Heart className="w-6 h-6" />} color="bg-amber-50 text-amber-700" />
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Nama', 'Email', 'Peran', 'Status', 'Aksi'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={e => changeRole(u._id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-800"
                        >
                          {['admin', 'pembeli', 'penumpul', 'pengepul', 'pengrajin', 'distributor'].map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${u.isDeactivated ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                          {u.isDeactivated ? 'Nonaktif' : 'Aktif'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleDeactivate(u._id, u.isDeactivated)}
                          className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                            u.isDeactivated
                              ? 'bg-green-50 text-green-700 hover:bg-green-100'
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          {u.isDeactivated ? 'Aktifkan' : 'Nonaktifkan'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div className="text-center py-10 text-gray-400">Memuat data...</div>}
            </div>
          </div>
        )}

        {/* Products */}
        {tab === 'products' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Produk', 'Harga', 'Tipe', 'Penjual', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(p => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                      <td className="px-4 py-3 text-gray-600">Rp {p.price.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3 capitalize text-gray-500">{p.productType}</td>
                      <td className="px-4 py-3 text-gray-500">{p.crafterName}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {p.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && <div className="text-center py-10 text-gray-400">Memuat data...</div>}
            </div>
          </div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Produk', 'Pembeli', 'Total', 'Status', 'Tanggal'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map(o => (
                    <tr key={o._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{o.productName}</td>
                      <td className="px-4 py-3 text-gray-500">{o.buyerName}</td>
                      <td className="px-4 py-3 text-gray-600">Rp {o.totalPrice.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3 capitalize text-gray-500">{o.status}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && <div className="text-center py-10 text-gray-400">Memuat data...</div>}
            </div>
          </div>
        )}

        {/* Donations */}
        {tab === 'donations' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Item', 'Donor', 'Material', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {donations.map(d => (
                    <tr key={d._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{d.itemName}</td>
                      <td className="px-4 py-3 text-gray-500">{d.donorName}</td>
                      <td className="px-4 py-3 text-gray-500">{d.material}</td>
                      <td className="px-4 py-3 capitalize text-gray-500">{d.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {donations.length === 0 && <div className="text-center py-10 text-gray-400">Memuat data...</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
