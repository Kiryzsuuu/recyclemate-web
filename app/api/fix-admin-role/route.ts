import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { signToken } from '@/lib/auth'

// One-time fix: restore admin role and issue new token
export async function GET() {
  try {
    await connectDB()
    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail) return NextResponse.json({ error: 'ADMIN_EMAIL not set' }, { status: 500 })

    const user = await User.findOneAndUpdate(
      { email: adminEmail },
      { role: 'admin', isAdmin: true },
      { new: true }
    ).select('-password')

    if (!user) return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })

    const token = signToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: 'admin',
      isAdmin: true,
    })

    const res = NextResponse.json({ message: 'Admin role restored. Silakan logout dan login ulang.', user })
    res.cookies.set('token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/' })
    return res
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
