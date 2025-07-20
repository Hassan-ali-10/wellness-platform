"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { LoginForm } from "@/components/login-form"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  const { admin, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return admin ? <Dashboard /> : <LoginForm />
}
