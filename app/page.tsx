import Link from 'next/link'
import { Recycle, Leaf, ShoppingBag, Users, Award, ArrowRight, Trash2, Factory, Palette, BaggageClaim } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-800 rounded-lg flex items-center justify-center">
              <Recycle className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-primary-800">RecycleMate</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-primary-800 hover:bg-primary-50 rounded-lg transition-colors">
              Masuk
            </Link>
            <Link href="/register" className="px-4 py-2 text-sm font-medium bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors">
              Daftar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-800 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <Leaf className="w-4 h-4" />
              <span>Marketplace Ramah Lingkungan #1 Indonesia</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Ubah Limbah Jadi <span className="text-green-300">Karya Bernilai</span>
            </h1>
            <p className="text-lg md:text-xl text-green-100 mb-10 max-w-2xl">
              RecycleMate menghubungkan penumpul limbah, pengepul, pengrajin, dan distributor dalam ekosistem daur ulang yang berkelanjutan.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/home" className="inline-flex items-center gap-2 bg-white text-primary-800 font-semibold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow-lg">
                <ShoppingBag className="w-5 h-5" />
                Jelajahi Produk
              </Link>
              <Link href="/register" className="inline-flex items-center gap-2 bg-transparent border-2 border-white text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
                Daftar Sekarang
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Pengguna Aktif', value: '2,500+', icon: Users },
              { label: 'Produk Tersedia', value: '1,200+', icon: ShoppingBag },
              { label: 'Transaksi Sukses', value: '8,000+', icon: Award },
              { label: 'Limbah Terkelola', value: '50 Ton', icon: Recycle },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-1">
                  <stat.icon className="w-6 h-6 text-primary-800" />
                </div>
                <div className="text-3xl font-bold text-primary-800">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Bagaimana RecycleMate Bekerja?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Rantai pasok daur ulang yang transparan dan menguntungkan semua pihak</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { role: 'Penumpul', desc: 'Kumpulkan limbah & jual ke pengepul', icon: Trash2 },
              { role: 'Pengepul', desc: 'Sortir & olah jadi bahan baku untuk pengrajin', icon: Factory },
              { role: 'Pengrajin', desc: 'Ciptakan kerajinan unik dari bahan daur ulang', icon: Palette },
              { role: 'Pembeli', desc: 'Dapatkan produk berkualitas ramah lingkungan', icon: BaggageClaim },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-primary-800" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">{item.role}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-800 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <Recycle className="w-16 h-16 mx-auto mb-6 text-green-300" />
          <h2 className="text-3xl font-bold mb-4">Bergabung dengan RecycleMate Sekarang</h2>
          <p className="text-green-100 mb-8">Jadilah bagian dari gerakan daur ulang Indonesia. Gratis untuk semua pengguna.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register" className="bg-white text-primary-800 font-semibold px-8 py-3 rounded-xl hover:bg-green-50 transition-colors">
              Buat Akun Gratis
            </Link>
            <Link href="/login" className="border-2 border-white text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
              Sudah Punya Akun
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-8 text-sm">
        <p>&copy; 2024 RecycleMate. Dibuat untuk lingkungan yang lebih baik.</p>
      </footer>
    </div>
  )
}
