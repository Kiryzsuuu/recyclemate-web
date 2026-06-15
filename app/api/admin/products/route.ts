import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { getUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await connectDB()
    const products = await Product.find().sort({ createdAt: -1 })
    return NextResponse.json({ products })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
