import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { getUser } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const order = await Order.findById(params.id)
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (order.buyerId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { status } = await req.json()
    const updated = await Order.findByIdAndUpdate(params.id, { status, updatedAt: new Date() }, { new: true })
    return NextResponse.json({ order: updated })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
