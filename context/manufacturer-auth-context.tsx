"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"

interface Manufacturer {
  id: string
  email: string
  companyName: string
  phone: string
}

interface AuthContextType {
  manufacturer: Manufacturer | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, companyName: string, phone: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function ManufacturerAuthProvider({ children }: { children: ReactNode }) {
  const [manufacturer, setManufacturer] = useState<Manufacturer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        // TODO: Replace with actual API call
        const session = localStorage.getItem("manufacturerSession")
        if (session) {
          setManufacturer(JSON.parse(session))
        }
      } catch (err) {
        console.error("Session check failed:", err)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // TODO: Replace with actual API call
      if (email === "test@example.com" && password === "password") {
        const mockManufacturer = {
          id: "1",
          email,
          companyName: "Example Tombstone Co.",
          phone: "1234567890"
        }
        setManufacturer(mockManufacturer)
        localStorage.setItem("manufacturerSession", JSON.stringify(mockManufacturer))
        router.push("/manufacturer/dashboard")
      } else {
        throw new Error("Invalid email or password")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      localStorage.removeItem("manufacturerSession")
      setManufacturer(null)
      router.push("/login/manufacturer")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, companyName: string, phone: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // TODO: Replace with actual API call
      const mockManufacturer = {
        id: "1",
        email,
        companyName,
        phone
      }
      setManufacturer(mockManufacturer)
      localStorage.setItem("manufacturerSession", JSON.stringify(mockManufacturer))
      router.push("/manufacturer/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ manufacturer, loading, error, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useManufacturerAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useManufacturerAuth must be used within a ManufacturerAuthProvider")
  }
  return context
} 