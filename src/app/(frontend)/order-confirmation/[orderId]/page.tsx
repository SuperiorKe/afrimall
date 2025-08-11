'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Order {
  id: string
  total: number
  status: string
  paymentStatus: string
  customerEmail: string
  orderDate: string
}

export default function OrderConfirmationPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`)

        if (!response.ok) {
          throw new Error('Order not found')
        }

        const data = await response.json()
        setOrder(data.order)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Order Not Found</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8 sm:px-8">
            {/* Success Icon */}
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h1 className="mt-4 text-2xl font-bold text-gray-900">Order Confirmed!</h1>

              <p className="mt-2 text-gray-600">
                Thank you for your purchase. Your order has been successfully placed.
              </p>
            </div>

            {/* Order Details */}
            {order && (
              <div className="mt-8 border-t border-gray-200 pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Order Information</h3>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Order ID</dt>
                        <dd className="text-sm text-gray-900">{order.id}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Order Date</dt>
                        <dd className="text-sm text-gray-900">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Total</dt>
                        <dd className="text-sm text-gray-900">${order.total.toFixed(2)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="text-sm">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {order.status}
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                        <dd className="text-sm">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {order.paymentStatus}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="text-sm text-gray-900">{order.customerEmail}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">What happens next?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• You'll receive an email confirmation shortly</li>
                <li>• We'll notify you when your order ships</li>
                <li>• Track your order status in your account</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
              <Link href="/">
                <Button>Return to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
