import mongoose, { Schema, Document } from 'mongoose'

export interface ISiteSettings extends Document {
  // General
  siteName: string
  siteTagline: string
  footerText: string
  copyrightYear: number
  // Contact
  contactEmail: string
  whatsappNumber: string
  address: string
  // Feature flags
  registrationEnabled: boolean
  storeOpenEnabled: boolean
  donationsEnabled: boolean
  maintenanceMode: boolean
  maintenanceMessage: string
  // Appearance
  primaryColor: string
  logoUrl: string
  // Limits
  maxProductsPerStore: number
  maxImageSizeKb: number
}

const SiteSettingsSchema = new Schema<ISiteSettings>({
  siteName: { type: String, default: 'RecycleMate' },
  siteTagline: { type: String, default: 'Marketplace Produk Daur Ulang' },
  footerText: { type: String, default: 'Dibuat untuk lingkungan yang lebih baik.' },
  copyrightYear: { type: Number, default: new Date().getFullYear() },
  contactEmail: { type: String, default: '' },
  whatsappNumber: { type: String, default: '' },
  address: { type: String, default: '' },
  registrationEnabled: { type: Boolean, default: true },
  storeOpenEnabled: { type: Boolean, default: true },
  donationsEnabled: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false },
  maintenanceMessage: { type: String, default: 'Sedang dalam pemeliharaan. Silakan coba lagi nanti.' },
  primaryColor: { type: String, default: '#166534' },
  logoUrl: { type: String, default: '' },
  maxProductsPerStore: { type: Number, default: 50 },
  maxImageSizeKb: { type: Number, default: 2048 },
}, { timestamps: true })

export default mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema)
