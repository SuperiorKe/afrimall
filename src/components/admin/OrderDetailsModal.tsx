'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  X,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  DollarSign,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  customer: {
    id: string
    email: string
    firstName: string
    lastName: string
    phone?: string
  }
  status: string
  paymentStatus: string
  shippingStatus: string
  total: number
  currency: string
  createdAt: string
  items: Array<{
    product: {
      id: string
      title: string
      sku: string
      image?: string
    }
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  shipping: {
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
    method: string
    cost: number
    trackingNumber?: string
    estimatedDelivery?: string
    shippedAt?: string
    deliveredAt?: string
  }
  billing: {
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
    reference?: string
    refundAmount?: number
    refundReason?: string
    refundStatus?: string
  }
  customerNotes?: string
  adminNotes?: string
  notes?: Array<{
    id: string
    type: string
    content: string
    author: string
    createdAt: string
    isVisibleToCustomer: boolean
  }>
}

interface OrderDetailsModalProps {
  orderId: string | null
  isOpen: boolean
  onClose: () => void
  onOrderUpdate?: () => void
}

const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-800' },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-800' },
}

const PAYMENT_STATUSES = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-800' },
  partially_refunded: { label: 'Partially Refunded', color: 'bg-orange-100 text-orange-800' },
}

export default function OrderDetailsModal({
  orderId,
  isOpen,
  onClose,
  onOrderUpdate,
}: OrderDetailsModalProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [editing, setEditing] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [noteType, setNoteType] = useState('internal')
  const [isVisibleToCustomer, setIsVisibleToCustomer] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')

  // Fetch order details
  const fetchOrderDetails = async () => {
    if (!orderId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/ecommerce/orders/${orderId}`)
      const data = await response.json()

      if (data.success) {
        setOrder(data.data.order)
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
    } finally {
      setLoading(false)
    }
  }

  // Update order status
  const updateOrderStatus = async (status: string, additionalData: any = {}) => {
    if (!order) return

    try {
      const response = await fetch(`/api/ecommerce/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          ...additionalData,
        }),
      })

      const result = await response.json()
      if (result.success) {
        fetchOrderDetails()
        onOrderUpdate?.()
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  // Add note
  const addNote = async () => {
    if (!order || !newNote.trim()) return

    try {
      const response = await fetch(`/api/ecommerce/orders/${order.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: noteType,
          content: newNote.trim(),
          author: 'admin',
          isVisibleToCustomer,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setNewNote('')
        setNoteType('internal')
        setIsVisibleToCustomer(false)
        fetchOrderDetails()
      }
    } catch (error) {
      console.error('Error adding note:', error)
    }
  }

  // Process refund
  const processRefund = async () => {
    if (!order || !refundAmount || !refundReason) return

    try {
      const response = await fetch(`/api/ecommerce/orders/${order.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refundAmount: parseFloat(refundAmount),
          refundReason: refundReason.trim(),
          refundType: 'partial',
          notifyCustomer: true,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setRefundAmount('')
        setRefundReason('')
        fetchOrderDetails()
        onOrderUpdate?.()
        alert('Refund processed successfully')
      }
    } catch (error) {
      console.error('Error processing refund:', error)
    }
  }

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Get status badge
  const getStatusBadge = (status: string, type: 'order' | 'payment' = 'order') => {
    const statusConfig =
      type === 'order'
        ? ORDER_STATUSES[status as keyof typeof ORDER_STATUSES]
        : PAYMENT_STATUSES[status as keyof typeof PAYMENT_STATUSES]
    if (!statusConfig) return null

    return <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
  }

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails()
    }
  }, [isOpen, orderId])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">
              {order ? `Order ${order.orderNumber}` : 'Order Details'}
            </h2>
            <p className="text-gray-600">{order ? formatDate(order.createdAt) : 'Loading...'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setEditing(!editing)}>
              <Edit className="w-4 h-4 mr-2" />
              {editing ? 'Cancel' : 'Edit'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading order details...</p>
          </div>
        ) : order ? (
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="items">Items</TabsTrigger>
                <TabsTrigger value="shipping">Shipping</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Order Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Order Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Order Status</label>
                        <div className="mt-1">
                          {editing ? (
                            <Select
                              value={order.status}
                              onValueChange={(value) => updateOrderStatus(value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(ORDER_STATUSES).map(([value, config]) => (
                                  <SelectItem key={value} value={value}>
                                    {config.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            getStatusBadge(order.status, 'order')
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Payment Status</label>
                        <div className="mt-1">{getStatusBadge(order.paymentStatus, 'payment')}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Total Amount</label>
                        <div className="mt-1 text-lg font-semibold">
                          {formatCurrency(order.total, order.currency)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Name</label>
                        <p className="mt-1">
                          {order.customer.firstName} {order.customer.lastName}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <p className="mt-1">{order.customer.email}</p>
                      </div>
                      {order.customer.phone && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Phone</label>
                          <p className="mt-1">{order.customer.phone}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Payment Method</label>
                        <p className="mt-1 capitalize">{order.payment.method.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Payment Status</label>
                        <div className="mt-1">{getStatusBadge(order.paymentStatus, 'payment')}</div>
                      </div>
                      {order.payment.reference && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Reference</label>
                          <p className="mt-1 font-mono text-sm">{order.payment.reference}</p>
                        </div>
                      )}
                    </div>

                    {/* Refund Section */}
                    {order.paymentStatus === 'paid' && order.status !== 'refunded' && (
                      <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium mb-3">Process Refund</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Refund Amount
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              value={refundAmount}
                              onChange={(e) => setRefundAmount(e.target.value)}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Reason</label>
                            <Input
                              value={refundReason}
                              onChange={(e) => setRefundReason(e.target.value)}
                              placeholder="Refund reason"
                            />
                          </div>
                        </div>
                        <Button
                          className="mt-3"
                          onClick={processRefund}
                          disabled={!refundAmount || !refundReason}
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Process Refund
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="items" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            {item.product.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Package className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product.title}</h4>
                            <p className="text-sm text-gray-600">SKU: {item.product.sku}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {item.quantity} × {formatCurrency(item.unitPrice, order.currency)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Total: {formatCurrency(item.totalPrice, order.currency)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shipping" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      Shipping Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Shipping Address</h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            {order.shipping.address.firstName} {order.shipping.address.lastName}
                          </p>
                          <p>{order.shipping.address.address1}</p>
                          {order.shipping.address.address2 && (
                            <p>{order.shipping.address.address2}</p>
                          )}
                          <p>
                            {order.shipping.address.city}, {order.shipping.address.state}{' '}
                            {order.shipping.address.postalCode}
                          </p>
                          <p>{order.shipping.address.country}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Shipping Details</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Method:</span> {order.shipping.method}
                          </div>
                          <div>
                            <span className="font-medium">Cost:</span>{' '}
                            {formatCurrency(order.shipping.cost, order.currency)}
                          </div>
                          {order.shipping.trackingNumber && (
                            <div>
                              <span className="font-medium">Tracking:</span>{' '}
                              {order.shipping.trackingNumber}
                            </div>
                          )}
                          {order.shipping.estimatedDelivery && (
                            <div>
                              <span className="font-medium">Estimated Delivery:</span>{' '}
                              {formatDate(order.shipping.estimatedDelivery)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Order Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Add Note Form */}
                    <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                      <h4 className="font-medium mb-3">Add Note</h4>
                      <div className="space-y-3">
                        <Textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Enter note content..."
                          rows={3}
                        />
                        <div className="flex gap-4">
                          <Select value={noteType} onValueChange={setNoteType}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="internal">Internal</SelectItem>
                              <SelectItem value="customer">Customer</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                          </Select>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isVisibleToCustomer}
                              onChange={(e) => setIsVisibleToCustomer(e.target.checked)}
                            />
                            <span className="text-sm">Visible to customer</span>
                          </label>
                        </div>
                        <Button onClick={addNote} disabled={!newNote.trim()}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Note
                        </Button>
                      </div>
                    </div>

                    {/* Notes List */}
                    <div className="space-y-4">
                      {order.notes && order.notes.length > 0 ? (
                        order.notes.map((note) => (
                          <div key={note.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={note.type === 'internal' ? 'secondary' : 'default'}>
                                  {note.type}
                                </Badge>
                                <span className="text-sm text-gray-600">by {note.author}</span>
                                {note.isVisibleToCustomer && (
                                  <Badge variant="outline" className="text-xs">
                                    Customer Visible
                                  </Badge>
                                )}
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDate(note.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm">{note.content}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-8">No notes yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Order not found</p>
          </div>
        )}
      </div>
    </div>
  )
}
