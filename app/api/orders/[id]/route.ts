import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Product from '@/models/Product'
import User from '@/models/User'
import { getUser, isAdminUser } from '@/lib/auth'
import { sendStatusUpdate } from '@/lib/email'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const order = await Order.findById(params.id)
    if (!order) return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 })

    // Hanya pembeli, penjual terkait, atau admin yang boleh lihat
    const allowed = order.buyerId === user.id || order.crafterId === user.id || isAdminUser(user)
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    return NextResponse.json({ order })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const order = await Order.findById(params.id)
    if (!order) return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 })

    const isBuyer = order.buyerId === user.id
    const isSeller = order.crafterId === user.id
    const isAdmin = isAdminUser(user)
    if (!isBuyer && !isSeller && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { action, paymentProofUrl, trackingNumber } = await req.json()
    const update: Record<string, unknown> = { updatedAt: new Date() }

    switch (action) {
      case 'upload_proof':
        if (!isBuyer && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        if (!paymentProofUrl) return NextResponse.json({ error: 'Bukti pembayaran diperlukan' }, { status: 400 })
        update.paymentProofUrl = paymentProofUrl
        update.paidAt = new Date()
        // Status tetap pending sampai penjual konfirmasi
        break

      case 'confirm_payment':
        if (!isSeller && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        if (order.status !== 'pending') return NextResponse.json({ error: 'Pesanan tidak dalam status menunggu' }, { status: 400 })
        update.status = 'paid'
        break

      case 'process':
        if (!isSeller && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        update.status = 'processing'
        break

      case 'ship':
        if (!isSeller && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        update.status = 'shipped'
        if (trackingNumber) update.trackingNumber = trackingNumber
        break

      case 'complete':
        if (!isBuyer && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        update.status = 'completed'
        break

      case 'cancel':
        if (order.status === 'shipped' || order.status === 'completed') {
          return NextResponse.json({ error: 'Pesanan tidak bisa dibatalkan' }, { status: 400 })
        }
        update.status = 'cancelled'
        // Kembalikan stok
        await Product.findByIdAndUpdate(order.productId, { $inc: { stock: order.quantity } })
        break

      default:
        return NextResponse.json({ error: 'Aksi tidak valid' }, { status: 400 })
    }

    const updated = await Order.findByIdAndUpdate(params.id, update, { new: true })

    // Notifikasi perubahan status ke pembeli
    try {
      if (action === 'confirm_payment') {
        await sendStatusUpdate(order.buyerName, order.buyerEmail, 'Pembayaran Dikonfirmasi - RecycleMate', `Pembayaran untuk pesanan <b>${order.productName}</b> telah dikonfirmasi penjual dan sedang diproses.`)
      } else if (action === 'ship') {
        await sendStatusUpdate(order.buyerName, order.buyerEmail, 'Pesanan Dikirim - RecycleMate', `Pesanan <b>${order.productName}</b> sedang dalam pengiriman.${trackingNumber ? ` No. Resi: <b>${trackingNumber}</b>` : ''}`)
      }
    } catch {}

    return NextResponse.json({ order: updated })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
