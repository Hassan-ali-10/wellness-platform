"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useApi } from "@/hooks/use-api"

interface Client {
  id: string
  name: string
  email: string
}

interface Appointment {
  id?: string
  title: string
  description: string
  appointment_date: string
  duration_minutes: number
  status: string
  client_name?: string
}

interface AppointmentFormProps {
  clients: Client[]
  selectedClientId?: string
  editingAppointment?: Appointment | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function AppointmentForm({
  clients,
  selectedClientId,
  editingAppointment,
  onSuccess,
  onCancel,
}: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    clientId: selectedClientId || "",
    title: "",
    description: "",
    appointmentDate: "",
    appointmentTime: "",
    durationMinutes: 60,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { apiCall } = useApi()

  useEffect(() => {
    if (editingAppointment) {
      const date = new Date(editingAppointment.appointment_date)
      setFormData({
        clientId: selectedClientId || "",
        title: editingAppointment.title,
        description: editingAppointment.description,
        appointmentDate: date.toISOString().split("T")[0],
        appointmentTime: date.toTimeString().slice(0, 5),
        durationMinutes: editingAppointment.duration_minutes,
      })
    }
  }, [editingAppointment, selectedClientId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`)

      const payload = {
        clientId: formData.clientId,
        title: formData.title,
        description: formData.description,
        appointmentDate: appointmentDateTime.toISOString(),
        durationMinutes: formData.durationMinutes,
      }

      if (editingAppointment?.id) {
        await apiCall(`/api/appointments/${editingAppointment.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
      } else {
        await apiCall("/api/appointments", {
          method: "POST",
          body: JSON.stringify(payload),
        })
      }

      // Reset form
      setFormData({
        clientId: selectedClientId || "",
        title: "",
        description: "",
        appointmentDate: "",
        appointmentTime: "",
        durationMinutes: 60,
      })

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save appointment")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      clientId: selectedClientId || "",
      title: "",
      description: "",
      appointmentDate: "",
      appointmentTime: "",
      durationMinutes: 60,
    })
    setError("")
    onCancel?.()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingAppointment ? "Edit Appointment" : "Schedule New Appointment"}</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <Select
              value={formData.clientId}
              onValueChange={(value) => setFormData({ ...formData, clientId: value })}
              disabled={!!selectedClientId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Appointment Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Wellness Consultation"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional notes about the appointment..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.appointmentDate}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.appointmentTime}
                onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Select
              value={formData.durationMinutes.toString()}
              onValueChange={(value) => setFormData({ ...formData, durationMinutes: Number.parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading
                ? editingAppointment
                  ? "Updating..."
                  : "Scheduling..."
                : editingAppointment
                  ? "Update Appointment"
                  : "Schedule Appointment"}
            </Button>

            {(editingAppointment || onCancel) && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
