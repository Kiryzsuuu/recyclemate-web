import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET!

export interface UserPayload {
  id: string
  name: string
  email: string
  role: string
  isAdmin?: boolean
}

export function signToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload
  } catch {
    return null
  }
}

export function getUser(request: NextRequest): UserPayload | null {
  const token = request.cookies.get('token')?.value
  if (!token) return null
  return verifyToken(token)
}

export function isAdminUser(payload: UserPayload | null): boolean {
  return !!payload && (payload.role === 'admin' || payload.isAdmin === true)
}
