import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function POST() {
  try {
    await connectDB()
    const adminEmail = process.env.ADMIN_EMAIL!
    const adminPassword = process.env.ADMIN_PASSWORD!

    const existing = await User.findOne({ email: adminEmail.toLowerCase() })
    if (existing) {
      return NextResponse.json({ message: 'Admin already exists' })
    }

    const hashed = await bcrypt.hash(adminPassword, 10)
    await User.create({
      name: 'Admin RecycleMate',
      email: adminEmail.toLowerCase(),
      password: hashed,
      role: 'admin',
      isAdmin: true,
      city: 'Jakarta',
      phone: '',
    })

    return NextResponse.json({ message: 'Admin seeded successfully' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
  }
}
