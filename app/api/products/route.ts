import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { getUser } from '@/lib/auth'

function getAllowedTypes(role?: string): string[] {
  switch (role) {
    case 'admin': return ['waste', 'material', 'handcraft', 'retail']
    case 'pengepul': return ['waste', 'handcraft', 'retail']
    case 'pengrajin': return ['material', 'handcraft', 'retail']
    case 'distributor': return ['handcraft', 'retail']
    default: return ['handcraft', 'retail']
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role') || undefined
    const search = searchParams.get('search') || ''
    const material = searchParams.get('material') || ''

    const allowedTypes = getAllowedTypes(role)
    const query: Record<string, unknown> = { isActive: true, productType: { $in: allowedTypes } }

    if (search) query.name = { $regex: search, $options: 'i' }
    if (material && material !== 'Semua') query.material = { $regex: material, $options: 'i' }

    const products = await Product.find(query).sort({ createdAt: -1 }).limit(100)
    return NextResponse.json({ products })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sellerRoles = ['penumpul', 'pengepul', 'pengrajin', 'distributor', 'admin']
    if (!sellerRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Hanya penjual yang bisa menambah produk' }, { status: 403 })
    }

    await connectDB()
    const body = await req.json()

    const { name, price, productType, material, description, stock, imageUrl, crafterCity } = body
    if (!name || !price || !productType) {
      return NextResponse.json({ error: 'name, price, dan productType wajib diisi' }, { status: 400 })
    }
    const validTypes = ['waste', 'material', 'handcraft', 'retail']
    if (!validTypes.includes(productType)) {
      return NextResponse.json({ error: 'productType tidak valid' }, { status: 400 })
    }

    const product = await Product.create({
      name, price, productType,
      material: material || '',
      description: description || '',
      stock: stock || 0,
      imageUrl: imageUrl || '',
      crafterCity: crafterCity || '',
      crafterId: user.id,
      crafterName: user.name,
      sellerRole: user.role,
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
