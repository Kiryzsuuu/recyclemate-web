import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('token')?.value

  const isAdmin = pathname.startsWith('/admin')

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAdmin && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/home', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/home/:path*', '/profile/:path*', '/store/:path*', '/products/:path*', '/admin/:path*'],
}
