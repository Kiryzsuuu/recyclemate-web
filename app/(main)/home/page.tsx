'use client'
import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import CategoryChip from '@/components/CategoryChip'

const CATEGORIES = ['Semua', 'Plastik', 'Kayu', 'Kaca', 'Kain', 'Logam']

interface Product {
  _id: string
  name: string
  price: number
  material: string
  imageUrl?: string
  rating: number
  ratingCount: number
  crafterName: string
  crafterCity: string
  stock: number
  productType: string
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState('Semua')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string | undefined>(undefined)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => { if (data.user) setRole(data.user.role) })
      .catch(() => {})
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (role) params.set('role', role)
      if (search) params.set('search', search)
      if (category !== 'Semua') params.set('material', category)
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data.products || [])
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [role, search, category])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return (
    <div>
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Marketplace Daur Ulang</h1>
          <p className="text-green-100 text-sm mb-6">Temukan produk upcycle terbaik dari seluruh Indonesia</p>
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari produk daur ulang..."
              className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <CategoryChip
              key={cat}
              label={cat}
              active={category === cat}
              onClick={() => setCategory(cat)}
            />
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">♻️</div>
            <p className="text-gray-500 font-medium">Tidak ada produk ditemukan</p>
            <p className="text-gray-400 text-sm mt-1">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{products.length} produk ditemukan</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
