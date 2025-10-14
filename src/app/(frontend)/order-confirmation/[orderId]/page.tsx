'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Package, Truck, CreditCard, MapPin, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface OrderItem {
  id: string
  product: {
    id: string
    title: string
    images: Array<{ url: string; alt: string }>
  }
  variant?: {
    title: string
  }
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  currency: string
  items: OrderItem[]
  customer: {
    id: string
    email: string
  }
  shipping: {
    method: string
    cost: number
    address: {
      firstName: string
      lastName: string
      address1: string
      address2?: string
      city: string
      state: string
      postalCode: string
      country: string
    }
  }
  payment: {
    method: string
    status: string
    reference: string
  }
  createdAt: string
}

export default function OrderConfirmationPage() {
  const params = useParams()
  const orderId = params.orderId as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/orders/${orderId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch order')
        }

        const data = await response.json()
        console.log('Order confirmation - API response:', data)

        // Handle different response structures
        const orderData = data.data?.order || data.data || data
        setOrder(orderData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'processing':
        return <Package className="h-5 w-5 text-blue-600" />
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-600" />
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-gray-600" />
      default:
        return <Package className="h-5 w-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <Package className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
            <p className="text-gray-600 mb-6">
              {error || 'The order you are looking for could not be found.'}
            </p>
          </div>
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="text-green-600 mb-4">
          <CheckCircle className="h-16 w-16 mx-auto mb-4" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-gray-600">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
      </div>

      {/* Order Summary Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Order Summary</span>
            <Badge className={getStatusColor(order.status)}>
              <span className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Order Details
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Order Number:</span> {order.orderNumber || order.id}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{' '}
                  {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Total:</span> ${order.total?.toFixed(2) || '0.00'}{' '}
                  {order.currency || 'USD'}
                </p>
                <p>
                  <span className="font-medium">Payment Method:</span>{' '}
                  {order.payment?.method || order.paymentMethod || 'Credit Card'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </h3>
              <div className="text-sm">
                {order.shipping?.address || order.shippingAddress ? (
                  <>
                    <p>
                      {(order.shipping?.address || order.shippingAddress)?.firstName}{' '}
                      {(order.shipping?.address || order.shippingAddress)?.lastName}
                    </p>
                    <p>{(order.shipping?.address || order.shippingAddress)?.address1}</p>
                    {(order.shipping?.address || order.shippingAddress)?.address2 && (
                      <p>{(order.shipping?.address || order.shippingAddress)?.address2}</p>
                    )}
                    <p>
                      {(order.shipping?.address || order.shippingAddress)?.city},{' '}
                      {(order.shipping?.address || order.shippingAddress)?.state}{' '}
                      {(order.shipping?.address || order.shippingAddress)?.postalCode}
                    </p>
                    <p>{(order.shipping?.address || order.shippingAddress)?.country}</p>
                  </>
                ) : (
                  <p className="text-gray-500">Address information not available</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="relative w-16 h-16">
                  <Image
                    src={item.product.images[0]?.url || '/placeholder-product.jpg'}
                    alt={item.product.title}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{item.product.title}</h4>
                  {item.variant && <p className="text-sm text-gray-600">{item.variant.title}</p>}
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${item.unitPrice.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Total: ${item.totalPrice.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>Shipping: {order.shipping?.method || order.shippingMethod || 'Standard'}</p>
              <p>Payment: {order.payment?.status || order.paymentStatus || 'Paid'}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">Total: ${order.total?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-medium">Order Processing</h4>
                <p className="text-sm text-gray-600">
                  We'll review your order and prepare it for shipping.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-medium">Shipping Confirmation</h4>
                <p className="text-sm text-gray-600">
                  You'll receive an email with tracking information once your order ships.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-medium">Delivery</h4>
                <p className="text-sm text-gray-600">
                  Your order will be delivered to the address you provided.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/">
          <Button variant="outline" className="w-full sm:w-auto">
            Continue Shopping
          </Button>
        </Link>
        <Link href="/account/orders">
          <Button className="w-full sm:w-auto">View My Orders</Button>
        </Link>
      </div>

      {/* Contact Support */}
      <div className="text-center mt-8 text-sm text-gray-600">
        <p>Have questions about your order?</p>
        <p>
          Contact our support team at{' '}
          <a href="mailto:support@afrimall.com" className="text-blue-600 hover:underline">
            support@afrimall.com
          </a>
        </p>
      </div>
    </div>
  )
}
