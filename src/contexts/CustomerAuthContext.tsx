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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
    preferences?: { newsletter?: boolean }
  }) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>
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

      // Validate token with server
      const response = await fetch('/api/ecommerce/customers/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        setCustomer({
          id: data.data.id,
          email: data.data.email,
          firstName: data.data.firstName,
          lastName: data.data.lastName,
          phone: data.data.phone,
        })
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('afrimall_customer_token')
        setCustomer(null)
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      localStorage.removeItem('afrimall_customer_token')
      setCustomer(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
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
        return { success: true }
      } else {
        return {
          success: false,
          error: data.message || 'Login failed. Please check your credentials.',
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.',
      }
    }
  }

  const register = async (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
    preferences?: { newsletter?: boolean }
  }): Promise<{ success: boolean; error?: string; needsVerification?: boolean }> => {
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
        // Check if account needs verification
        if (result.data.needsVerification) {
          return {
            success: true,
            needsVerification: true,
            error: 'Please check your email to verify your account before logging in.',
          }
        }

        // Account is verified, log them in automatically
        localStorage.setItem('afrimall_customer_token', result.data.token)
        setCustomer({
          id: result.data.id,
          email: result.data.email,
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          phone: result.data.phone,
        })
        return { success: true }
      } else {
        return {
          success: false,
          error: result.message || 'Registration failed. Please try again.',
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.',
      }
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('afrimall_customer_token')

      if (token) {
        // Call logout endpoint for server-side cleanup
        await fetch('/api/ecommerce/customers/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      }
    } catch (error) {
      console.error('Error during logout:', error)
      // Continue with client-side cleanup even if server call fails
    } finally {
      // Always clean up client-side state
      localStorage.removeItem('afrimall_customer_token')
      setCustomer(null)
    }
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
