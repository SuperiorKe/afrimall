'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [customerData, setCustomerData] = useState<any>(null)

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setStatus('error')
        setMessage('No verification token provided.')
        return
      }

      try {
        const response = await fetch('/api/ecommerce/customers/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (data.success) {
          setStatus('success')
          setMessage('Your email has been verified successfully!')
          setCustomerData(data.data)

          // Auto-redirect to login page after 3 seconds
          setTimeout(() => {
            router.push('/auth/login?verified=true')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.message || 'Verification failed. The token may be invalid or expired.')
        }
      } catch (error) {
        setStatus('error')
        setMessage('An error occurred during verification. Please try again.')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Email Verification
          </h2>
        </div>

        <div className="mt-8 space-y-6">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Verifying your email address...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-green-800 dark:text-green-200">
                    Verification Successful!
                  </h3>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-300">{message}</p>
                  {customerData && (
                    <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                      Welcome, {customerData.firstName}! You can now log in to your account.
                    </p>
                  )}
                  <p className="mt-4 text-sm text-green-600 dark:text-green-400">
                    Redirecting to login page in a few seconds...
                  </p>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                    Verification Failed
                  </h3>
                  <p className="mt-2 text-sm text-red-700 dark:text-red-300">{message}</p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center space-y-4">
            <Link
              href="/auth/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Login
            </Link>

            <div>
              <Link
                href="/auth/register"
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Create a new account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading verification page...
            </p>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
