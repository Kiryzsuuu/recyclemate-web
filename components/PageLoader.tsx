'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Recycle } from 'lucide-react'

export default function PageLoader() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [prev, setPrev] = useState(pathname)

  useEffect(() => {
    if (pathname !== prev) {
      setLoading(true)
      setPrev(pathname)
      const t = setTimeout(() => setLoading(false), 600)
      return () => clearTimeout(t)
    }
  }, [pathname, prev])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Breathing logo */}
        <div className="relative flex items-center justify-center">
          {/* Outer pulse rings */}
          <span className="absolute w-20 h-20 rounded-full bg-primary-800/10 animate-[ping_1.4s_ease-in-out_infinite]" />
          <span className="absolute w-16 h-16 rounded-full bg-primary-800/15 animate-[ping_1.4s_ease-in-out_0.2s_infinite]" />
          {/* Logo */}
          <div className="relative w-14 h-14 bg-primary-800 rounded-2xl flex items-center justify-center shadow-lg animate-[breathe_2s_ease-in-out_infinite]">
            <Recycle className="w-7 h-7 text-white" />
          </div>
        </div>
        <div className="flex gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-800 animate-[bounce_0.8s_ease-in-out_infinite]" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary-800 animate-[bounce_0.8s_ease-in-out_0.15s_infinite]" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary-800 animate-[bounce_0.8s_ease-in-out_0.3s_infinite]" />
        </div>
      </div>
    </div>
  )
}
