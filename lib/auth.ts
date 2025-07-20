import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import type { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"

export interface JWTPayload {
  adminId: string
  email: string
  iat?: number
  exp?: number
}

export function generateToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  
  console.log(password,hash)
  return bcrypt.compare(password, hash)
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }
  return null
}

export function requireAuth(handler: Function) {
  return async (request: NextRequest, context: any) => {
    const token = getTokenFromRequest(request)

    if (!token) {
      return Response.json({ error: "Authentication required" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return Response.json({ error: "Invalid or expired token" }, { status: 401 })
    }
    // Add user info to request context
    ;(request as any).user = payload

    return handler(request, context)
  }
}
