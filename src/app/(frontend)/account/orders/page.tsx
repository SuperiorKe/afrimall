'use client'

import { useEffect, useState } from 'react'
import { useCustomerAuth } from '@/contexts/CustomerAuthContext'
import { useRouter } from 'next/navigation'
import { OrderHistoryCard } from '@/components/orders/OrderHistoryCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Package, Filter } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus?: string
  total: number
  currency?: string
  items: any[]
  createdAt: string
}

export default function OrdersPage() {
  const { customer, isAuthenticated, isLoading: authLoading } = useCustomerAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPrevPage, setHasPrevPage] = useState(false)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?return=/account/orders')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && customer) {
      fetchOrders()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer?.id, isAuthenticated, statusFilter, page])

  const fetchOrders = async () => {
    if (!customer?.id) return

    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('afrimall_customer_token')
      const params = new URLSearchParams({
        customerId: customer.id,
        page: page.toString(),
        limit: '10',
      })

      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/ecommerce/orders?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch orders')
      }

      const data = await response.json()

      if (data.success && data.data) {
        setOrders(data.data.orders || [])
        setHasNextPage(data.data.hasNextPage || false)
        setHasPrevPage(data.data.hasPrevPage || false)
        setTotalPages(data.data.totalPages || 1)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const statusFilters = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Orders</h1>
          <p className="text-gray-600 dark:text-gray-400">View and track all your orders</p>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by status:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setStatusFilter(filter.value)
                  setPage(1)
                }}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <p className="text-red-800 dark:text-red-200">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchOrders} className="mt-4">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Orders List */}
        {!error && (
          <>
            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No orders found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {statusFilter === 'all'
                      ? "You haven't placed any orders yet."
                      : `No ${statusFilter} orders found.`}
                  </p>
                  <Button onClick={() => router.push('/')}>Start Shopping</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <OrderHistoryCard key={order.id} order={order} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {orders.length > 0 && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!hasPrevPage || page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={!hasNextPage || page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
