'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Recycle, Menu, X, User, LogOut, ShoppingBag, Home } from 'lucide-react'

interface UserData {
  id: string
  name: string
  email: string
  role: string
}

export default function Navbar() {
  const [user, setUser] = useState<UserData | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => { if (data.user) setUser(data.user) })
      .catch(() => {})
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/home" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-800 rounded-lg flex items-center justify-center">
            <Recycle className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-primary-800">RecycleMate</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/home" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary-800 font-medium transition-colors">
            <Home className="w-4 h-4" /> Marketplace
          </Link>
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link href="/admin" className="text-sm text-orange-600 hover:text-orange-700 font-medium">Admin</Link>
              )}
              <Link href="/profile" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary-800 font-medium transition-colors">
                <User className="w-4 h-4" />
                {user.name.split(' ')[0]}
              </Link>
              <button onClick={logout} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium transition-colors">
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary-800">Masuk</Link>
              <Link href="/register" className="bg-primary-800 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors">Daftar</Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
          <Link href="/home" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-sm font-medium text-gray-700 py-2">
            <ShoppingBag className="w-4 h-4" /> Marketplace
          </Link>
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-orange-600 py-2">Admin Panel</Link>
              )}
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-sm font-medium text-gray-700 py-2">
                <User className="w-4 h-4" /> Profil ({user.name})
              </Link>
              <button onClick={logout} className="flex items-center gap-2 text-sm font-medium text-red-500 py-2">
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 py-2">Masuk</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="bg-primary-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl text-center">Daftar</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
