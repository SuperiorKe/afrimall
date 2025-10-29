'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { OrderStatusBadge } from './OrderStatusBadge'
import { ChevronRight } from 'lucide-react'

interface OrderItem {
  id: string
  product: {
    id: string
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
  total: number
  currency?: string
  items: OrderItem[]
  createdAt: string
}

interface OrderHistoryCardProps {
  order: Order
}

export function OrderHistoryCard({ order }: OrderHistoryCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const itemsCount = order.items?.length || 0
  const firstItem = order.items?.[0]

  return (
    <Card className="hover:shadow-md transition-shadow">
      <Link href={`/account/orders/${order.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">Order {order.orderNumber}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <OrderStatusBadge status={order.status} />
              <div className="text-right">
                <p className="font-semibold text-lg">
                  {formatCurrency(order.total, order.currency)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {itemsCount} item{itemsCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {firstItem && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {firstItem.productSnapshot?.title || firstItem.product?.title || 'Product'}
                </p>
                {itemsCount > 1 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    +{itemsCount - 1} more item{itemsCount - 1 !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

            {order.paymentStatus && order.paymentStatus !== 'paid' && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Payment:{' '}
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
