import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Donation from '@/models/Donation'
import { getUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await connectDB()
    const donations = await Donation.find().sort({ createdAt: -1 })
    return NextResponse.json({ donations })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
