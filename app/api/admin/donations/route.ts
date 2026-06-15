import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Donation from '@/models/Donation'
import { getUser, isAdminUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user || !isAdminUser(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await connectDB()
    const donations = await Donation.find().sort({ createdAt: -1 })
    return NextResponse.json({ donations })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
