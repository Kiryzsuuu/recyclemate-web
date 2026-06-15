import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

// One-time fix: restore admin role for the admin email
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

    return NextResponse.json({ message: 'Admin role restored', user })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
