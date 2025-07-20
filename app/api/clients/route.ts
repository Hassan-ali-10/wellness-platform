import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { mockApiClient } from "@/lib/mock-api"

async function getClients(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    let query = "SELECT * FROM clients"
    let countQuery = "SELECT COUNT(*) FROM clients"
    const params: any[] = []

    if (search) {
      query += " WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1"
      countQuery += " WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1"
      params.push(`%${search}%`)
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const [clientsResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, search ? [`%${search}%`] : []),
    ])

    // Sync with mock API (in background)
    try {
      const mockClients = await mockApiClient.fetchClients()
      // Here you would implement sync logic to update local database
      // with any new clients from the mock API
    } catch (error) {
      console.warn("Failed to sync with mock API:", error)
    }

    return NextResponse.json({
      clients: clientsResult.rows,
      total: Number.parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(Number.parseInt(countResult.rows[0].count) / limit),
    })
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}

export const GET = requireAuth(getClients)
