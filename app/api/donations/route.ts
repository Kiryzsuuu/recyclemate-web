import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Donation from '@/models/Donation'
import { getUser } from '@/lib/auth'
import { sendDonationConfirmation } from '@/lib/email'

export async function GET(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const donations = await Donation.find({ donorId: user.id }).sort({ createdAt: -1 })
    return NextResponse.json({ donations })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const body = await req.json()

    const { itemName, material, quantity, description, imageUrl } = body
    if (!itemName) {
      return NextResponse.json({ error: 'itemName wajib diisi' }, { status: 400 })
    }

    const donation = await Donation.create({
      itemName,
      material: material || '',
      quantity: quantity || 1,
      description: description || '',
      imageUrl: imageUrl || '',
      donorId: user.id,
      donorName: user.name,
      donorEmail: user.email,
    })

    try {
      await sendDonationConfirmation(user.name, user.email, body.itemName, body.material, body.quantity)
    } catch {}

    return NextResponse.json({ donation }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
