import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { sendStatusUpdate } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 })

    await connectDB()
    const user = await User.findOne({ email: email.toLowerCase() })

    // Selalu return sukses agar tidak bocorkan info email terdaftar atau tidak
    if (!user) {
      return NextResponse.json({ message: 'Jika email terdaftar, link reset telah dikirim' })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 jam

    user.resetToken = token
    user.resetTokenExpires = expires
    await user.save()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://recyclemate-web.vercel.app'
    const resetUrl = `${appUrl}/reset-password?token=${token}`

    try {
      await sendStatusUpdate(
        user.name,
        user.email,
        'Reset Password RecycleMate',
        `Kamu meminta reset password. Klik link berikut untuk membuat password baru (berlaku 1 jam):<br/><br/><a href="${resetUrl}" style="color:#15803d;font-weight:bold;">${resetUrl}</a><br/><br/>Jika kamu tidak merasa meminta ini, abaikan email ini.`
      )
    } catch (emailErr) {
      console.error('Failed to send reset email:', emailErr)
    }

    return NextResponse.json({ message: 'Jika email terdaftar, link reset telah dikirim' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
