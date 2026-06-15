import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import SiteSettings from '@/models/SiteSettings'
import { getUser, isAdminUser } from '@/lib/auth'

async function getOrCreateSettings() {
  let settings = await SiteSettings.findOne()
  if (!settings) settings = await SiteSettings.create({})
  return settings
}

export async function GET() {
  try {
    await connectDB()
    const settings = await getOrCreateSettings()
    return NextResponse.json({ settings })
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil pengaturan' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = getUser(req)
    if (!isAdminUser(admin)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const body = await req.json()

    const allowed = [
      'siteName', 'siteTagline', 'footerText', 'copyrightYear',
      'contactEmail', 'whatsappNumber', 'address',
      'registrationEnabled', 'storeOpenEnabled', 'donationsEnabled',
      'maintenanceMode', 'maintenanceMessage',
      'primaryColor', 'logoUrl',
      'maxProductsPerStore', 'maxImageSizeKb',
    ]

    const update: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) update[key] = body[key]
    }

    let settings = await SiteSettings.findOne()
    if (!settings) {
      settings = await SiteSettings.create(update)
    } else {
      Object.assign(settings, update)
      await settings.save()
    }

    return NextResponse.json({ settings })
  } catch {
    return NextResponse.json({ error: 'Gagal menyimpan pengaturan' }, { status: 500 })
  }
}
