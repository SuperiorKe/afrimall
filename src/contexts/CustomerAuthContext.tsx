'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Customer {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
}

interface CustomerAuthContextType {
  customer: Customer | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
    preferences?: { newsletter?: boolean }
  }) => Promise<boolean>
  logout: () => void
  checkAuth: () => Promise<void>
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined)

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('afrimall_customer_token')
      if (!token) {
        setIsLoading(false)
        return
      }

      // Validate token with server (you might want to create a /api/customers/me endpoint)
      // For now, we'll just check if token exists
      setIsLoading(false)
    } catch (error) {
      console.error('Error checking auth:', error)
      localStorage.removeItem('afrimall_customer_token')
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/ecommerce/customers/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('afrimall_customer_token', data.data.token)
        setCustomer({
          id: data.data.id,
          email: data.data.email,
          firstName: data.data.firstName,
          lastName: data.data.lastName,
          phone: data.data.phone,
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
    preferences?: { newsletter?: boolean }
  }): Promise<boolean> => {
    try {
      const response = await fetch('/api/ecommerce/customers/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        localStorage.setItem('afrimall_customer_token', result.data.token)
        setCustomer({
          id: result.data.id,
          email: result.data.email,
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          phone: result.data.phone,
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('afrimall_customer_token')
    setCustomer(null)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value: CustomerAuthContextType = {
    customer,
    isAuthenticated: !!customer,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
  }

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>
}

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext)
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider')
  }
  return context
}
