'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Star, MapPin, Package, Minus, Plus } from 'lucide-react'
import Button from '@/components/Button'

interface Product {
  _id: string
  name: string
  price: number
  material: string
  description: string
  imageUrl?: string
  stock: number
  rating: number
  ratingCount: number
  crafterName: string
  crafterCity: string
  productType: string
}

const MATERIAL_COLORS: Record<string, string> = {
  plastik: 'bg-blue-100',
  kayu: 'bg-amber-100',
  kaca: 'bg-cyan-100',
  kain: 'bg-purple-100',
  logam: 'bg-gray-200',
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(data => setProduct(data.product))
      .finally(() => setLoading(false))
  }, [id])

  const goToCheckout = () => {
    router.push(`/checkout/${product?._id}?qty=${qty}`)
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl h-96 animate-pulse" />
      </div>
    )
  }

  if (!product) {
    return <div className="text-center py-20 text-gray-500">Produk tidak ditemukan</div>
  }

  const matKey = product.material?.toLowerCase()
  const bgColor = MATERIAL_COLORS[matKey] || 'bg-green-100'

  return (
    <div>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-800 mb-6">
          Kembali
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Image */}
          <div className={`h-64 md:h-80 ${bgColor} flex items-center justify-center relative`}>
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-20 h-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            )}
            <span className="absolute top-4 right-4 bg-white/90 text-xs font-medium px-3 py-1 rounded-full capitalize">
              {product.productType}
            </span>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
              {product.ratingCount > 0 && (
                <div className="flex items-center gap-1 text-sm text-amber-500 flex-shrink-0">
                  <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                  <span className="font-medium">{product.rating.toFixed(1)}</span>
                  <span className="text-gray-400">({product.ratingCount})</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mb-4">
              {product.material && (
                <span className="bg-primary-50 text-primary-700 text-xs px-3 py-1 rounded-full font-medium">
                  {product.material}
                </span>
              )}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span>{product.crafterCity || product.crafterName}</span>
              </div>
            </div>

            <div className="text-2xl font-bold text-primary-800 mb-4">
              Rp {product.price.toLocaleString('id-ID')}
            </div>

            {product.description && (
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{product.description}</p>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Package className="w-4 h-4" />
              <span>Stok: <span className={product.stock === 0 ? 'text-red-500' : 'text-gray-700 font-medium'}>{product.stock} unit</span></span>
            </div>

            {/* Quantity + Buy */}
            {product.stock > 0 ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-50 transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-gray-50 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button size="lg" onClick={goToCheckout} className="flex-1">
                  Beli — Rp {(product.price * qty).toLocaleString('id-ID')}
                </Button>
              </div>
            ) : (
              <Button size="lg" disabled className="w-full">Stok Habis</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
