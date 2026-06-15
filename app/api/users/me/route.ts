import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getUser } from '@/lib/auth'

export async function PUT(req: NextRequest) {
  try {
    const payload = getUser(req)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { name, city, phone, bio, avatarUrl } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nama tidak boleh kosong' }, { status: 400 })
    }

    await connectDB()
    const user = await User.findByIdAndUpdate(
      payload.id,
      {
        name: name.trim(),
        city: city?.trim() || '',
        phone: phone?.trim() || '',
        bio: bio?.trim() || '',
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      },
      { new: true }
    ).select('-password')

    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

    return NextResponse.json({ user })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Gagal memperbarui profil' }, { status: 500 })
  }
}
