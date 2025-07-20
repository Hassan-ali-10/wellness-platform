import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { requireAuth } from "@/lib/auth"

async function updateAppointment(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { title, description, appointmentDate, durationMinutes, status } = await request.json()
    const { id } = params

    const result = await pool.query(
      `UPDATE appointments 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           appointment_date = COALESCE($3, appointment_date),
           duration_minutes = COALESCE($4, duration_minutes),
           status = COALESCE($5, status)
       WHERE id = $6
       RETURNING *`,
      [title, description, appointmentDate, durationMinutes, status, id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error updating appointment:", error)
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 })
  }
}

async function deleteAppointment(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const result = await pool.query("DELETE FROM appointments WHERE id = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Appointment deleted successfully" })
  } catch (error) {
    console.error("Error deleting appointment:", error)
    return NextResponse.json({ error: "Failed to delete appointment" }, { status: 500 })
  }
}

export const PUT = requireAuth(updateAppointment)
export const DELETE = requireAuth(deleteAppointment)
