'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function PageLoader() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [prev, setPrev] = useState(pathname)

  useEffect(() => {
    if (pathname === prev) return
    setPrev(pathname)

    // Only show loader if navigation takes longer than 400ms
    const showTimer = setTimeout(() => setLoading(true), 400)
    const hideTimer = setTimeout(() => {
      clearTimeout(showTimer)
      setLoading(false)
    }, 1200)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
      setLoading(false)
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
          <div className="relative w-16 h-16 rounded-[18px] overflow-hidden shadow-lg animate-[breathe_2s_ease-in-out_infinite]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="RecycleMate" className="w-full h-full object-cover" />
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
