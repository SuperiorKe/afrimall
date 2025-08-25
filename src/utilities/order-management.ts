import { ORDER_STATUSES, type OrderStatus } from '@/utilities/orderUtils'

// Define the structure for each status flow
interface StatusFlow {
  next: OrderStatus[]
  label: string
  description: string
  color: string
  icon: string
}

// Order status flow and transitions
export const ORDER_STATUS_FLOW: Record<OrderStatus, StatusFlow> = {
  [ORDER_STATUSES.PENDING]: {
    next: [ORDER_STATUSES.CONFIRMED, ORDER_STATUSES.CANCELLED],
    label: 'Pending',
    description: 'Order is being reviewed',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '⏳',
  },
  [ORDER_STATUSES.CONFIRMED]: {
    next: [ORDER_STATUSES.PROCESSING, ORDER_STATUSES.CANCELLED],
    label: 'Confirmed',
    description: 'Order has been confirmed and payment received',
    color: 'bg-green-100 text-green-800',
    icon: '✅',
  },
  [ORDER_STATUSES.PROCESSING]: {
    next: [ORDER_STATUSES.SHIPPED, ORDER_STATUSES.CANCELLED],
    label: 'Processing',
    description: 'Order is being prepared for shipping',
    color: 'bg-blue-100 text-blue-800',
    icon: '📦',
  },
  [ORDER_STATUSES.SHIPPED]: {
    next: [ORDER_STATUSES.DELIVERED],
    label: 'Shipped',
    description: 'Order has been shipped and is in transit',
    color: 'bg-purple-100 text-purple-800',
    icon: '🚚',
  },
  [ORDER_STATUSES.DELIVERED]: {
    next: [],
    label: 'Delivered',
    description: 'Order has been successfully delivered',
    color: 'bg-gray-100 text-gray-800',
    icon: '🎉',
  },
  [ORDER_STATUSES.CANCELLED]: {
    next: [],
    label: 'Cancelled',
    description: 'Order has been cancelled',
    color: 'bg-red-100 text-red-800',
    icon: '❌',
  },
  [ORDER_STATUSES.REFUNDED]: {
    next: [],
    label: 'Refunded',
    description: 'Order has been refunded',
    color: 'bg-orange-100 text-orange-800',
    icon: '💰',
  },
}

// Check if a status transition is valid
export function canTransitionTo(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  const currentFlow = ORDER_STATUS_FLOW[currentStatus]
  return currentFlow.next.includes(newStatus)
}

// Get next possible statuses
export function getNextPossibleStatuses(currentStatus: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_FLOW[currentStatus]?.next || []
}

// Get status information
export function getStatusInfo(status: OrderStatus) {
  return (
    ORDER_STATUS_FLOW[status] || {
      label: 'Unknown',
      description: 'Status not recognized',
      color: 'bg-gray-100 text-gray-800',
      icon: '❓',
    }
  )
}

// Calculate estimated delivery date
export function calculateEstimatedDelivery(
  orderDate: Date,
  shippingMethod: string,
  processingDays: number = 1,
): Date {
  const delivery = new Date(orderDate)

  // Add processing days
  delivery.setDate(delivery.getDate() + processingDays)

  // Add shipping days based on method
  switch (shippingMethod) {
    case 'standard':
      delivery.setDate(delivery.getDate() + 5) // 5-7 business days
      break
    case 'express':
      delivery.setDate(delivery.getDate() + 2) // 2-3 business days
      break
    case 'overnight':
      delivery.setDate(delivery.getDate() + 1) // Next business day
      break
    case 'pickup':
      delivery.setDate(delivery.getDate() + 0) // Same day pickup
      break
    default:
      delivery.setDate(delivery.getDate() + 5) // Default to standard
  }

  return delivery
}

// Format order number for display
export function formatOrderNumber(orderNumber: string): string {
  // Add spaces for better readability: AFM-20241222-ABC123 -> AFM-2024 12 22-ABC 123
  if (orderNumber.startsWith('AFM-')) {
    const parts = orderNumber.split('-')
    if (parts.length === 3) {
      const date = parts[1]
      const random = parts[2]

      if (date.length === 8) {
        const year = date.slice(0, 4)
        const month = date.slice(4, 6)
        const day = date.slice(6, 8)

        return `AFM-${year} ${month} ${day}-${random.slice(0, 3)} ${random.slice(3)}`
      }
    }
  }

  return orderNumber
}

// Generate tracking number
export function generateTrackingNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substr(2, 8).toUpperCase()
  return `TRK-${timestamp}-${random}`
}

// Validate tracking number format
export function isValidTrackingNumber(trackingNumber: string): boolean {
  const trackingRegex = /^TRK-[A-Z0-9]+-[A-Z0-9]+$/
  return trackingRegex.test(trackingNumber)
}

// Calculate order totals
export function calculateOrderTotals(
  items: Array<{ unitPrice: number; quantity: number }>,
  shippingCost: number = 0,
  taxRate: number = 0.1,
) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const tax = subtotal * taxRate
  const total = subtotal + shippingCost + tax

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    shipping: Math.round(shippingCost * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
  }
}

// Get shipping cost by method
export function getShippingCost(shippingMethod: string): number {
  switch (shippingMethod) {
    case 'standard':
      return 9.99
    case 'express':
      return 19.99
    case 'overnight':
      return 39.99
    case 'pickup':
      return 0
    default:
      return 9.99
  }
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

// Get order timeline
export function getOrderTimeline(orderDate: Date, status: OrderStatus, shippingMethod?: string) {
  const timeline = [
    {
      date: orderDate,
      status: 'Order Placed',
      description: 'Your order has been placed successfully',
      icon: '📝',
    },
  ]

  if (status !== ORDER_STATUSES.CANCELLED) {
    timeline.push({
      date: new Date(orderDate.getTime() + 24 * 60 * 60 * 1000), // +1 day
      status: 'Order Confirmed',
      description: 'Order has been confirmed and payment received',
      icon: '✅',
    })

    if (['processing', 'shipped', 'delivered'].includes(status)) {
      timeline.push({
        date: new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000), // +2 days
        status: 'Processing',
        description: 'Order is being prepared for shipping',
        icon: '📦',
      })
    }

    if (['shipped', 'delivered'].includes(status)) {
      const estimatedShipping = calculateEstimatedDelivery(
        orderDate,
        shippingMethod || 'standard',
        2,
      )
      timeline.push({
        date: estimatedShipping,
        status: 'Shipped',
        description: 'Order has been shipped and is in transit',
        icon: '🚚',
      })
    }

    if (status === ORDER_STATUSES.DELIVERED) {
      const estimatedDelivery = calculateEstimatedDelivery(
        orderDate,
        shippingMethod || 'standard',
        2,
      )
      timeline.push({
        date: estimatedDelivery,
        status: 'Delivered',
        description: 'Order has been successfully delivered',
        icon: '🎉',
      })
    }
  }

  return timeline
}
