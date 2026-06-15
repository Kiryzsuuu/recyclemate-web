import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import SiteSettings from '@/models/SiteSettings'

const defaults = {
  siteName: 'RecycleMate',
  siteTagline: 'Marketplace Produk Daur Ulang',
  footerText: 'Dibuat untuk lingkungan yang lebih baik.',
  copyrightYear: new Date().getFullYear(),
  contactEmail: '',
  whatsappNumber: '',
  maintenanceMode: false,
  registrationEnabled: true,
  storeOpenEnabled: true,
  donationsEnabled: true,
}

export async function GET() {
  try {
    await connectDB()
    const settings = await SiteSettings.findOne().lean() ?? defaults
    return NextResponse.json({ settings })
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil pengaturan' }, { status: 500 })
  }
}
