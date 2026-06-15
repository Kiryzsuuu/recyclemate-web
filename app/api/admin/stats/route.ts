import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Product from '@/models/Product'
import Order from '@/models/Order'
import Donation from '@/models/Donation'
import { getUser, isAdminUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = getUser(req)
  if (!user || !isAdminUser(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await connectDB()
  const [users, products, orders, donations] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Donation.countDocuments(),
  ])

  return NextResponse.json({ users, products, orders, donations })
}
