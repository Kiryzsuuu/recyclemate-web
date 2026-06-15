import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import SiteSettings from '@/models/SiteSettings'

export async function GET() {
  try {
    await connectDB()
    let settings = await SiteSettings.findOne().lean()
    if (!settings) {
      settings = {
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
    }
    return NextResponse.json({ settings })
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil pengaturan' }, { status: 500 })
  }
}
