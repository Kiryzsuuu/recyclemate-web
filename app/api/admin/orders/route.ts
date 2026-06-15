import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { getUser, isAdminUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user || !isAdminUser(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await connectDB()
    const orders = await Order.find().sort({ createdAt: -1 })
    return NextResponse.json({ orders })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
