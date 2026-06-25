'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, ShoppingBag, Package, Heart, Settings, Plus, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import StatCard from '@/components/StatCard'

interface Stats { users: number; products: number; orders: number; donations: number }
interface User { _id: string; name: string; email: string; role: string; isAdmin?: boolean; isDeactivated: boolean; createdAt: string }
interface Product { _id: string; name: string; price: number; productType: string; crafterName: string; isActive: boolean }
interface Order { _id: string; productName: string; buyerName: string; totalPrice: number; status: string; createdAt: string }
interface Donation { _id: string; itemName: string; donorName: string; material: string; status: string }

const ROLES = ['admin', 'pembeli', 'penumpul', 'pengepul', 'pengrajin', 'distributor']
const TABS = ['overview', 'users', 'products', 'orders', 'donations']

const defaultNewUser = { name: '', email: '', password: '', role: 'pembeli' }

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [addUserModal, setAddUserModal] = useState(false)
  const [newUser, setNewUser] = useState(defaultNewUser)
  const [addingUser, setAddingUser] = useState(false)
  const [addUserErr, setAddUserErr] = useState('')

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || (d.user.role !== 'admin' && !d.user.isAdmin)) router.push('/home')
    })
    fetch('/api/admin/stats').then(r => r.json()).then(d => setStats(d))
  }, [router])

  useEffect(() => {
    if (tab === 'users' && users.length === 0) fetchUsers()
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

  const fetchUsers = () => {
    fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users || []))
  }

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

  const deleteUser = async (userId: string, name: string) => {
    if (!confirm(`Hapus user "${name}"? Tindakan ini tidak bisa dibatalkan.`)) return
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    if (res.ok) setUsers(prev => prev.filter(u => u._id !== userId))
  }

  const submitAddUser = async () => {
    setAddUserErr('')
    setAddingUser(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })
      const data = await res.json()
      if (!res.ok) { setAddUserErr(data.error || 'Gagal menambah user'); return }
      setAddUserModal(false)
      setNewUser(defaultNewUser)
      fetchUsers()
      setStats(s => s ? { ...s, users: s.users + 1 } : s)
    } finally {
      setAddingUser(false)
    }
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navbar */}
      <nav className="sticky top-0 z-50 bg-primary-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="RecycleMate" width={80} height={80} className="h-9 w-auto brightness-0 invert" />
            <span className="text-xs bg-orange-500 px-2 py-0.5 rounded-full">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/settings" className="flex items-center gap-1.5 text-sm text-green-100 hover:text-white">
              <Settings className="w-4 h-4" /> Pengaturan
            </Link>
            <Link href="/home" className="text-sm text-green-100 hover:text-white">Marketplace</Link>
          </div>
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
              {t === 'overview' ? 'Ringkasan' : t === 'users' ? 'Pengguna' : t === 'products' ? 'Produk' : t === 'orders' ? 'Pesanan' : 'Setoran'}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Pengguna" value={stats?.users ?? '—'} icon={<Users className="w-6 h-6" />} color="bg-blue-50 text-blue-700" />
            <StatCard title="Produk Aktif" value={stats?.products ?? '—'} icon={<Package className="w-6 h-6" />} color="bg-primary-50 text-primary-800" />
            <StatCard title="Total Pesanan" value={stats?.orders ?? '—'} icon={<ShoppingBag className="w-6 h-6" />} color="bg-purple-50 text-purple-700" />
            <StatCard title="Setoran Limbah" value={stats?.donations ?? '—'} icon={<Heart className="w-6 h-6" />} color="bg-amber-50 text-amber-700" />
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">{users.length} pengguna terdaftar</p>
              <button
                onClick={() => { setAddUserModal(true); setAddUserErr('') }}
                className="flex items-center gap-2 bg-primary-800 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Tambah User
              </button>
            </div>
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
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {u.name}
                          {u.isAdmin && <span className="ml-1.5 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">Admin</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{u.email}</td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role}
                            onChange={e => changeRole(u._id, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-800"
                          >
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${u.isDeactivated ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                            {u.isDeactivated ? 'Nonaktif' : 'Aktif'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleDeactivate(u._id, u.isDeactivated)}
                              className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                                u.isDeactivated ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'
                              }`}
                            >
                              {u.isDeactivated ? 'Aktifkan' : 'Nonaktifkan'}
                            </button>
                            <button
                              onClick={() => deleteUser(u._id, u.name)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && <div className="text-center py-10 text-gray-400">Memuat data...</div>}
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        {tab === 'products' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{['Produk', 'Harga', 'Tipe', 'Penjual', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}</tr>
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
                  <tr>{['Produk', 'Pembeli', 'Total', 'Status', 'Tanggal'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}</tr>
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
                  <tr>{['Item', 'Pengirim', 'Material', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}</tr>
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

      {/* Add User Modal */}
      {addUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setAddUserModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">Tambah User Baru</h3>
              <button onClick={() => setAddUserModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {addUserErr && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{addUserErr}</div>
            )}
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap *</label>
                <input className={inputClass} value={newUser.name} onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))} placeholder="Nama user" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <input className={inputClass} type="email" value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))} placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password * (min. 6 karakter)</label>
                <input className={inputClass} type="password" value={newUser.password} onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))} placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <select className={inputClass} value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setAddUserModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Batal
                </button>
                <button
                  onClick={submitAddUser}
                  disabled={addingUser}
                  className="flex-1 px-4 py-2.5 bg-primary-800 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-60 transition-colors"
                >
                  {addingUser ? 'Menyimpan...' : 'Tambah User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
