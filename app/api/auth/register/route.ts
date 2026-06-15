import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { signToken } from '@/lib/auth'
import { sendWelcome } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { name, email, password, role, city, phone } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const isAdmin = email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase()

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: isAdmin ? 'admin' : (role || 'pembeli'),
      city: city || '',
      phone: phone || '',
    })

    const token = signToken({ id: user._id.toString(), name: user.name, email: user.email, role: user.role })

    try { await sendWelcome(name, email) } catch {}

    const res = NextResponse.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } })
    res.cookies.set('token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/' })
    return res
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
