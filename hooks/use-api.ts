"use client"

import { useAuth } from "./use-auth"

export function useApi() {
  const { token } = useAuth()

  const apiCall = async (url: string, options: RequestInit = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "API call failed")
    }

    return response.json()
  }

  return { apiCall }
}
