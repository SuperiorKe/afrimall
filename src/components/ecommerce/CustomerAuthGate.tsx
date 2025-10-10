'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCustomerAuth } from '@/contexts/CustomerAuthContext'

interface CustomerAuthGateProps {
  children: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean
}

export function CustomerAuthGate({
  children,
  redirectTo = '/auth/register',
  requireAuth = true,
}: CustomerAuthGateProps) {
  const { isAuthenticated, isLoading } = useCustomerAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      const currentPath = window.location.pathname
      const searchParams = window.location.search
      const returnUrl = `${currentPath}${searchParams}`

      // Add return URL to redirect path
      const redirectUrl = new URL(redirectTo, window.location.origin)
      redirectUrl.searchParams.set('return', returnUrl)

      router.push(redirectUrl.toString())
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return null
  }

  return <>{children}</>
}
