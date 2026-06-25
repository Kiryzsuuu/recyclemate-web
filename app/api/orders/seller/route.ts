import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { getUser } from '@/lib/auth'

// Pesanan masuk untuk penjual (produk milik user yang sedang login)
export async function GET(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const orders = await Order.find({ crafterId: user.id }).sort({ createdAt: -1 })
    return NextResponse.json({ orders })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
