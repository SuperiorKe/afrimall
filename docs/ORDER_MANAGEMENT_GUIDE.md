# Order Management System Guide

## Overview

The AfriMall Order Management System provides comprehensive tools for managing customer orders, processing payments, handling shipping, and tracking order fulfillment. This guide covers all aspects of the order management workflow.

## Table of Contents

1. [Order Lifecycle](#order-lifecycle)
2. [API Endpoints](#api-endpoints)
3. [Order Status Management](#order-status-management)
4. [Payment Processing](#payment-processing)
5. [Shipping & Tracking](#shipping--tracking)
6. [Refund Processing](#refund-processing)
7. [Bulk Operations](#bulk-operations)
8. [Order Notes System](#order-notes-system)
9. [Admin Dashboard](#admin-dashboard)
10. [Best Practices](#best-practices)

## Order Lifecycle

### Order States

```
Pending → Confirmed → Processing → Shipped → Delivered
    ↓         ↓           ↓          ↓
Cancelled  Cancelled  Cancelled  Refunded
```

### Status Definitions

- **Pending**: Order created, payment not yet processed
- **Confirmed**: Payment successful, order confirmed
- **Processing**: Order being prepared for shipment
- **Shipped**: Order dispatched with tracking information
- **Delivered**: Order successfully delivered to customer
- **Cancelled**: Order cancelled (before shipping)
- **Refunded**: Order refunded (after delivery)

## API Endpoints

### Core Order Endpoints

#### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "items": [
    {
      "product": "product_id",
      "quantity": 2,
      "unitPrice": 29.99
    }
  ],
  "total": 59.98,
  "currency": "USD",
  "customer": "customer_id",
  "shippingAddress": { ... },
  "billingAddress": { ... },
  "paymentMethod": "credit_card"
}
```

#### Get Orders
```http
GET /api/orders?status=confirmed&page=1&limit=20
```

#### Get Order Details
```http
GET /api/orders/{orderId}
```

#### Update Order
```http
PATCH /api/orders/{orderId}
Content-Type: application/json

{
  "status": "shipped",
  "trackingNumber": "TRK123456789",
  "estimatedDelivery": "2024-01-15"
}
```

#### Cancel Order
```http
DELETE /api/orders/{orderId}
```

### Refund Endpoints

#### Process Refund
```http
POST /api/orders/{orderId}/refund
Content-Type: application/json

{
  "refundAmount": 29.99,
  "refundReason": "Customer requested return",
  "refundType": "partial",
  "notifyCustomer": true
}
```

#### Get Refund Information
```http
GET /api/orders/{orderId}/refund
```

### Bulk Operations

#### Bulk Order Updates
```http
POST /api/orders/bulk
Content-Type: application/json

{
  "operation": "mark_shipped",
  "orderIds": ["order1", "order2", "order3"],
  "data": {
    "trackingNumber": "TRK123456789"
  },
  "notifyCustomers": true
}
```

**Supported Operations:**
- `mark_processing`: Mark orders as processing
- `mark_shipped`: Mark orders as shipped
- `mark_delivered`: Mark orders as delivered
- `cancel_orders`: Cancel multiple orders
- `add_tracking`: Add tracking numbers
- `update_notes`: Update order notes

### Order Notes

#### Add Note
```http
POST /api/orders/{orderId}/notes
Content-Type: application/json

{
  "type": "internal",
  "content": "Customer called about delivery",
  "author": "admin",
  "isVisibleToCustomer": false
}
```

#### Get Notes
```http
GET /api/orders/{orderId}/notes?type=internal&includeInternal=true
```

#### Update Note
```http
PUT /api/orders/{orderId}/notes
Content-Type: application/json

{
  "noteId": "note_id",
  "content": "Updated note content",
  "isVisibleToCustomer": true
}
```

#### Delete Note
```http
DELETE /api/orders/{orderId}/notes?noteId=note_id
```

## Order Status Management

### Status Transitions

The system enforces valid status transitions to maintain data integrity:

```typescript
const validTransitions = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['refunded'],
  cancelled: [], // Terminal state
  refunded: []   // Terminal state
}
```

### Automatic Actions

- **Status Change to Shipped**: Automatically generates tracking number if not provided
- **Status Change to Cancelled**: Restores inventory for all items
- **Status Change to Delivered**: Updates delivery timestamp
- **Any Status Change**: Sends email notification to customer

## Payment Processing

### Payment Statuses

- **Pending**: Payment not yet processed
- **Paid**: Payment successful
- **Failed**: Payment failed
- **Refunded**: Full refund processed
- **Partially Refunded**: Partial refund processed

### Stripe Integration

The system integrates with Stripe for payment processing:

```typescript
// Process refund through Stripe
const refund = await stripe.refunds.create({
  payment_intent: order.payment.stripePaymentIntentId,
  amount: Math.round(refundAmount * 100), // Convert to cents
  reason: 'requested_by_customer',
  metadata: {
    orderId: order.id,
    orderNumber: order.orderNumber,
    reason: refundReason
  }
})
```

## Shipping & Tracking

### Tracking Number Generation

Automatic tracking number generation:
```typescript
// Format: TRK + timestamp + random
// Example: TRK1234567890123
```

### Shipping Statuses

- **Pending**: Shipping not yet initiated
- **Processing**: Preparing for shipment
- **Shipped**: Package dispatched
- **In Transit**: Package in transit
- **Out for Delivery**: Package out for delivery
- **Delivered**: Package delivered
- **Failed Delivery**: Delivery failed
- **Returned**: Package returned

## Refund Processing

### Refund Types

1. **Full Refund**: Complete order refund
2. **Partial Refund**: Partial amount refund

### Refund Workflow

1. Validate refund amount (cannot exceed order total)
2. Process refund through Stripe
3. Update order payment status
4. Send email notification to customer
5. Log refund details

### Refund Validation

```typescript
const maxRefundAmount = order.total - (order.payment?.refundAmount || 0)
if (refundAmount > maxRefundAmount) {
  throw new Error('Refund amount exceeds available amount')
}
```

## Bulk Operations

### Supported Operations

#### Mark as Shipped
```json
{
  "operation": "mark_shipped",
  "orderIds": ["order1", "order2"],
  "data": {
    "trackingNumber": "TRK123456789",
    "estimatedDelivery": "2024-01-15"
  }
}
```

#### Cancel Orders
```json
{
  "operation": "cancel_orders",
  "orderIds": ["order1", "order2"],
  "data": {
    "reason": "Inventory shortage"
  }
}
```

### Bulk Operation Results

```json
{
  "results": {
    "successful": [
      {
        "orderId": "order1",
        "orderNumber": "AFM-20240101-ABC123",
        "operation": "mark_shipped",
        "status": "shipped",
        "emailSent": true
      }
    ],
    "failed": [
      {
        "orderId": "order2",
        "error": "Order already shipped"
      }
    ],
    "total": 2
  }
}
```

## Order Notes System

### Note Types

- **Internal**: Admin-only notes
- **Customer**: Customer-visible notes
- **System**: System-generated notes

### Note Structure

```typescript
interface OrderNote {
  id: string
  type: 'internal' | 'customer' | 'system'
  content: string
  author: string
  createdAt: string
  updatedAt?: string
  isVisibleToCustomer: boolean
}
```

### Note Permissions

- **Internal Notes**: Only visible to admins
- **Customer Notes**: Visible to both admins and customers
- **System Notes**: Auto-generated, visible to admins

## Admin Dashboard

### Features

1. **Order Listing**: Paginated order list with filters
2. **Search**: Search by order number, customer name, email
3. **Filters**: Filter by status, payment status, date range
4. **Bulk Actions**: Select multiple orders for bulk operations
5. **Order Details**: Detailed order view with all information
6. **Notes Management**: Add, edit, delete order notes
7. **Refund Processing**: Process full or partial refunds

### Dashboard Components

#### AdminOrderDashboard
- Main order management interface
- Filtering and search capabilities
- Bulk operation controls
- Order status overview

#### OrderDetailsModal
- Detailed order information
- Status update controls
- Notes management
- Refund processing
- Customer communication history

## Best Practices

### Order Management

1. **Status Updates**: Always update order status in logical sequence
2. **Inventory Management**: Ensure inventory is properly reserved and restored
3. **Customer Communication**: Send email notifications for status changes
4. **Data Integrity**: Validate all status transitions
5. **Audit Trail**: Maintain comprehensive order history

### Refund Processing

1. **Validation**: Always validate refund amounts
2. **Documentation**: Record refund reasons
3. **Customer Notification**: Notify customers of refund status
4. **Inventory**: Consider inventory implications for refunds

### Bulk Operations

1. **Batch Size**: Limit bulk operations to 100 orders maximum
2. **Error Handling**: Handle partial failures gracefully
3. **Notifications**: Provide clear feedback on operation results
4. **Logging**: Log all bulk operations for audit purposes

### Notes Management

1. **Clarity**: Write clear, actionable notes
2. **Visibility**: Use appropriate note types for visibility
3. **Timestamps**: Always include timestamps for notes
4. **Authorship**: Clearly identify note authors

## Error Handling

### Common Error Scenarios

1. **Invalid Status Transition**: Order cannot transition to requested status
2. **Insufficient Inventory**: Not enough stock for order
3. **Payment Failure**: Stripe payment processing failed
4. **Refund Exceeds Amount**: Refund amount exceeds available amount
5. **Order Not Found**: Order ID does not exist

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Invalid status transition from shipped to pending",
    "code": "INVALID_STATUS_TRANSITION",
    "statusCode": 400
  }
}
```

## Security Considerations

1. **Access Control**: Only authenticated admins can modify orders
2. **Data Validation**: All input data is validated
3. **Audit Logging**: All order modifications are logged
4. **Payment Security**: Stripe handles sensitive payment data
5. **Customer Data**: Customer information is protected

## Monitoring & Analytics

### Key Metrics

1. **Order Volume**: Number of orders per day/week/month
2. **Status Distribution**: Breakdown of orders by status
3. **Average Order Value**: Mean order value over time
4. **Refund Rate**: Percentage of orders refunded
5. **Processing Time**: Time from order to delivery

### Logging

All order operations are logged with:
- Timestamp
- User ID (if applicable)
- Operation type
- Order ID
- Success/failure status
- Error details (if applicable)

## Integration Points

### Email System
- Order confirmation emails
- Status update notifications
- Refund confirmations
- Admin alerts

### Inventory System
- Automatic inventory reservation
- Inventory restoration on cancellation
- Low stock alerts

### Payment System
- Stripe payment processing
- Refund processing
- Payment status updates

### Customer System
- Customer order history
- Customer communication
- Customer preferences

## Troubleshooting

### Common Issues

1. **Order Status Not Updating**
   - Check status transition validity
   - Verify user permissions
   - Check for validation errors

2. **Email Notifications Not Sending**
   - Verify email configuration
   - Check email queue status
   - Validate customer email addresses

3. **Refund Processing Failures**
   - Verify Stripe configuration
   - Check payment intent validity
   - Validate refund amounts

4. **Inventory Issues**
   - Check inventory tracking settings
   - Verify product availability
   - Review inventory restoration logic

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=orders:*
```

This will provide detailed logging for all order-related operations.

## API Rate Limits

- **Order Creation**: 100 requests per minute
- **Order Updates**: 200 requests per minute
- **Bulk Operations**: 10 requests per minute
- **Refund Processing**: 50 requests per minute

## Support

For technical support or questions about the order management system:

1. Check the logs for error details
2. Review the API documentation
3. Contact the development team
4. Submit an issue in the project repository

---

*This guide is maintained as part of the AfriMall e-commerce platform. Last updated: January 2024*
