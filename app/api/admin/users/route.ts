import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await connectDB()
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    return NextResponse.json({ users })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await connectDB()
    const { userId, role, isDeactivated } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId diperlukan' }, { status: 400 })

    const update: Record<string, unknown> = {}
    if (role !== undefined) update.role = role
    if (isDeactivated !== undefined) update.isDeactivated = isDeactivated

    const updated = await User.findByIdAndUpdate(userId, update, { new: true }).select('-password')
    if (!updated) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ user: updated })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
