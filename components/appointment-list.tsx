"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Edit, Trash2 } from "lucide-react"
import { useApi } from "@/hooks/use-api"

interface Appointment {
  id: string
  title: string
  description: string
  appointment_date: string
  duration_minutes: number
  status: string
  client_name: string
  client_email: string
}

interface AppointmentListProps {
  clientId?: string
  onEdit?: (appointment: Appointment) => void
  refreshTrigger?: number
}

export function AppointmentList({ clientId, onEdit, refreshTrigger }: AppointmentListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const { apiCall } = useApi()

  const fetchAppointments = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (clientId) params.append("clientId", clientId)
      params.append("upcoming", "true")

      const data = await apiCall(`/api/appointments?${params}`)
      setAppointments(data.appointments)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch appointments")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [clientId, refreshTrigger])

  const handleDelete = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return
    }

    try {
      await apiCall(`/api/appointments/${appointmentId}`, {
        method: "DELETE",
      })

      setAppointments(appointments.filter((apt) => apt.id !== appointmentId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel appointment")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading appointments...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {clientId ? "Client Appointments" : "Upcoming Appointments"} ({appointments.length})
        </CardTitle>
      </CardHeader>

      <CardContent>
        {error && <div className="text-red-600 mb-4 p-3 bg-red-50 rounded-md">{error}</div>}

        <div className="space-y-3">
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {clientId ? "No appointments found for this client." : "No upcoming appointments."}
            </div>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment.id} className="p-4 border rounded-lg hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{appointment.title}</h3>
                      <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                    </div>

                    {!clientId && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        {appointment.client_name} ({appointment.client_email})
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {new Date(appointment.appointment_date).toLocaleDateString()}
                      <Clock className="h-4 w-4 ml-2" />
                      {new Date(appointment.appointment_date).toLocaleTimeString()}({appointment.duration_minutes} min)
                    </div>

                    {appointment.description && <p className="text-sm text-gray-600">{appointment.description}</p>}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {onEdit && (
                      <Button variant="outline" size="sm" onClick={() => onEdit(appointment)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(appointment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
