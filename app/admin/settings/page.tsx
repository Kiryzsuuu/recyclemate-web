'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, Mail, Phone, MapPin, Shield, Palette, Settings, Save, AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface SiteSettings {
  siteName: string
  siteTagline: string
  footerText: string
  copyrightYear: number
  contactEmail: string
  whatsappNumber: string
  address: string
  registrationEnabled: boolean
  storeOpenEnabled: boolean
  donationsEnabled: boolean
  maintenanceMode: boolean
  maintenanceMessage: string
  primaryColor: string
  logoUrl: string
  maxProductsPerStore: number
  maxImageSizeKb: number
}

const defaultSettings: SiteSettings = {
  siteName: 'RecycleMate',
  siteTagline: 'Marketplace Produk Daur Ulang',
  footerText: 'Dibuat untuk lingkungan yang lebih baik.',
  copyrightYear: new Date().getFullYear(),
  contactEmail: '',
  whatsappNumber: '',
  address: '',
  registrationEnabled: true,
  storeOpenEnabled: true,
  donationsEnabled: true,
  maintenanceMode: false,
  maintenanceMessage: 'Sedang dalam pemeliharaan. Silakan coba lagi nanti.',
  primaryColor: '#166534',
  logoUrl: '',
  maxProductsPerStore: 50,
  maxImageSizeKb: 2048,
}

function Toggle({ value, onChange, label, description }: { value: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-primary-800' : 'bg-gray-200'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50">
        <Icon className="w-4 h-4 text-gray-500" />
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"

export default function AdminSettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || (d.user.role !== 'admin' && !d.user.isAdmin)) { router.push('/home'); return }
    })
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      if (d.settings) setSettings(s => ({ ...s, ...d.settings }))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [router])

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings(s => ({ ...s, [key]: value }))
    setSaved(false)
  }

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const text = await res.text()
      let data: { error?: string } = {}
      try { data = JSON.parse(text) } catch { setError(`Server error: ${text.slice(0, 100)}`); return }
      if (!res.ok) { setError(data.error || `Gagal menyimpan (${res.status})`); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(`Kesalahan jaringan: ${err instanceof Error ? err.message : 'unknown'}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-800 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-primary-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="RecycleMate" width={80} height={80} className="h-9 w-auto brightness-0 invert" />
            <span className="text-xs bg-orange-500 px-2 py-0.5 rounded-full">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm text-green-100 hover:text-white">Dashboard</Link>
            <Link href="/home" className="text-sm text-green-100 hover:text-white">Marketplace</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pengaturan Situs</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola konfigurasi tampilan dan fitur RecycleMate</p>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 bg-primary-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-60 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>

        {saved && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
            Pengaturan berhasil disimpan.
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
        )}

        <div className="flex flex-col gap-5">
          {/* General */}
          <Section title="Informasi Umum" icon={Globe}>
            <Field label="Nama Situs">
              <input className={inputClass} value={settings.siteName} onChange={e => set('siteName', e.target.value)} />
            </Field>
            <Field label="Tagline / Deskripsi Singkat">
              <input className={inputClass} value={settings.siteTagline} onChange={e => set('siteTagline', e.target.value)} />
            </Field>
            <Field label="Teks Footer">
              <input className={inputClass} value={settings.footerText} onChange={e => set('footerText', e.target.value)} />
            </Field>
            <Field label="Tahun Copyright">
              <input className={inputClass} type="number" value={settings.copyrightYear} onChange={e => set('copyrightYear', Number(e.target.value))} />
            </Field>
          </Section>

          {/* Contact */}
          <Section title="Informasi Kontak" icon={Mail}>
            <Field label="Email Kontak">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input className={inputClass + ' pl-10'} type="email" value={settings.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="info@recyclemate.id" />
              </div>
            </Field>
            <Field label="Nomor WhatsApp">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input className={inputClass + ' pl-10'} value={settings.whatsappNumber} onChange={e => set('whatsappNumber', e.target.value)} placeholder="628xx" />
              </div>
            </Field>
            <Field label="Alamat">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea className={inputClass + ' pl-10'} rows={2} value={settings.address} onChange={e => set('address', e.target.value)} placeholder="Alamat kantor / operasional" />
              </div>
            </Field>
          </Section>

          {/* Feature Flags */}
          <Section title="Fitur & Akses" icon={Shield}>
            <div className="divide-y divide-gray-100">
              <Toggle
                value={settings.registrationEnabled}
                onChange={v => set('registrationEnabled', v)}
                label="Pendaftaran Akun"
                description="Izinkan pengguna baru mendaftar"
              />
              <Toggle
                value={settings.storeOpenEnabled}
                onChange={v => set('storeOpenEnabled', v)}
                label="Buka Toko"
                description="Izinkan pengguna membuka toko baru"
              />
              <Toggle
                value={settings.donationsEnabled}
                onChange={v => set('donationsEnabled', v)}
                label="Setor Limbah"
                description="Izinkan pengguna mengirim setoran limbah"
              />
            </div>
          </Section>

          {/* Maintenance */}
          <Section title="Mode Pemeliharaan" icon={AlertTriangle}>
            <div className="mb-4">
              <Toggle
                value={settings.maintenanceMode}
                onChange={v => set('maintenanceMode', v)}
                label="Aktifkan Maintenance Mode"
                description="Semua halaman akan menampilkan pesan pemeliharaan"
              />
              {settings.maintenanceMode && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                  Maintenance mode aktif. Pengguna tidak dapat mengakses situs.
                </div>
              )}
            </div>
            <Field label="Pesan Pemeliharaan">
              <textarea
                className={inputClass}
                rows={2}
                value={settings.maintenanceMessage}
                onChange={e => set('maintenanceMessage', e.target.value)}
              />
            </Field>
          </Section>

          {/* Limits */}
          <Section title="Batas & Limit" icon={Settings}>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Maks. Produk per Toko">
                <input
                  className={inputClass}
                  type="number"
                  min={1}
                  value={settings.maxProductsPerStore}
                  onChange={e => set('maxProductsPerStore', Number(e.target.value))}
                />
              </Field>
              <Field label="Maks. Ukuran Gambar (KB)">
                <input
                  className={inputClass}
                  type="number"
                  min={100}
                  value={settings.maxImageSizeKb}
                  onChange={e => set('maxImageSizeKb', Number(e.target.value))}
                />
              </Field>
            </div>
          </Section>

          {/* Appearance */}
          <Section title="Tampilan" icon={Palette}>
            <Field label="Warna Utama (Primary Color)">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={e => set('primaryColor', e.target.value)}
                  className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer p-1"
                />
                <input
                  className={inputClass + ' flex-1'}
                  value={settings.primaryColor}
                  onChange={e => set('primaryColor', e.target.value)}
                  placeholder="#166534"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Perubahan warna memerlukan deploy ulang untuk berlaku sepenuhnya (Tailwind CSS).</p>
            </Field>
          </Section>

          {/* Save bottom */}
          <div className="flex justify-end pb-4">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 bg-primary-800 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-60 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
