'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCustomerAuth } from '@/contexts/CustomerAuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { Separator } from '@/components/ui/separator'
import {
  Package,
  CheckCircle,
  Truck,
  CreditCard,
  MapPin,
  User,
  ArrowLeft,
  Download,
  RefreshCw,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface OrderItem {
  id: string
  product: {
    id: string
    title: string
    images?: Array<{ url: string; alt: string }>
  }
  variant?: {
    title: string
  }
  quantity: number
  unitPrice: number
  totalPrice: number
  productSnapshot?: {
    title: string
    sku?: string
    image?: any
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus?: string
  paymentMethod?: string
  total: number
  subtotal?: number
  currency?: string
  items: OrderItem[]
  shipping?: {
    method?: string
    cost?: number
    address?: {
      firstName: string
      lastName: string
      address1: string
      address2?: string
      city: string
      state: string
      postalCode: string
      country: string
      phone?: string
    }
    trackingNumber?: string
    estimatedDelivery?: string
  }
  billing?: {
    address?: {
      firstName: string
      lastName: string
      address1: string
      address2?: string
      city: string
      state: string
      postalCode: string
      country: string
      phone?: string
    }
  }
  tax?: {
    amount?: number
    rate?: number
  }
  createdAt: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string
  const { customer, isAuthenticated, isLoading: authLoading } = useCustomerAuth()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/auth/login?return=/account/orders/${orderId}`)
    }
  }, [authLoading, isAuthenticated, router, orderId])

  useEffect(() => {
    if (isAuthenticated && orderId) {
      fetchOrder()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, orderId])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('afrimall_customer_token')

      const response = await fetch(`/api/ecommerce/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found')
        }
        if (response.status === 403) {
          throw new Error('You do not have permission to view this order')
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch order')
      }

      const data = await response.json()

      if (data.success && data.data) {
        const orderData = data.data.order || data.data
        // Verify the order belongs to the authenticated customer
        if (
          customer &&
          orderData.customer?.id !== customer.id &&
          typeof orderData.customer === 'object' &&
          orderData.customer?.id
        ) {
          throw new Error('You do not have permission to view this order')
        }
        setOrder(orderData)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order')
      console.error('Error fetching order:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading order details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <Package className="h-16 w-16 mx-auto text-red-400 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {error || 'The order you are looking for could not be found.'}
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/account/orders">
                    <Button variant="outline">View All Orders</Button>
                  </Link>
                  <Link href="/">
                    <Button>Continue Shopping</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const shipping = order.shipping
  const billing = order.billing
  const subtotal = order.subtotal || order.items.reduce((sum, item) => sum + item.totalPrice, 0)
  const shippingCost = shipping?.cost || 0
  const taxAmount = order.tax?.amount || 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/account/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
        </div>

        {/* Order Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Order {order.orderNumber}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={
                            item.productSnapshot?.image?.url ||
                            item.product?.images?.[0]?.url ||
                            '/placeholder-product.jpg'
                          }
                          alt={item.productSnapshot?.title || item.product?.title || 'Product'}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {item.productSnapshot?.title || item.product?.title || 'Product'}
                        </h4>
                        {item.variant && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.variant.title}
                          </p>
                        )}
                        {item.productSnapshot?.sku && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            SKU: {item.productSnapshot.sku}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(item.unitPrice, order.currency)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Total: {formatCurrency(item.totalPrice, order.currency)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            {shipping?.address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p className="font-medium">
                      {shipping.address.firstName} {shipping.address.lastName}
                    </p>
                    <p>{shipping.address.address1}</p>
                    {shipping.address.address2 && <p>{shipping.address.address2}</p>}
                    <p>
                      {shipping.address.city}, {shipping.address.state}{' '}
                      {shipping.address.postalCode}
                    </p>
                    <p>{shipping.address.country}</p>
                    {shipping.address.phone && (
                      <p className="mt-2">Phone: {shipping.address.phone}</p>
                    )}
                    {shipping.trackingNumber && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="font-medium">Tracking Number:</p>
                        <p className="text-blue-600 dark:text-blue-400">
                          {shipping.trackingNumber}
                        </p>
                      </div>
                    )}
                    {shipping.estimatedDelivery && (
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Estimated Delivery:{' '}
                        {new Date(shipping.estimatedDelivery).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span>{formatCurrency(subtotal, order.currency)}</span>
                  </div>
                  {shippingCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                      <span>{formatCurrency(shippingCost, order.currency)}</span>
                    </div>
                  )}
                  {taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Tax</span>
                      <span>{formatCurrency(taxAmount, order.currency)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(order.total, order.currency)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                    <p className="font-medium">
                      {order.paymentMethod
                        ? order.paymentMethod.charAt(0).toUpperCase() +
                          order.paymentMethod.slice(1).replace('_', ' ')
                        : 'Credit Card'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Payment Status:</span>
                    <p className="font-medium">
                      {order.paymentStatus
                        ? order.paymentStatus.charAt(0).toUpperCase() +
                          order.paymentStatus.slice(1).replace('_', ' ')
                        : 'Pending'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" onClick={() => window.print()}>
                    <Download className="h-4 w-4 mr-2" />
                    Print Invoice
                  </Button>
                  {(order.status === 'pending' || order.status === 'confirmed') && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        // TODO: Implement cancel order functionality
                        alert('Cancel order functionality coming soon')
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Cancel Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
