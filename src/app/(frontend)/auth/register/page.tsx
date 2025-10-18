import React from 'react'
import { CustomerRegisterForm } from '@/components/forms/CustomerRegisterForm'
import type { Metadata } from 'next'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <CustomerRegisterForm />
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Create Account - Afrimall',
  description: 'Create your Afrimall account to start shopping and track your orders.',
}
