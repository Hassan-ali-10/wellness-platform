import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { comparePassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find admin by email
    const result = await pool.query("SELECT id, email, password_hash, name FROM admins WHERE email = $1", [email])
   
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const admin = result.rows[0]
  
    // Verify password
    const isValidPassword = await comparePassword(password, admin.password_hash)
    console.log("result",isValidPassword)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const token = generateToken({
      adminId: admin.id,
      email: admin.email,
    })

    return NextResponse.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
