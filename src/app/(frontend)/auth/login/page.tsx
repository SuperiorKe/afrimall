import React from 'react'
import { CustomerLoginForm } from '@/components/forms/CustomerLoginForm'
import type { Metadata } from 'next'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link
              href="/auth/register"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              create a new account
            </Link>
          </p>
        </div>

        <CustomerLoginForm />
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Sign In - Afrimall',
  description: 'Sign in to your Afrimall account to access your orders and preferences.',
}
