import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { mockApiClient } from "@/lib/mock-api"

async function getAppointments(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("clientId")
    const upcoming = searchParams.get("upcoming") === "true"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    let query = `
      SELECT a.*, c.name as client_name, c.email as client_email 
      FROM appointments a 
      JOIN clients c ON a.client_id = c.id
    `
    let countQuery = "SELECT COUNT(*) FROM appointments a JOIN clients c ON a.client_id = c.id"
    const params: any[] = []
    const conditions: string[] = []

    if (clientId) {
      conditions.push(`a.client_id = $${params.length + 1}`)
      params.push(clientId)
    }

    if (upcoming) {
      conditions.push(`a.appointment_date >= $${params.length + 1}`)
      params.push(new Date().toISOString())
    }

    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(" AND ")}`
      query += whereClause
      countQuery += whereClause
    }

    query += ` ORDER BY a.appointment_date ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const [appointmentsResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2)), // Remove limit and offset for count
    ])

    return NextResponse.json({
      appointments: appointmentsResult.rows,
      total: Number.parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(Number.parseInt(countResult.rows[0].count) / limit),
    })
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
  }
}

async function createAppointment(request: NextRequest) {
  try {
    const { clientId, title, description, appointmentDate, durationMinutes } = await request.json()
    console.log(request.json())
    if (!clientId || !title || !appointmentDate) {
      return NextResponse.json({ error: "Client ID, title, and appointment date are required" }, { status: 400 })
    }

    // Verify client exists
    const clientResult = await pool.query("SELECT id FROM clients WHERE id = $1", [clientId])
    if (clientResult.rows.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Create appointment in local database
    const result = await pool.query(
      `INSERT INTO appointments (client_id, title, description, appointment_date, duration_minutes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [clientId, title, description, appointmentDate, durationMinutes || 60],
    )

    const appointment = result.rows[0]

    // Sync with mock API (in background)
    try {
      await mockApiClient.createAppointment({
        clientId,
        title,
        description: description || "",
        date: appointmentDate,
        duration: durationMinutes || 60,
        status: "scheduled",
      })
    } catch (error) {
      console.warn("Failed to sync appointment with mock API:", error)
    }

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
  }
}

export const GET = requireAuth(getAppointments)
export const POST = requireAuth(createAppointment)
