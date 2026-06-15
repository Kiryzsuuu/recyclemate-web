import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Donation from '@/models/Donation'
import { getUser } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const donation = await Donation.findById(params.id)
    if (!donation) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (donation.donorId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { status } = await req.json()
    const updated = await Donation.findByIdAndUpdate(params.id, { status }, { new: true })
    return NextResponse.json({ donation: updated })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
