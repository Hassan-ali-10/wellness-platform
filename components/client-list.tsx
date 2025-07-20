"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Phone, Mail, Calendar } from "lucide-react"
import { useApi } from "@/hooks/use-api"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  created_at: string
}

interface ClientListProps {
  onClientSelect?: (client: Client) => void
  selectedClientId?: string
}

export function ClientList({ onClientSelect, selectedClientId }: ClientListProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const { apiCall } = useApi()

  const fetchClients = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (search) params.append("search", search)

      const data = await apiCall(`/api/clients?${params}`)
      setClients(data.clients)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch clients")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchClients()
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading clients...</div>
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
          Clients ({clients.length})
        </CardTitle>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search clients by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
      </CardHeader>

      <CardContent>
        {error && <div className="text-red-600 mb-4 p-3 bg-red-50 rounded-md">{error}</div>}

        <div className="space-y-3">
          {clients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {search ? "No clients found matching your search." : "No clients found."}
            </div>
          ) : (
            clients.map((client) => (
              <div
                key={client.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedClientId === client.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => onClientSelect?.(client)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium text-gray-900">{client.name}</h3>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      {client.email}
                    </div>

                    {client.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        {client.phone}
                      </div>
                    )}
                  </div>

                  <Badge variant="secondary">{new Date(client.created_at).toLocaleDateString()}</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
