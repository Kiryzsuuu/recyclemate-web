import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getUser, isAdminUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user || !isAdminUser(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await connectDB()
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    return NextResponse.json({ users })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = getUser(req)
    if (!actor || !isAdminUser(actor)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await connectDB()
    const { name, email, password, role } = await req.json()

    if (!name?.trim()) return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 })
    if (!email?.trim()) return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 })
    if (!password || password.length < 6) return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })

    const validRoles = ['admin', 'pembeli', 'penumpul', 'pengepul', 'pengrajin', 'distributor']
    const userRole = validRoles.includes(role) ? role : 'pembeli'

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 })

    const hashed = await bcrypt.hash(password, 10)
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role: userRole,
      isAdmin: userRole === 'admin',
    })

    const { password: _, ...userData } = newUser.toObject()
    return NextResponse.json({ user: userData }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user || !isAdminUser(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await connectDB()
    const { userId, role, isDeactivated } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId diperlukan' }, { status: 400 })

    const update: Record<string, unknown> = {}
    if (role !== undefined) {
      update.role = role
      update.isAdmin = role === 'admin'
    }
    if (isDeactivated !== undefined) update.isDeactivated = isDeactivated

    const updated = await User.findByIdAndUpdate(userId, update, { new: true }).select('-password')
    if (!updated) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ user: updated })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const actor = getUser(req)
    if (!actor || !isAdminUser(actor)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await connectDB()
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId diperlukan' }, { status: 400 })

    // Prevent deleting own account
    if (userId === actor.id) return NextResponse.json({ error: 'Tidak bisa menghapus akun sendiri' }, { status: 400 })

    const deleted = await User.findByIdAndDelete(userId)
    if (!deleted) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

    return NextResponse.json({ message: 'User berhasil dihapus' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
