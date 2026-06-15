import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()
    if (!token || !password) return NextResponse.json({ error: 'Token dan password wajib diisi' }, { status: 400 })
    if (password.length < 6) return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })

    await connectDB()
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json({ error: 'Token tidak valid atau sudah kedaluwarsa' }, { status: 400 })
    }

    user.password = await bcrypt.hash(password, 10)
    user.resetToken = ''
    user.resetTokenExpires = undefined
    await user.save()

    return NextResponse.json({ message: 'Password berhasil diubah' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
