"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Users, Calendar, Plus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useApi } from "@/hooks/use-api"
import { ClientList } from "./client-list"
import { AppointmentList } from "./appointment-list"
import { AppointmentForm } from "./appointment-form"

interface Client {
  id: string
  name: string
  email: string
  phone: string
}

interface Appointment {
  id: string
  title: string
  description: string
  appointment_date: string
  duration_minutes: number
  status: string
  client_name: string
}

export function Dashboard() {
  const { admin, logout } = useAuth()
  const { apiCall } = useApi()
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const data = await apiCall("/api/clients")
      setClients(data.clients)
    } catch (error) {
      console.error("Failed to fetch clients:", error)
    }
  }

  const handleAppointmentSuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
    setEditingAppointment(null)
    if (activeTab === "schedule") {
      setActiveTab("appointments")
    }
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setActiveTab("schedule")
  }

  const handleCancelEdit = () => {
    setEditingAppointment(null)
    setActiveTab("appointments")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Wellness Platform Admin</h1>
              <p className="text-gray-600">Welcome back, {admin?.name}</p>
            </div>

            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Clients</span>
                      <span className="font-semibold">{clients.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Active Admin</span>
                      <span className="font-semibold">{admin?.name}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <AppointmentList refreshTrigger={refreshTrigger} onEdit={handleEditAppointment} />
            </div>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ClientList onClientSelect={setSelectedClient} selectedClientId={selectedClient?.id} />

              {selectedClient && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Client Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p>
                          <strong>Name:</strong> {selectedClient.name}
                        </p>
                        <p>
                          <strong>Email:</strong> {selectedClient.email}
                        </p>
                        <p>
                          <strong>Phone:</strong> {selectedClient.phone}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <AppointmentList
                    clientId={selectedClient.id}
                    refreshTrigger={refreshTrigger}
                    onEdit={handleEditAppointment}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <AppointmentList refreshTrigger={refreshTrigger} onEdit={handleEditAppointment} />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <AppointmentForm
                clients={clients}
                selectedClientId={selectedClient?.id}
                editingAppointment={editingAppointment}
                onSuccess={handleAppointmentSuccess}
                onCancel={editingAppointment ? handleCancelEdit : undefined}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
