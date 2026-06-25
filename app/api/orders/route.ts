import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Product from '@/models/Product'
import User from '@/models/User'
import { getUser } from '@/lib/auth'
import { sendOrderConfirmation, sendStatusUpdate } from '@/lib/email'
import { DEFAULT_SHIPPING_COST, getPaymentOption } from '@/lib/payment'

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
    const body = await req.json()
    const {
      productId, quantity,
      recipientName, recipientPhone, shippingAddress, shippingCity, notes,
      paymentMethod,
    } = body

    const qty = Number(quantity) || 1
    if (qty < 1) return NextResponse.json({ error: 'Jumlah tidak valid' }, { status: 400 })

    const product = await Product.findById(productId)
    if (!product || !product.isActive) return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
    if (product.stock < qty) return NextResponse.json({ error: 'Stok tidak cukup' }, { status: 400 })

    if (!recipientName?.trim()) return NextResponse.json({ error: 'Nama penerima wajib diisi' }, { status: 400 })
    if (!recipientPhone?.trim()) return NextResponse.json({ error: 'No. HP penerima wajib diisi' }, { status: 400 })
    if (!shippingAddress?.trim()) return NextResponse.json({ error: 'Alamat pengiriman wajib diisi' }, { status: 400 })

    const payment = getPaymentOption(paymentMethod)
    if (!payment) return NextResponse.json({ error: 'Metode pembayaran tidak valid' }, { status: 400 })

    const subtotal = product.price * qty
    const shippingCost = DEFAULT_SHIPPING_COST
    const totalPrice = subtotal + shippingCost

    const order = await Order.create({
      buyerId: user.id,
      buyerName: user.name,
      buyerEmail: user.email,
      productId: product._id.toString(),
      productName: product.name,
      productPrice: product.price,
      productImageUrl: product.imageUrl || '',
      quantity: qty,
      subtotal,
      shippingCost,
      totalPrice,
      crafterId: product.crafterId,
      crafterName: product.crafterName,
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.trim(),
      shippingAddress: shippingAddress.trim(),
      shippingCity: shippingCity?.trim() || '',
      notes: notes?.trim() || '',
      paymentMethod,
      // COD langsung diproses, lainnya menunggu pembayaran
      status: paymentMethod === 'cod' ? 'paid' : 'pending',
      ...(paymentMethod === 'cod' ? { paidAt: new Date() } : {}),
    })

    await Product.findByIdAndUpdate(productId, { $inc: { stock: -qty } })

    // Notifikasi email
    try {
      await sendOrderConfirmation(user.name, user.email, product.name, qty, totalPrice, product.crafterName)
      // Notifikasi ke penjual
      const seller = await User.findById(product.crafterId).select('name email')
      if (seller?.email) {
        await sendStatusUpdate(
          seller.name,
          seller.email,
          'Pesanan Baru Masuk! - RecycleMate',
          `Kamu menerima pesanan baru untuk produk <b>${product.name}</b> sebanyak ${qty} unit (Total Rp ${totalPrice.toLocaleString('id-ID')}). Silakan cek dashboard toko kamu untuk memproses pesanan.`
        )
      }
    } catch {}

    return NextResponse.json({ order }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
