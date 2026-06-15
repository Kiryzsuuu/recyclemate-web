import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Store from '@/models/Store'
import User from '@/models/User'
import { getUser } from '@/lib/auth'
import { signToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const store = await Store.findOne({ ownerId: user.id })
  return NextResponse.json({ store })
}

export async function POST(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const existing = await Store.findOne({ ownerId: user.id })
    if (existing) return NextResponse.json({ error: 'Kamu sudah punya toko' }, { status: 409 })

    const body = await req.json()
    const { storeType } = body

    const store = await Store.create({
      ...body,
      ownerId: user.id,
      ownerName: user.name,
      ownerEmail: user.email,
    })

    // Upgrade user role
    const updatedUser = await User.findByIdAndUpdate(user.id, { role: storeType, storeId: store._id.toString() }, { new: true })

    // Issue new token with updated role
    const newToken = signToken({ id: user.id, name: user.name, email: user.email, role: storeType })

    const res = NextResponse.json({ store, user: updatedUser })
    res.cookies.set('token', newToken, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/' })
    return res
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
