const MOCK_API_BASE_URL = process.env.MOCK_API_BASE_URL || "https://mock.api"

export interface MockClient {
  id: string
  name: string
  email: string
  phone: string
}

export interface MockAppointment {
  id: string
  clientId: string
  title: string
  description: string
  date: string
  duration: number
  status: string
}

export class MockApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = MOCK_API_BASE_URL
  }

  async fetchClients(): Promise<MockClient[]> {
    try {
      const response = await fetch(`${this.baseUrl}/clients`, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching clients from mock API:", error)
      // Return fallback data if mock API is unavailable
      return [
        { id: "mock_1", name: "John Doe", email: "john@example.com", phone: "+1-555-0101" },
        { id: "mock_2", name: "Jane Smith", email: "jane@example.com", phone: "+1-555-0102" },
      ]
    }
  }

  async fetchAppointments(): Promise<MockAppointment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/appointments`, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching appointments from mock API:", error)
      return []
    }
  }

  async createAppointment(appointment: Omit<MockAppointment, "id">): Promise<MockAppointment> {
    try {
      const response = await fetch(`${this.baseUrl}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointment),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error creating appointment in mock API:", error)
      // Return mock response if API is unavailable
      return {
        id: `mock_${Date.now()}`,
        ...appointment,
      }
    }
  }
}

export const mockApiClient = new MockApiClient()
