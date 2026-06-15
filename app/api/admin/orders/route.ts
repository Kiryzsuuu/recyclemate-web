import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { getUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = getUser(req)
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await connectDB()
  const orders = await Order.find().sort({ createdAt: -1 })
  return NextResponse.json({ orders })
}
