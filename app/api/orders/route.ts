import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Product from '@/models/Product'
import { getUser } from '@/lib/auth'
import { sendOrderConfirmation } from '@/lib/email'

export async function GET(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const orders = await Order.find({ buyerId: user.id }).sort({ createdAt: -1 })
    return NextResponse.json({ orders })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { productId, quantity, shippingAddress, notes } = await req.json()

    const product = await Product.findById(productId)
    if (!product || !product.isActive) return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
    if (product.stock < quantity) return NextResponse.json({ error: 'Stok tidak cukup' }, { status: 400 })

    const totalPrice = product.price * quantity

    const order = await Order.create({
      buyerId: user.id,
      buyerName: user.name,
      buyerEmail: user.email,
      productId: product._id.toString(),
      productName: product.name,
      productPrice: product.price,
      quantity,
      totalPrice,
      crafterId: product.crafterId,
      crafterName: product.crafterName,
      shippingAddress: shippingAddress || '',
      notes: notes || '',
    })

    await Product.findByIdAndUpdate(productId, { $inc: { stock: -quantity } })

    try {
      await sendOrderConfirmation(user.name, user.email, product.name, quantity, totalPrice, product.crafterName)
    } catch {}

    return NextResponse.json({ order }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
