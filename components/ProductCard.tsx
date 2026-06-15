import Link from 'next/link'
import { Star, MapPin } from 'lucide-react'

const MATERIAL_COLORS: Record<string, string> = {
  plastik: 'bg-blue-100',
  kayu: 'bg-amber-100',
  kaca: 'bg-cyan-100',
  kain: 'bg-purple-100',
  logam: 'bg-gray-200',
}

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

export default function ProductCard({ product }: { product: Product }) {
  const matKey = product.material?.toLowerCase()
  const bgColor = MATERIAL_COLORS[matKey] || 'bg-green-100'

  return (
    <Link href={`/products/${product._id}`} className="group block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className={`h-40 ${bgColor} flex items-center justify-center relative overflow-hidden`}>
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-4xl opacity-30">♻️</div>
        )}
        <span className="absolute top-2 right-2 text-xs font-medium bg-white/90 px-2 py-0.5 rounded-full capitalize">
          {product.productType}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-primary-800 transition-colors">
            {product.name}
          </h3>
        </div>
        {product.material && (
          <span className="inline-block text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full mb-2">
            {product.material}
          </span>
        )}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <MapPin className="w-3 h-3" />
          <span>{product.crafterCity || product.crafterName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-primary-800">
            Rp {product.price.toLocaleString('id-ID')}
          </span>
          {product.ratingCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-500">
              <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        {product.stock <= 5 && product.stock > 0 && (
          <p className="text-xs text-orange-500 mt-1">Sisa {product.stock} stok</p>
        )}
        {product.stock === 0 && (
          <p className="text-xs text-red-500 mt-1">Stok habis</p>
        )}
      </div>
    </Link>
  )
}
