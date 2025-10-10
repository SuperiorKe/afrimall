'use client'

import React, { useEffect } from 'react'
import { useCustomerAuth } from '@/contexts/CustomerAuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AccountPage() {
  const { customer, isAuthenticated, isLoading } = useCustomerAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?return=/account')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || !customer) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Account</h1>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Customer Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Personal Information
                </h2>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Name:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {customer.firstName} {customer.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Email:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-white">{customer.email}</p>
                  </div>
                  {customer.phone && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Phone:
                      </span>
                      <p className="text-sm text-gray-900 dark:text-white">{customer.phone}</p>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <Link
                    href="/account/edit"
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Edit Profile
                  </Link>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <Link
                    href="/orders"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
                  >
                    View Order History
                  </Link>
                  <Link
                    href="/account/addresses"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
                  >
                    Manage Addresses
                  </Link>
                  <Link
                    href="/account/preferences"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
                  >
                    Account Preferences
                  </Link>
                  <Link
                    href="/"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Recent Orders
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No orders yet.{' '}
                  <Link href="/" className="text-blue-600 hover:text-blue-500">
                    Start shopping
                  </Link>{' '}
                  to see your orders here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
