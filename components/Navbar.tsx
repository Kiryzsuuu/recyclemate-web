'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Recycle, Menu, X, User, LogOut, ShoppingBag, Settings, Store, LayoutDashboard } from 'lucide-react'

interface UserData {
  id: string
  name: string
  email: string
  role: string
}

export default function Navbar() {
  const [user, setUser] = useState<UserData | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => { if (data.user) setUser(data.user) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setDropdownOpen(false)
    router.push('/')
  }

  const isSellerRole = user && ['penumpul', 'pengepul', 'pengrajin', 'distributor', 'admin'].includes(user.role)
  const initials = user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : ''

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-800 rounded-lg flex items-center justify-center">
            <Recycle className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-primary-800">RecycleMate</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/home" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary-800 font-medium transition-colors">
            <ShoppingBag className="w-4 h-4" /> Marketplace
          </Link>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              {/* Avatar button */}
              <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-800 rounded-full flex items-center justify-center text-white text-xs font-bold select-none">
                  {initials}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-semibold text-gray-900 leading-none">{user.name.split(' ')[0]}</p>
                  <p className="text-xs text-gray-500 capitalize mt-0.5">{user.role}</p>
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 overflow-hidden">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                    <span className="inline-block mt-1.5 bg-primary-50 text-primary-800 text-xs px-2 py-0.5 rounded-full capitalize font-medium">{user.role}</span>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      Edit Profil
                    </Link>

                    {isSellerRole && (
                      <>
                        <Link
                          href="/store/manage"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Store className="w-4 h-4 text-gray-400" />
                          Kelola Produk
                        </Link>
                        <Link
                          href="/store/edit"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          Pengaturan Toko
                        </Link>
                      </>
                    )}

                    {user.role === 'pembeli' && (
                      <Link
                        href="/store/open"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Store className="w-4 h-4 text-gray-400" />
                        Buka Toko
                      </Link>
                    )}

                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary-800">Masuk</Link>
              <Link href="/register" className="bg-primary-800 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors">Daftar</Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-1">
          {user && (
            <div className="flex items-center gap-3 px-2 py-3 mb-2 border-b border-gray-100">
              <div className="w-10 h-10 bg-primary-800 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          )}

          <Link href="/home" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-2 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50">
            <ShoppingBag className="w-4 h-4 text-gray-400" /> Marketplace
          </Link>

          {user ? (
            <>
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-2 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50">
                <User className="w-4 h-4 text-gray-400" /> Edit Profil
              </Link>
              {isSellerRole && (
                <>
                  <Link href="/store/manage" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-2 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50">
                    <Store className="w-4 h-4 text-gray-400" /> Kelola Produk
                  </Link>
                  <Link href="/store/edit" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-2 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50">
                    <Settings className="w-4 h-4 text-gray-400" /> Pengaturan Toko
                  </Link>
                </>
              )}
              {user.role === 'pembeli' && (
                <Link href="/store/open" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-2 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50">
                  <Store className="w-4 h-4 text-gray-400" /> Buka Toko
                </Link>
              )}
              {user.role === 'admin' && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-2 py-2.5 text-sm font-medium text-orange-600 rounded-xl hover:bg-orange-50">
                  <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                </Link>
              )}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button onClick={logout} className="w-full flex items-center gap-3 px-2 py-2.5 text-sm font-medium text-red-500 rounded-xl hover:bg-red-50">
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-2 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50">Masuk</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="bg-primary-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl text-center mt-1">Daftar</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
